'use server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { bankAccounts, bankTransactions } from '@/lib/db/schema/bank';
import { requireTenant } from '@/lib/auth/get-tenant';

export async function getBankAccounts() {
  try { const tenant = await requireTenant(); const data = await db.select({ id: bankAccounts.id, bankName: bankAccounts.bankName,
    accountName: bankAccounts.accountName, iban: bankAccounts.iban, currency: bankAccounts.currency, currentBalance: bankAccounts.currentBalance })
    .from(bankAccounts).where(eq(bankAccounts.tenantId, tenant.id)); return { success: true, data };
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : String(error) }; }
}

export async function getBankTransactions(accountId?: string) {
  try { const tenant = await requireTenant(); const condition = accountId ? and(eq(bankTransactions.tenantId, tenant.id), eq(bankTransactions.accountId, accountId)) : eq(bankTransactions.tenantId, tenant.id);
    const data = await db.select({ id: bankTransactions.id, transactionDate: bankTransactions.transactionDate, description: bankTransactions.description,
      amount: bankTransactions.amount, type: bankTransactions.type, status: bankTransactions.status }).from(bankTransactions).where(condition)
      .orderBy(desc(bankTransactions.transactionDate)).limit(50); return { success: true, data };
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : String(error) }; }
}
