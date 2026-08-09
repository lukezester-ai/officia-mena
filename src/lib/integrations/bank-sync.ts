import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { bankAccounts, bankTransactions } from '@/lib/db/schema/bank';
import { integrationEvents } from '@/lib/db/schema/ai_orchestration';
import { fetchOpenBankingTransactions } from './connectors';

export async function syncOpenBankingForTenant(tenantId: string, since = new Date(Date.now() - 30 * 86_400_000).toISOString()) {
  const remote = await fetchOpenBankingTransactions(tenantId, since);
  let imported = 0; let skipped = 0;
  for (const item of remote) {
    const [account] = await db.select({ id: bankAccounts.id }).from(bankAccounts)
      .where(and(eq(bankAccounts.id, item.accountId), eq(bankAccounts.tenantId, tenantId))).limit(1);
    if (!account) { skipped++; continue; }
    const [seen] = await db.select({ id: integrationEvents.id }).from(integrationEvents)
      .where(and(eq(integrationEvents.tenantId, tenantId), eq(integrationEvents.provider, 'banking'), eq(integrationEvents.externalId, item.id))).limit(1);
    if (seen) { skipped++; continue; }
    await db.transaction(async (tx) => {
      await tx.insert(bankTransactions).values({ tenantId, accountId: account.id, transactionDate: new Date(item.bookedAt),
        description: item.description, amount: Math.abs(item.amount).toFixed(2), type: item.direction === 'credit' ? 'IN' : 'OUT',
        reference: item.id, status: 'pending' });
      await tx.insert(integrationEvents).values({ tenantId, provider: 'banking', externalId: item.id, eventType: 'transaction_imported',
        status: 'completed', metadata: { accountId: account.id, currency: item.currency } });
    });
    imported++;
  }
  return { received: remote.length, imported, skipped };
}
