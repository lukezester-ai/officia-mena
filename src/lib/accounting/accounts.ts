import { db } from '@/lib/db/db';
import { accounts } from '@/lib/db/schema/accounting';
import { eq, and } from 'drizzle-orm';
import { DEFAULT_CHART_OF_ACCOUNTS } from './default-chart';

export async function ensureDefaultChartOfAccounts(tenantId: string) {
  const values = DEFAULT_CHART_OF_ACCOUNTS.map((account) => ({
    tenantId,
    code: account.code,
    name: account.name,
    type: account.type,
    normalBalance: account.normalBalance,
    description: account.description,
    isSystem: true,
    isActive: true,
  }));

  await db
    .insert(accounts)
    .values(values)
    .onConflictDoNothing({ target: [accounts.tenantId, accounts.code] });
}

export async function getAccountIdByCode(tenantId: string, code: string) {
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, code)))
    .limit(1);

  if (!account) {
    throw new Error(`Missing account ${code}. Seed the chart of accounts first.`);
  }

  return account.id;
}
