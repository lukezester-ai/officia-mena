import { db } from '@/lib/db/db';
import { customReports, reportSnapshots } from '@/lib/db/schema/accounting_reports';
import { accounts, journalEntries, journalLines } from '@/lib/db/schema/accounting';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { getAccountingOverview } from './overview';

export type CustomReportType = 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'custom';
export type PeriodType = 'monthly' | 'quarterly' | 'annual';

export interface CustomReportConfig {
  reportType: CustomReportType;
  accountIds?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  groupBy?: 'account_type' | 'account' | 'none';
  includeBudget?: boolean;
  currency?: string;
}

export interface PeriodComparison {
  currentPeriod: {
    startDate: string;
    endDate: string;
    data: any;
  };
  previousPeriod: {
    startDate: string;
    endDate: string;
    data: any;
  };
  variance: {
    percentage: string;
    absolute: string;
  };
}

export async function createCustomReport(
  tenantId: string,
  name: string,
  description: string | null,
  reportType: CustomReportType,
  configuration: CustomReportConfig,
  userId: string,
  isSystem = false
) {
  const [report] = await db
    .insert(customReports)
    .values({
      tenantId,
      name,
      description,
      reportType,
      configuration: configuration as any,
      createdByUserId: userId,
      isSystem,
      isActive: true,
    })
    .returning();

  return report;
}

export async function getCustomReports(tenantId: string) {
  return db
    .select()
    .from(customReports)
    .where(and(eq(customReports.tenantId, tenantId), eq(customReports.isActive, true)))
    .orderBy(desc(customReports.createdAt));
}

export async function generateCustomReport(
  tenantId: string,
  reportId: string
) {
  const [report] = await db
    .select()
    .from(customReports)
    .where(and(eq(customReports.id, reportId), eq(customReports.tenantId, tenantId)))
    .limit(1);

  if (!report) {
    throw new Error('Report not found');
  }

  const config = report.configuration as CustomReportConfig;

  // Get base accounting data
  const baseData = await getAccountingOverview(tenantId);

  // Apply custom filters based on configuration
  let filteredData = baseData;

  if (config.accountIds && config.accountIds.length > 0) {
    filteredData = {
      ...baseData,
      trialBalance: baseData.trialBalance.filter((account) =>
        config.accountIds!.includes(account.accountId)
      ),
    };
  }

  // Group data based on configuration
  if (config.groupBy === 'account_type') {
    const groupedData = groupByAccountType(filteredData.trialBalance);
    return {
      ...filteredData,
      groupedData,
    };
  }

  return filteredData;
}

function groupByAccountType(trialBalance: any[]) {
  return trialBalance.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = [];
    }
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, any[]>);
}

export async function generatePeriodComparison(
  tenantId: string,
  currentStartDate: string,
  currentEndDate: string
): Promise<PeriodComparison> {
  // Calculate previous period dates
  const start = new Date(currentStartDate);
  const end = new Date(currentEndDate);
  const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - daysDiff * 24 * 60 * 60 * 1000);

  // Get current period data
  const currentData = await getAccountingOverview(tenantId);

  // Get previous period data (simplified - in real implementation would filter by date)
  const previousData = await getAccountingOverview(tenantId);

  // Calculate variance
  const currentRevenue = Number(currentData.financialStatements.profitAndLoss.revenue);
  const previousRevenue = Number(previousData.financialStatements.profitAndLoss.revenue);

  const variancePercentage = previousRevenue > 0
    ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(2)
    : '0.00';
  const varianceAbsolute = (currentRevenue - previousRevenue).toFixed(2);

  return {
    currentPeriod: {
      startDate: currentStartDate,
      endDate: currentEndDate,
      data: currentData,
    },
    previousPeriod: {
      startDate: previousStart.toISOString().split('T')[0],
      endDate: previousEnd.toISOString().split('T')[0],
      data: previousData,
    },
    variance: {
      percentage: variancePercentage,
      absolute: varianceAbsolute,
    },
  };
}

export async function createReportSnapshot(
  tenantId: string,
  reportType: string,
  periodType: PeriodType,
  periodStart: Date,
  periodEnd: Date,
  data: any
) {
  const [snapshot] = await db
    .insert(reportSnapshots)
    .values({
      tenantId,
      reportType,
      periodType,
      periodStart,
      periodEnd,
      data: data as any,
    })
    .returning();

  return snapshot;
}

export async function getReportSnapshots(
  tenantId: string,
  reportType?: string,
  limit = 12
) {
  const query = db
    .select()
    .from(reportSnapshots)
    .where(eq(reportSnapshots.tenantId, tenantId));

  if (reportType) {
    query.where(and(eq(reportSnapshots.tenantId, tenantId), eq(reportSnapshots.reportType, reportType)));
  }

  return query.orderBy(desc(reportSnapshots.periodStart)).limit(limit);
}

export async function deleteCustomReport(tenantId: string, reportId: string) {
  await db
    .update(customReports)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(customReports.id, reportId), eq(customReports.tenantId, tenantId)));
}
