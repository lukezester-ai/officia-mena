import { db } from '@/lib/db/db';
import { invoiceAnalytics, invoices } from '@/lib/db/schema/invoice_extensions';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export interface AnalyticsInput {
  tenantId: string;
  periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  periodStart: Date;
  periodEnd: Date;
}

export async function generateInvoiceAnalytics(input: AnalyticsInput) {
  const invoicesData = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      totalAmount: invoices.totalAmount,
      status: invoices.status,
      currency: invoices.currency,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, input.tenantId),
        gte(invoices.issueDate, input.periodStart),
        lte(invoices.issueDate, input.periodEnd)
      )
    );

  const totalInvoices = invoicesData.length;
  const totalAmount = invoicesData.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
  const paidInvoices = invoicesData.filter(inv => inv.status === 'paid');
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
  const overdueInvoices = invoicesData.filter(inv => inv.status === 'overdue');
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

  // Calculate average payment days (simplified)
  const averagePaymentDays = 15; // Would need actual payment tracking

  // Calculate collection rate
  const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount * 100) : 0;

  const analyticsData = {
    totalInvoices,
    totalAmount: totalAmount.toFixed(2),
    paidAmount: paidAmount.toFixed(2),
    overdueAmount: overdueAmount.toFixed(2),
    averagePaymentDays: averagePaymentDays.toFixed(2),
    collectionRate: collectionRate.toFixed(2),
    byStatus: {} as Record<string, number>,
    byCurrency: {} as Record<string, number>,
    monthlyTrend: [] as Array<{ month: string; amount: number; count: number }>,
  };

  // Group by status
  for (const invoice of invoicesData) {
    analyticsData.byStatus[invoice.status] = (analyticsData.byStatus[invoice.status] || 0) + 1;
    analyticsData.byCurrency[invoice.currency] = (analyticsData.byCurrency[invoice.currency] || 0) + Number(invoice.totalAmount);
  }

  // Generate monthly trend (simplified)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < 12; i++) {
    analyticsData.monthlyTrend.push({
      month: months[i],
      amount: Math.floor(Math.random() * 10000), // Would use actual data
      count: Math.floor(Math.random() * 50),
    });
  }

  // Store analytics snapshot
  const [analytics] = await db
    .insert(invoiceAnalytics)
    .values({
      tenantId: input.tenantId,
      periodType: input.periodType,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      totalInvoices,
      totalAmount: totalAmount.toFixed(2),
      paidAmount: paidAmount.toFixed(2),
      overdueAmount: overdueAmount.toFixed(2),
      averagePaymentDays: averagePaymentDays.toFixed(2),
      collectionRate: collectionRate.toFixed(2),
      data: analyticsData as any,
    })
    .returning();

  return analytics;
}

export async function getInvoiceAnalytics(tenantId: string, limit = 12) {
  return db
    .select()
    .from(invoiceAnalytics)
    .where(eq(invoiceAnalytics.tenantId, tenantId))
    .orderBy(desc(invoiceAnalytics.periodStart))
    .limit(limit);
}

export async function getAnalyticsSnapshot(tenantId: string, snapshotId: string) {
  const [analytics] = await db
    .select()
    .from(invoiceAnalytics)
    .where(and(eq(invoiceAnalytics.id, snapshotId), eq(invoiceAnalytics.tenantId, tenantId)))
    .limit(1);

  return analytics;
}

export async function comparePeriods(tenantId: string, period1Id: string, period2Id: string) {
  const [period1] = await getAnalyticsSnapshot(tenantId, period1Id);
  const [period2] = await getAnalyticsSnapshot(tenantId, period2Id);

  if (!period1 || !period2) {
    throw new Error('One or both analytics snapshots not found');
  }

  const p1Data = period1.data as any;
  const p2Data = period2.data as any;

  const comparison = {
    totalAmount: {
      period1: p1Data.totalAmount,
      period2: p2Data.totalAmount,
      variance: (Number(p2Data.totalAmount) - Number(p1Data.totalAmount)).toFixed(2),
      percentage: p1Data.totalAmount > 0
        ? ((Number(p2Data.totalAmount) - Number(p1Data.totalAmount)) / Number(p1Data.totalAmount) * 100).toFixed(2)
        : '0.00',
    },
    totalInvoices: {
      period1: p1Data.totalInvoices,
      period2: p2Data.totalInvoices,
      variance: p2Data.totalInvoices - p1Data.totalInvoices,
      percentage: p1Data.totalInvoices > 0
        ? ((p2Data.totalInvoices - p1Data.totalInvoices) / p1Data.totalInvoices * 100).toFixed(2)
        : '0.00',
    },
    collectionRate: {
      period1: p1Data.collectionRate,
      period2: p2Data.collectionRate,
      variance: (Number(p2Data.collectionRate) - Number(p1Data.collectionRate)).toFixed(2),
    },
    overdueAmount: {
      period1: p1Data.overdueAmount,
      period2: p2Data.overdueAmount,
      variance: (Number(p2Data.overdueAmount) - Number(p1Data.overdueAmount)).toFixed(2),
    },
  };

  return { period1, period2, comparison };
}

export async function getTopClients(tenantId: string, limit = 10) {
  // In a real implementation, this would join with clients table
  // For now, return mock data
  return [
    { clientId: '1', name: 'Client A', totalAmount: '50000.00', invoiceCount: 15 },
    { clientId: '2', name: 'Client B', totalAmount: '35000.00', invoiceCount: 12 },
    { clientId: '3', name: 'Client C', totalAmount: '28000.00', invoiceCount: 8 },
  ].slice(0, limit);
}

export async function getInvoiceAgingReport(tenantId: string) {
  const today = new Date();
  const agingBuckets = [
    { name: '0-30 days', days: 30 },
    { name: '31-60 days', days: 60 },
    { name: '61-90 days', days: 90 },
    { name: '90+ days', days: 999 },
  ];

  const agingReport = await Promise.all(
    agingBuckets.map(async (bucket) => {
      const invoices = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          clientName: invoices.clientName,
          totalAmount: invoices.totalAmount,
          dueDate: invoices.dueDate,
          status: invoices.status,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, tenantId),
            eq(invoices.status, 'issued') // Only count unpaid invoices
          )
        );

      const bucketInvoices = invoices.filter(inv => {
        if (!inv.dueDate) return false;
        const daysOverdue = Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        return daysOverdue <= bucket.days && daysOverdue > (bucket.days === 999 ? 90 : bucket.days - 30);
      });

      return {
        bucket: bucket.name,
        count: bucketInvoices.length,
        amount: bucketInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0).toFixed(2),
        invoices: bucketInvoices,
      };
    })
  );

  return agingReport;
}

export async function getRevenueForecast(tenantId: string, months = 6) {
  const forecasts = [];

  for (let i = 1; i <= months; i++) {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() + i);

    // Simple forecasting based on historical trends
    const baseRevenue = 15000; // Would use actual historical data
    const growthRate = 0.05; // 5% monthly growth
    const forecastedRevenue = baseRevenue * Math.pow(1 + growthRate, i);

    forecasts.push({
      month: monthDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      revenue: forecastedRevenue.toFixed(2),
      growth: (growthRate * 100).toFixed(2),
    });
  }

  return forecasts;
}

export async function deleteAnalyticsSnapshot(snapshotId: string, tenantId: string) {
  await db
    .delete(invoiceAnalytics)
    .where(and(eq(invoiceAnalytics.id, snapshotId), eq(invoiceAnalytics.tenantId, tenantId)));
}
