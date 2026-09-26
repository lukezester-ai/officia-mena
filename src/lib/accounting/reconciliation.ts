import { db } from '@/lib/db/db';
import { reconciliationRules, bankTransactions, journalLines } from '@/lib/db/schema/accounting_reports';
import { and, eq, or, like } from 'drizzle-orm';

export interface ReconciliationRuleInput {
  tenantId: string;
  name: string;
  ruleType: 'amount_match' | 'date_range' | 'description_match';
  configuration: any;
  userId: string;
}

export interface ReconciliationMatch {
  bankTransactionId: string;
  journalLineId: string;
  matchType: string;
  confidence: number;
  bankAmount: string;
  journalAmount: string;
  bankDate: Date;
  journalDate: Date;
}

export async function createReconciliationRule(input: ReconciliationRuleInput) {
  const [rule] = await db
    .insert(reconciliationRules)
    .values({
      tenantId: input.tenantId,
      name: input.name,
      ruleType: input.ruleType,
      configuration: input.configuration,
      createdByUserId: input.userId,
      isActive: true,
    })
    .returning();

  return rule;
}

export async function getReconciliationRules(tenantId: string) {
  return db
    .select()
    .from(reconciliationRules)
    .where(and(eq(reconciliationRules.tenantId, tenantId), eq(reconciliationRules.isActive, true)));
}

export async function toggleReconciliationRule(ruleId: string, tenantId: string) {
  const [rule] = await db
    .select()
    .from(reconciliationRules)
    .where(and(eq(reconciliationRules.id, ruleId), eq(reconciliationRules.tenantId, tenantId)))
    .limit(1);

  if (!rule) {
    throw new Error('Rule not found');
  }

  const [updated] = await db
    .update(reconciliationRules)
    .set({ isActive: !rule.isActive, updatedAt: new Date() })
    .where(eq(reconciliationRules.id, ruleId))
    .returning();

  return updated;
}

export async function autoReconcileBankTransactions(tenantId: string): Promise<ReconciliationMatch[]> {
  const rules = await getReconciliationRules(tenantId);
  const matches: ReconciliationMatch[] = [];

  // Get pending bank transactions
  const pendingTransactions = await db
    .select()
    .from(bankTransactions)
    .where(and(eq(bankTransactions.tenantId, tenantId), eq(bankTransactions.status, 'pending')));

  // Get journal lines for cash account
  const cashJournalLines = await db
    .select()
    .from(journalLines)
    .where(eq(journalLines.tenantId, tenantId));

  for (const transaction of pendingTransactions) {
    for (const rule of rules) {
      const match = await applyReconciliationRule(transaction, cashJournalLines, rule);
      if (match) {
        matches.push(match);
      }
    }
  }

  return matches;
}

async function applyReconciliationRule(
  transaction: any,
  journalLines: any[],
  rule: any
): Promise<ReconciliationMatch | null> {
  const config = rule.configuration;

  switch (rule.ruleType) {
    case 'amount_match':
      return matchByAmount(transaction, journalLines, config);
    case 'date_range':
      return matchByDateRange(transaction, journalLines, config);
    case 'description_match':
      return matchByDescription(transaction, journalLines, config);
    default:
      return null;
  }
}

function matchByAmount(transaction: any, journalLines: any[], config: any): ReconciliationMatch | null {
  const tolerance = config.tolerance || 0.01;
  const bankAmount = Number(transaction.amount);

  for (const line of journalLines) {
    const journalAmount = Number(line.debit) - Number(line.credit);

    if (Math.abs(bankAmount - journalAmount) <= tolerance) {
      return {
        bankTransactionId: transaction.id,
        journalLineId: line.id,
        matchType: 'amount_match',
        confidence: 0.9,
        bankAmount: bankAmount.toFixed(2),
        journalAmount: journalAmount.toFixed(2),
        bankDate: transaction.transactionDate,
        journalDate: new Date(), // Would need to get from journal entry
      };
    }
  }

  return null;
}

function matchByDateRange(transaction: any, journalLines: any[], config: any): ReconciliationMatch | null {
  const daysTolerance = config.daysTolerance || 3;
  const bankDate = new Date(transaction.transactionDate);
  const minDate = new Date(bankDate.getTime() - daysTolerance * 24 * 60 * 60 * 1000);
  const maxDate = new Date(bankDate.getTime() + daysTolerance * 24 * 60 * 60 * 1000);

  for (const line of journalLines) {
    const journalDate = new Date(); // Would need to get from journal entry

    if (journalDate >= minDate && journalDate <= maxDate) {
      return {
        bankTransactionId: transaction.id,
        journalLineId: line.id,
        matchType: 'date_range',
        confidence: 0.7,
        bankAmount: transaction.amount,
        journalAmount: (Number(line.debit) - Number(line.credit)).toFixed(2),
        bankDate,
        journalDate,
      };
    }
  }

  return null;
}

function matchByDescription(transaction: any, journalLines: any[], config: any): ReconciliationMatch | null {
  const keywords = config.keywords || [];

  for (const line of journalLines) {
    const description = line.description || '';

    for (const keyword of keywords) {
      if (description.toLowerCase().includes(keyword.toLowerCase())) {
        return {
          bankTransactionId: transaction.id,
          journalLineId: line.id,
          matchType: 'description_match',
          confidence: 0.6,
          bankAmount: transaction.amount,
          journalAmount: (Number(line.debit) - Number(line.credit)).toFixed(2),
          bankDate: new Date(transaction.transactionDate),
          journalDate: new Date(), // Would need to get from journal entry
        };
      }
    }
  }

  return null;
}

export async function manualReconcile(
  tenantId: string,
  bankTransactionId: string,
  journalLineId: string
) {
  // Update bank transaction status
  await db
    .update(bankTransactions)
    .set({ status: 'reconciled' })
    .where(and(eq(bankTransactions.id, bankTransactionId), eq(bankTransactions.tenantId, tenantId)));

  // Could add reconciliation record to track this match
  return { success: true };
}

export async function getReconciliationStatus(tenantId: string) {
  const pendingTransactions = await db
    .select()
    .from(bankTransactions)
    .where(and(eq(bankTransactions.tenantId, tenantId), eq(bankTransactions.status, 'pending')));

  const reconciledTransactions = await db
    .select()
    .from(bankTransactions)
    .where(and(eq(bankTransactions.tenantId, tenantId), eq(bankTransactions.status, 'reconciled')));

  const totalPending = pendingTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalReconciled = reconciledTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    pendingCount: pendingTransactions.length,
    pendingAmount: totalPending.toFixed(2),
    reconciledCount: reconciledTransactions.length,
    reconciledAmount: totalReconciled.toFixed(2),
    reconciliationRate: pendingTransactions.length + reconciledTransactions.length > 0
      ? (reconciledTransactions.length / (pendingTransactions.length + reconciledTransactions.length) * 100).toFixed(2)
      : '0.00',
  };
}

export async function deleteReconciliationRule(ruleId: string, tenantId: string) {
  await db
    .update(reconciliationRules)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(reconciliationRules.id, ruleId), eq(reconciliationRules.tenantId, tenantId)));
}
