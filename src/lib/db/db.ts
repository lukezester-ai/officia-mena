import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

function createDb() {
  const connectionString = process.env.STORAGE_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Database URL environment variable is required.');
  }
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

let _db: PostgresJsDatabase<typeof schema> | null = null;

export const db = new Proxy<PostgresJsDatabase<typeof schema>>({} as unknown as PostgresJsDatabase<typeof schema>, {
  get(_, prop) {
    if (!_db) _db = createDb();
    return Reflect.get(_db, prop);
  },
  set(_, prop, value) {
    if (!_db) _db = createDb();
    return Reflect.set(_db, prop, value);
  },
});
