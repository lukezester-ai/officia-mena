import { and, desc, eq } from 'drizzle-orm';
import { getAccountingOverview } from '@/lib/accounting';
import { requireTenant } from '@/lib/auth/get-tenant';
import { db } from '@/lib/db/db';
import { aiInboxItems } from '@/lib/db/schema/ai_inbox';
import { getErrorMessage } from '@/lib/errors';

export async function GET() {
  try {
    const tenant = await requireTenant();
    const [overview, alerts] = await Promise.all([
      getAccountingOverview(tenant.id),
      db.select({
        id: aiInboxItems.id,
        title: aiInboxItems.title,
        description: aiInboxItems.description,
        priority: aiInboxItems.priority,
        confidence: aiInboxItems.confidence,
        createdAt: aiInboxItems.createdAt,
      }).from(aiInboxItems)
        .where(and(eq(aiInboxItems.tenantId, tenant.id), eq(aiInboxItems.status, 'open')))
        .orderBy(desc(aiInboxItems.createdAt))
        .limit(5),
    ]);

    const liveAlerts: Array<{ id: string; title: string; description: string; priority: string; confidence: string; createdAt: Date }> = [];
    if (overview.controlChecks.integrity.unbalancedEntryCount > 0) liveAlerts.push({ id: 'live-unbalanced', title: 'Небалансирани счетоводни записи', description: `${overview.controlChecks.integrity.unbalancedEntryCount} записа нарушават дебит/кредит баланса.`, priority: 'critical', confidence: '1.00', createdAt: new Date() });
    if (overview.controlChecks.postingGaps.total > 0) liveAlerts.push({ id: 'live-posting-gaps', title: 'Липсващи осчетоводявания', description: `${overview.controlChecks.postingGaps.total} бизнес документа нямат очакван journal entry.`, priority: 'high', confidence: '1.00', createdAt: new Date() });
    if (overview.controlChecks.bankReconciliation.pendingCount > 0) liveAlerts.push({ id: 'live-bank', title: 'Банкови операции за съпоставяне', description: `${overview.controlChecks.bankReconciliation.pendingCount} транзакции очакват reconciliation.`, priority: 'high', confidence: '1.00', createdAt: new Date() });
    if (overview.controlChecks.inventoryCosting.missingCostCount > 0) liveAlerts.push({ id: 'live-costs', title: 'Продукти без себестойност', description: `${overview.controlChecks.inventoryCosting.missingCostCount} налични продукта нямат надеждна cost price.`, priority: 'high', confidence: '1.00', createdAt: new Date() });
    if (Number(overview.aging.receivables.buckets.daysOver90) > 0) liveAlerts.push({ id: 'live-aging', title: 'Вземания над 90 дни', description: `${overview.aging.receivables.buckets.daysOver90} SAR са просрочени повече от 90 дни.`, priority: 'critical', confidence: '1.00', createdAt: new Date() });

    return Response.json({
      company: { id: tenant.id, name: tenant.name, country: tenant.country },
      generatedAt: new Date().toISOString(),
      metrics: {
        revenue: overview.financialStatements.profitAndLoss.revenue,
        netIncome: overview.financialStatements.profitAndLoss.netIncome,
        cash: overview.cashFlow.endingCash,
        receivables: overview.aging.receivables.total,
        payables: overview.aging.payables.total,
        vat: overview.vatControl.netVat,
        controlIssues: overview.controlChecks.postingGaps.total + overview.controlChecks.integrity.unbalancedEntryCount,
      },
      alerts: [...liveAlerts, ...alerts].slice(0, 8),
      sources: [
        { label: 'General ledger', href: '/dashboard/accounting' },
        { label: 'Invoices', href: '/dashboard/invoices' },
        { label: 'Expenses', href: '/dashboard/expenses' },
      ],
    });
  } catch (error: unknown) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
