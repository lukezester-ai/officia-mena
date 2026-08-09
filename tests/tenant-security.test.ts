import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), select: vi.fn(), insert: vi.fn() }));
vi.mock('@/auth', () => ({ auth: mocks.auth }));
vi.mock('@/lib/db/db', () => ({ db: { select: mocks.select, insert: mocks.insert } }));

import { getTenant, requireTenant } from '@/lib/auth/get-tenant';
import { createMaestroTools } from '@/lib/ai/tools';

function queryResult(rows: unknown[]) {
  const builder = { from: vi.fn(), where: vi.fn(), limit: vi.fn() };
  builder.from.mockReturnValue(builder); builder.where.mockReturnValue(builder); builder.limit.mockResolvedValue(rows);
  return builder;
}

describe('tenant security regressions', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fails closed when there is no authenticated session', async () => {
    mocks.auth.mockResolvedValue(null);
    await expect(getTenant()).resolves.toBeNull();
    await expect(requireTenant()).rejects.toThrow('Unauthorized');
    expect(mocks.select).not.toHaveBeenCalled(); expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('does not provision or attach a fallback tenant for an unprovisioned user', async () => {
    mocks.auth.mockResolvedValue({ user: { email: 'user@example.com' } });
    mocks.select.mockReturnValueOnce(queryResult([{ id: crypto.randomUUID(), tenantId: null }]));
    await expect(getTenant()).resolves.toBeNull();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('does not expose tenantId as an LLM-controlled document-search argument', () => {
    const tools = createMaestroTools({ id: crypto.randomUUID(), name: 'Tenant A', country: 'SA', trn: null, crn: '1' },
      { id: crypto.randomUUID(), role: 'member' });
    const search = tools.searchDocuments as unknown as { parameters: { shape: Record<string, unknown> } };
    expect(Object.keys(search.parameters.shape)).toEqual(['query']);
  });
});
