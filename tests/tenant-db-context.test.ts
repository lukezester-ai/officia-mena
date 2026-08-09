import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const execute = vi.fn().mockResolvedValue([]);
  const builder: Record<string, unknown> = {};
  for (const method of ['from', 'where', 'limit', 'orderBy', 'groupBy', 'values', 'set', 'returning', 'onConflictDoNothing', 'onConflictDoUpdate']) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (resolve: (value: unknown) => void) => resolve([{ scoped: true }]);
  const transaction = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback(database));
  const database = { execute, transaction, select: vi.fn(() => builder), insert: vi.fn(() => builder), update: vi.fn(() => builder), delete: vi.fn(() => builder) };
  return { builder, database, execute, transaction };
});

vi.mock('postgres', () => ({ default: vi.fn(() => ({})) }));
vi.mock('drizzle-orm/postgres-js', () => ({ drizzle: vi.fn(() => mocks.database) }));
vi.stubEnv('DATABASE_URL', 'postgres://test:test@localhost:5432/test');

import { db, getTenantContextId, setTenantContext, withTenantContext } from '@/lib/db/db';
import { tenants } from '@/lib/db/schema/tenants';

describe('tenant database context', () => {
  const tenantA = '11111111-1111-4111-8111-111111111111';
  const tenantB = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => vi.clearAllMocks());

  it('executes a scoped query through a transaction with local settings', async () => {
    const rows = await withTenantContext(tenantA, async () => {
      expect(getTenantContextId()).toBe(tenantA);
      return db.select().from(tenants).limit(1);
    });

    expect(rows).toEqual([{ scoped: true }]);
    expect(mocks.transaction).toHaveBeenCalledOnce();
    expect(mocks.execute).toHaveBeenCalledTimes(2);
  });

  it('rejects a tenant switch inside the same async context', async () => {
    await withTenantContext(tenantA, async () => {
      expect(() => setTenantContext(tenantB)).toThrow('Tenant context mismatch');
    });
  });

  it('rejects malformed tenant identifiers before opening a transaction', async () => {
    expect(() => withTenantContext('not-a-uuid', async () => true)).toThrow('Invalid tenant context');
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
