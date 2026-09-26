import { db } from '@/lib/db/db';
import { budgets, budgetLines, accounts } from '@/lib/db/schema/accounting_reports';
import { eq, and, inArray } from 'drizzle-orm';
import { getAccountingOverview } from './overview';

export interface BudgetInput {
  tenantId: string;
  name: string;
  description?: string | null;
  fiscalYear: number;
  fiscalMonth?: number | null;
  currency?: string;
  userId: string;
}

export interface BudgetLineInput {
  budgetId: string;
  accountId: string;
  budgetedAmount: number;
  varianceThreshold?: number;
  notes?: string | null;
}

export interface BudgetVsActual {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  budgetedAmount: string;
  actualAmount: string;
  variance: string;
  variancePercentage: string;
  isOverBudget: boolean;
  isUnderBudget: boolean;
  notes?: string | null;
}

export async function createBudget(input: BudgetInput) {
  const [budget] = await db
    .insert(budgets)
    .values({
      tenantId: input.tenantId,
      name: input.name,
      description: input.description,
      fiscalYear: input.fiscalYear,
      fiscalMonth: input.fiscalMonth,
      currency: input.currency || 'SAR',
      status: 'draft',
      createdByUserId: input.userId,
    })
    .returning();

  return budget;
}

export async function getBudgets(tenantId: string, fiscalYear?: number) {
  const query = db
    .select()
    .from(budgets)
    .where(eq(budgets.tenantId, tenantId));

  if (fiscalYear) {
    query.where(and(eq(budgets.tenantId, tenantId), eq(budgets.fiscalYear, fiscalYear)));
  }

  return query.orderBy(budgets.fiscalYear, budgets.fiscalMonth);
}

export async function getBudget(budgetId: string, tenantId: string) {
  const [budget] = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.id, budgetId), eq(budgets.tenantId, tenantId)))
    .limit(1);

  if (!budget) {
    throw new Error('Budget not found');
  }

  const lines = await db
    .select()
    .from(budgetLines)
    .where(eq(budgetLines.budgetId, budgetId));

  return { ...budget, lines };
}

export async function addBudgetLine(input: BudgetLineInput) {
  const [line] = await db
    .insert(budgetLines)
    .values({
      budgetId: input.budgetId,
      accountId: input.accountId,
      budgetedAmount: input.budgetedAmount.toFixed(2),
      varianceThreshold: input.varianceThreshold?.toFixed(2) || '10.00',
      notes: input.notes,
    })
    .returning();

  return line;
}

export async function updateBudgetLine(
  lineId: string,
  budgetedAmount: number,
  varianceThreshold?: number,
  notes?: string | null
) {
  const [line] = await db
    .update(budgetLines)
    .set({
      budgetedAmount: budgetedAmount.toFixed(2),
      varianceThreshold: varianceThreshold?.toFixed(2),
      notes,
      updatedAt: new Date(),
    })
    .where(eq(budgetLines.id, lineId))
    .returning();

  return line;
}

export async function approveBudget(budgetId: string, tenantId: string, userId: string) {
  const [budget] = await db
    .update(budgets)
    .set({
      status: 'active',
      approvedByUserId: userId,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(budgets.id, budgetId), eq(budgets.tenantId, tenantId)))
    .returning();

  return budget;
}

export async function getBudgetVsActual(
  budgetId: string,
  tenantId: string
): Promise<BudgetVsActual[]> {
  const budget = await getBudget(budgetId, tenantId);
  const accountingData = await getAccountingOverview(tenantId);

  const accountMap = new Map(
    accountingData.trialBalance.map((account) => [account.accountId, account])
  );

  const budgetVsActual: BudgetVsActual[] = [];

  for (const line of budget.lines) {
    const account = accountMap.get(line.accountId);
    if (!account) continue;

    const budgetedAmount = Number(line.budgetedAmount);
    const actualAmount = Number(account.balance);
    const variance = actualAmount - budgetedAmount;
    const variancePercentage = budgetedAmount > 0
      ? (variance / budgetedAmount * 100).toFixed(2)
      : '0.00';

    const isOverBudget = account.type === 'expense' && variance > 0;
    const isUnderBudget = account.type === 'revenue' && variance < 0;

    budgetVsActual.push({
      accountId: account.accountId,
      accountCode: account.code,
      accountName: account.name,
      accountType: account.type,
      budgetedAmount: budgetedAmount.toFixed(2),
      actualAmount: actualAmount.toFixed(2),
      variance: variance.toFixed(2),
      variancePercentage,
      isOverBudget,
      isUnderBudget,
      notes: line.notes,
    });
  }

  return budgetVsActual;
}

export async function getBudgetAlerts(tenantId: string) {
  const activeBudgets = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.tenantId, tenantId), eq(budgets.status, 'active')));

  const alerts: any[] = [];

  for (const budget of activeBudgets) {
    const budgetVsActual = await getBudgetVsActual(budget.id, tenantId);

    for (const item of budgetVsActual) {
      const threshold = Number(item.variancePercentage);
      const limit = budget.lines.find((line) => line.accountId === item.accountId)?.varianceThreshold || 10;

      if (Math.abs(threshold) > limit) {
        alerts.push({
          budgetId: budget.id,
          budgetName: budget.name,
          accountCode: item.accountCode,
          accountName: item.accountName,
          variancePercentage: item.variancePercentage,
          variance: item.variance,
          isOverBudget: item.isOverBudget,
          isUnderBudget: item.isUnderBudget,
        });
      }
    }
  }

  return alerts;
}

export async function deleteBudget(budgetId: string, tenantId: string) {
  await db
    .update(budgets)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(and(eq(budgets.id, budgetId), eq(budgets.tenantId, tenantId)));
}
