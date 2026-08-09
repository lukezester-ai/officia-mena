import { AsyncLocalStorage } from 'node:async_hooks';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

type Database = PostgresJsDatabase<typeof schema>;
type TenantContext = { tenantId: string; database?: Database };
type ChainStep = { kind: 'get'; property: PropertyKey } | { kind: 'call'; property: PropertyKey; args: unknown[] };

const tenantContext = new AsyncLocalStorage<TenantContext>();

function createDb() {
  const connectionString = process.env.STORAGE_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Database URL environment variable is required.');

  const client = postgres(connectionString, {
    prepare: false,
    max: Number(process.env.POSTGRES_POOL_MAX || 10),
    idle_timeout: 20,
    connect_timeout: 15,
  });
  return drizzle(client, { schema });
}

let baseDb: Database | null = null;

function getBaseDb() {
  if (!baseDb) baseDb = createDb();
  return baseDb;
}

function assertTenantId(tenantId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenantId)) {
    throw new Error('Invalid tenant context.');
  }
}

export function setTenantContext(tenantId: string) {
  assertTenantId(tenantId);
  const current = tenantContext.getStore();
  if (current && current.tenantId !== tenantId) throw new Error('Tenant context mismatch.');
  tenantContext.enterWith({ tenantId });
}

export function getTenantContextId() {
  return tenantContext.getStore()?.tenantId ?? null;
}

export function withTenantContext<T>(tenantId: string, callback: () => T): T {
  assertTenantId(tenantId);
  const current = tenantContext.getStore();
  if (current && current.tenantId !== tenantId) throw new Error('Tenant context mismatch.');
  return tenantContext.run({ tenantId }, callback);
}

export async function withTenantDb<T>(tenantId: string, callback: (tenantDb: Database) => Promise<T>): Promise<T> {
  assertTenantId(tenantId);
  const current = tenantContext.getStore();
  if (current && current.tenantId !== tenantId) throw new Error('Tenant context mismatch.');
  if (current?.database) return callback(current.database);

  return getBaseDb().transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`);
    await tx.execute(sql`select set_config('statement_timeout', '30000', true)`);
    const database = tx as unknown as Database;
    return tenantContext.run({ tenantId, database }, () => callback(database));
  });
}

export async function withUserLookupDb<T>(email: string, callback: (authDb: Database) => Promise<T>): Promise<T> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || normalizedEmail.length > 255) throw new Error('Invalid authentication context.');

  return getBaseDb().transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_email', ${normalizedEmail}, true)`);
    await tx.execute(sql`select set_config('statement_timeout', '10000', true)`);
    return callback(tx as unknown as Database);
  });
}

async function executeTenantChain(tenantId: string, steps: ChainStep[]) {
  return withTenantDb(tenantId, async (tenantDb) => {
    let value: unknown = tenantDb;
    for (const step of steps) {
      if (step.kind === 'get') {
        value = Reflect.get(value as object, step.property);
      } else {
        const method = Reflect.get(value as object, step.property);
        value = Reflect.apply(method, value, step.args);
      }
    }
    return await value;
  });
}

function createTenantChain(tenantId: string, steps: ChainStep[]): unknown {
  return new Proxy(function tenantChain() {}, {
    get(_target, property) {
      if (property === 'then') {
        return (resolve: (value: unknown) => void, reject: (reason: unknown) => void) =>
          executeTenantChain(tenantId, steps).then(resolve, reject);
      }
      return createTenantChain(tenantId, [...steps, { kind: 'get', property }]);
    },
    apply(_target, _thisArg, args) {
      const last = steps.at(-1);
      if (!last || last.kind !== 'get') throw new Error('Invalid database operation.');
      return createTenantChain(tenantId, [...steps.slice(0, -1), { kind: 'call', property: last.property, args }]);
    },
  });
}

export const db = new Proxy<Database>({} as Database, {
  get(_target, property) {
    const context = tenantContext.getStore();
    const tenantId = context?.tenantId;
    const database = getBaseDb();

    if (!tenantId) {
      const value = Reflect.get(database, property);
      return typeof value === 'function' ? value.bind(database) : value;
    }

    if (context.database) {
      const value = Reflect.get(context.database, property);
      return typeof value === 'function' ? value.bind(context.database) : value;
    }

    if (property === 'transaction') {
      return <T>(callback: (tx: Database) => Promise<T>) => withTenantDb(tenantId, callback);
    }

    return createTenantChain(tenantId, [{ kind: 'get', property }]);
  },
});
