import { db } from '@/lib/db/db';
import { accounts } from '@/lib/db/schema/accounting';
import { eq, and, desc } from 'drizzle-orm';

export interface CustomAccountInput {
  tenantId: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  normalBalance: 'debit' | 'credit';
  description?: string | null;
  parentId?: string | null;
  userId: string;
}

export async function createCustomAccount(input: CustomAccountInput) {
  // Check if account code already exists for this tenant
  const [existing] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.tenantId, input.tenantId), eq(accounts.code, input.code)))
    .limit(1);

  if (existing) {
    throw new Error(`Account with code ${input.code} already exists`);
  }

  const [account] = await db
    .insert(accounts)
    .values({
      tenantId: input.tenantId,
      code: input.code,
      name: input.name,
      type: input.type,
      normalBalance: input.normalBalance,
      description: input.description,
      isSystem: false,
      isActive: true,
    })
    .returning();

  return account;
}

export async function getCustomAccounts(tenantId: string) {
  return db
    .select()
    .from(accounts)
    .where(and(eq(accounts.tenantId, tenantId), eq(accounts.isSystem, false)))
    .orderBy(accounts.code);
}

export async function getAllAccounts(tenantId: string) {
  return db
    .select()
    .from(accounts)
    .where(and(eq(accounts.tenantId, tenantId), eq(accounts.isActive, true)))
    .orderBy(accounts.code);
}

export async function getAccountHierarchy(tenantId: string) {
  const allAccounts = await getAllAccounts(tenantId);

  // Build hierarchy
  const accountMap = new Map(allAccounts.map(account => [account.id, { ...account, children: [] }]));
  const rootAccounts: any[] = [];

  for (const account of allAccounts) {
    if (account.parentId) {
      const parent = accountMap.get(account.parentId);
      if (parent) {
        parent.children.push(accountMap.get(account.id));
      }
    } else {
      rootAccounts.push(accountMap.get(account.id));
    }
  }

  return rootAccounts;
}

export async function updateAccount(
  accountId: string,
  tenantId: string,
  updates: Partial<{
    name: string;
    description: string | null;
    normalBalance: 'debit' | 'credit';
    isActive: boolean;
  }>
) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.tenantId, tenantId)))
    .limit(1);

  if (!account) {
    throw new Error('Account not found');
  }

  if (account.isSystem) {
    throw new Error('Cannot modify system accounts');
  }

  const [updated] = await db
    .update(accounts)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(accounts.id, accountId))
    .returning();

  return updated;
}

export async function deactivateAccount(accountId: string, tenantId: string) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.tenantId, tenantId)))
    .limit(1);

  if (!account) {
    throw new Error('Account not found');
  }

  if (account.isSystem) {
    throw new Error('Cannot deactivate system accounts');
  }

  const [updated] = await db
    .update(accounts)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(accounts.id, accountId))
    .returning();

  return updated;
}

export async function validateAccountCode(tenantId: string, code: string, excludeId?: string) {
  const query = db
    .select()
    .from(accounts)
    .where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, code)));

  if (excludeId) {
    query.where(and(
      eq(accounts.tenantId, tenantId),
      eq(accounts.code, code),
      // excludeId ? neq(accounts.id, excludeId) : undefined
    ));
  }

  const [existing] = await query.limit(1);
  return !existing;
}

export async function getAccountByCode(tenantId: string, code: string) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, code)))
    .limit(1);

  return account;
}

export async function importAccounts(
  tenantId: string,
  accountsData: Array<{
    code: string;
    name: string;
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    normalBalance: 'debit' | 'credit';
    description?: string;
  }>,
  userId: string
) {
  const results = {
    imported: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (const accountData of accountsData) {
    try {
      const isValid = await validateAccountCode(tenantId, accountData.code);
      if (!isValid) {
        results.skipped++;
        results.errors.push(`Account ${accountData.code} already exists`);
        continue;
      }

      await createCustomAccount({
        tenantId,
        ...accountData,
        userId,
      });
      results.imported++;
    } catch (error) {
      results.errors.push(`Failed to import account ${accountData.code}: ${error}`);
    }
  }

  return results;
}

export async function exportAccounts(tenantId: string) {
  const accounts = await getAllAccounts(tenantId);

  return accounts.map(account => ({
    code: account.code,
    name: account.name,
    type: account.type,
    normalBalance: account.normalBalance,
    description: account.description,
    isSystem: account.isSystem,
    isActive: account.isActive,
  }));
}

export async function getAccountUsageStats(tenantId: string) {
  const allAccounts = await getAllAccounts(tenantId);

  // In a real implementation, this would check journal lines for actual usage
  const usageStats = allAccounts.map(account => ({
    accountId: account.id,
    code: account.code,
    name: account.name,
    isUsed: false, // Would check journal lines
    lastUsed: null, // Would get from journal entries
    transactionCount: 0, // Would count from journal lines
  }));

  return usageStats;
}
