import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { bankAccounts, bankingConsents, bankTransactions } from '@/lib/db/schema/bank';
import { integrationEvents } from '@/lib/db/schema/ai_orchestration';
import { getOpenBankingProvider } from './open-banking-provider';

export async function syncOpenBankingForTenant(tenantId: string, since = new Date(Date.now() - 30 * 86_400_000).toISOString()) {
  const provider = getOpenBankingProvider(tenantId);
  const [consent] = await db.select().from(bankingConsents).where(and(eq(bankingConsents.tenantId, tenantId),
    eq(bankingConsents.provider, provider.name), eq(bankingConsents.status, 'authorized'))).limit(1);
  if (!consent || (consent.expiresAt && consent.expiresAt <= new Date())) throw new Error('An active Open Banking consent is required.');
  const remoteAccounts = await provider.listAccounts();
  const accountIdByExternalId = new Map<string, string>();
  for (const item of remoteAccounts) {
    const [account] = await db.insert(bankAccounts).values({ tenantId, bankName: item.bankName, accountName: item.accountName,
      iban: item.iban, currency: item.currency, currentBalance: item.balance.toFixed(2), status: item.status,
      provider: provider.name, externalAccountId: item.id, lastSyncedAt: new Date() })
      .onConflictDoUpdate({ target: [bankAccounts.tenantId, bankAccounts.provider, bankAccounts.externalAccountId],
        set: { bankName: item.bankName, accountName: item.accountName, iban: item.iban, currency: item.currency,
          currentBalance: item.balance.toFixed(2), status: item.status, lastSyncedAt: new Date() } }).returning({ id: bankAccounts.id });
    accountIdByExternalId.set(item.id, account.id);
  }
  const remote = await provider.listTransactions(since);
  let imported = 0; let skipped = 0;
  for (const item of remote) {
    const accountId = accountIdByExternalId.get(item.accountId);
    if (!accountId) { skipped++; continue; }
    const [seen] = await db.select({ id: integrationEvents.id }).from(integrationEvents)
      .where(and(eq(integrationEvents.tenantId, tenantId), eq(integrationEvents.provider, 'banking'), eq(integrationEvents.externalId, item.id))).limit(1);
    if (seen) { skipped++; continue; }
    await db.transaction(async (tx) => {
      await tx.insert(bankTransactions).values({ tenantId, accountId, transactionDate: new Date(item.bookedAt),
        description: item.description, amount: Math.abs(item.amount).toFixed(2), type: item.direction === 'credit' ? 'IN' : 'OUT',
        reference: item.id, status: 'pending' });
      await tx.insert(integrationEvents).values({ tenantId, provider: 'banking', externalId: item.id, eventType: 'transaction_imported',
        status: 'completed', metadata: { accountId, currency: item.currency, provider: provider.name } });
    });
    imported++;
  }
  await db.update(bankingConsents).set({ lastSyncedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(bankingConsents.id, consent.id), eq(bankingConsents.tenantId, tenantId)));
  return { provider: provider.name, environment: provider.environment, accounts: remoteAccounts.length, received: remote.length, imported, skipped };
}
