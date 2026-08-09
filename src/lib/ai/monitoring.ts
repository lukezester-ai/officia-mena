import { and, eq, inArray, like, notInArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { aiInboxItems } from '@/lib/db/schema/ai_inbox';
import { auditLogs } from '@/lib/db/schema/audit_logs';
import { employeeDocuments, employees } from '@/lib/db/schema/hr';
import { inventoryLevels, products } from '@/lib/db/schema/inventory';
import { invoices } from '@/lib/db/schema/invoices';

export type OperationalRisk = {
  fingerprint: string;
  type: 'overdue_receivable' | 'zatca_delay' | 'expiring_document' | 'low_stock' | 'expiring_stock';
  sourceType: string;
  sourceId: string;
  title: string;
  description: string;
  priority: 'medium' | 'high' | 'critical';
  confidence: string;
  meta: Record<string, unknown>;
};

const DAY = 86_400_000;
export function daysUntil(value: Date | string, now = new Date()) {
  const target = new Date(value);
  return Math.ceil((target.getTime() - now.getTime()) / DAY);
}

export function invoiceRisks(rows: Array<{
  id: string; invoiceNumber: string; clientName: string; totalAmount: string; status: string | null;
  dueDate: Date | null; issueDate: Date; isZatcaReported: boolean | null; zatcaStatus: string | null;
}>, now = new Date()): OperationalRisk[] {
  const risks: OperationalRisk[] = [];
  for (const row of rows) {
    if (row.dueDate && ['issued', 'overdue'].includes(row.status || '') && row.dueDate < now) {
      const overdueDays = Math.max(1, -daysUntil(row.dueDate, now));
      risks.push({
        fingerprint: `monitor:overdue_invoice:${row.id}`, type: 'overdue_receivable', sourceType: 'invoice', sourceId: row.id,
        title: `Просрочена фактура ${row.invoiceNumber}`,
        description: `${row.clientName} дължи ${Number(row.totalAmount).toFixed(2)}; просрочие ${overdueDays} дни.`,
        priority: overdueDays > 90 ? 'critical' : overdueDays > 30 ? 'high' : 'medium', confidence: '1.00',
        meta: { invoiceNumber: row.invoiceNumber, clientName: row.clientName, amount: row.totalAmount, overdueDays, href: `/dashboard/invoices/${row.id}` },
      });
    }
    const ageHours = (now.getTime() - row.issueDate.getTime()) / 3_600_000;
    if (row.status === 'issued' && !row.isZatcaReported && row.zatcaStatus !== 'cleared' && ageHours >= 24) {
      risks.push({
        fingerprint: `monitor:zatca_delay:${row.id}`, type: 'zatca_delay', sourceType: 'invoice', sourceId: row.id,
        title: `ZATCA проверка за ${row.invoiceNumber}`,
        description: `Издадената фактура не е отбелязана като отчетена повече от ${Math.floor(ageHours)} часа.`,
        priority: ageHours >= 72 ? 'critical' : 'high', confidence: '1.00',
        meta: { invoiceNumber: row.invoiceNumber, ageHours: Math.floor(ageHours), href: `/dashboard/invoices/${row.id}` },
      });
    }
  }
  return risks;
}

export async function scanTenantOperationalRisks(tenantId: string, now = new Date()) {
  const [invoiceRows, documentRows, productRows] = await Promise.all([
    db.select().from(invoices).where(eq(invoices.tenantId, tenantId)),
    db.select({ id: employeeDocuments.id, documentType: employeeDocuments.documentType, expiryDate: employeeDocuments.expiryDate,
      employeeId: employees.employeeId, firstName: employees.firstName, lastName: employees.lastName })
      .from(employeeDocuments).innerJoin(employees, and(eq(employeeDocuments.employeeId, employees.id), eq(employees.tenantId, tenantId)))
      .where(eq(employeeDocuments.tenantId, tenantId)),
    db.select({ id: products.id, name: products.name, sku: products.sku, minStockLevel: products.minStockLevel,
      expiryDate: products.expiryDate, quantity: sql<number>`coalesce(sum(${inventoryLevels.quantity}), 0)` })
      .from(products).leftJoin(inventoryLevels, and(eq(inventoryLevels.productId, products.id), eq(inventoryLevels.tenantId, tenantId)))
      .where(and(eq(products.tenantId, tenantId), eq(products.type, 'product'))).groupBy(products.id),
  ]);

  const risks = invoiceRisks(invoiceRows, now);
  for (const doc of documentRows) {
    const days = daysUntil(doc.expiryDate, now);
    if (days <= 30) risks.push({
      fingerprint: `monitor:employee_document:${doc.id}`, type: 'expiring_document', sourceType: 'employee_document', sourceId: doc.id,
      title: `${doc.documentType} изтича${days < 0 ? ' — просрочен' : ''}`,
      description: `${doc.firstName} ${doc.lastName} (${doc.employeeId}): ${days < 0 ? `${Math.abs(days)} дни след срока` : `${days} дни до срока`}.`,
      priority: days < 0 ? 'critical' : days <= 7 ? 'high' : 'medium', confidence: '1.00',
      meta: { employeeId: doc.employeeId, documentType: doc.documentType, daysUntilExpiry: days, href: '/dashboard/hr' },
    });
  }
  for (const product of productRows) {
    const quantity = Number(product.quantity);
    const minimum = product.minStockLevel ?? 0;
    if (quantity <= minimum) risks.push({
      fingerprint: `monitor:low_stock:${product.id}`, type: 'low_stock', sourceType: 'product', sourceId: product.id,
      title: `Ниска наличност: ${product.name}`, description: `${quantity} бр. при минимално ниво ${minimum} (SKU ${product.sku}).`,
      priority: quantity <= 0 ? 'critical' : 'high', confidence: '1.00',
      meta: { sku: product.sku, quantity, minStockLevel: minimum, href: '/dashboard/inventory' },
    });
    if (product.expiryDate) {
      const days = daysUntil(product.expiryDate, now);
      if (days <= 30) risks.push({
        fingerprint: `monitor:product_expiry:${product.id}`, type: 'expiring_stock', sourceType: 'product', sourceId: product.id,
        title: `Срок на партида: ${product.name}`, description: `${days < 0 ? `Изтекла преди ${Math.abs(days)} дни` : `Изтича след ${days} дни`} (SKU ${product.sku}).`,
        priority: days < 0 ? 'critical' : days <= 7 ? 'high' : 'medium', confidence: '1.00',
        meta: { sku: product.sku, daysUntilExpiry: days, href: '/dashboard/inventory' },
      });
    }
  }

  for (const risk of risks) {
    await db.insert(aiInboxItems).values({ tenantId, type: risk.type, sourceType: risk.sourceType, sourceId: risk.sourceId,
      title: risk.title, description: risk.description, priority: risk.priority, confidence: risk.confidence,
      metaJson: risk.meta, fingerprint: risk.fingerprint, status: 'open', detectedAt: now })
      .onConflictDoUpdate({ target: [aiInboxItems.tenantId, aiInboxItems.fingerprint], set: {
        title: risk.title, description: risk.description, priority: risk.priority, confidence: risk.confidence,
        metaJson: risk.meta, detectedAt: now, updatedAt: now,
        status: sql`case when ${aiInboxItems.status} = 'snoozed' and ${aiInboxItems.snoozedUntil} > ${now} then 'snoozed' else 'open' end`,
        resolvedAt: null, resolvedByUserId: null,
      } });
  }

  const active = risks.map((risk) => risk.fingerprint);
  const staleFilter = active.length
    ? and(eq(aiInboxItems.tenantId, tenantId), like(aiInboxItems.fingerprint, 'monitor:%'), inArray(aiInboxItems.status, ['open', 'snoozed']), notInArray(aiInboxItems.fingerprint, active))
    : and(eq(aiInboxItems.tenantId, tenantId), like(aiInboxItems.fingerprint, 'monitor:%'), inArray(aiInboxItems.status, ['open', 'snoozed']));
  const resolved = await db.update(aiInboxItems).set({ status: 'resolved', resolvedAt: now, updatedAt: now })
    .where(staleFilter).returning({ id: aiInboxItems.id });
  return { detected: risks.length, autoResolved: resolved.length, risks };
}

export async function recordMonitorRun(tenantId: string, result: { detected: number; autoResolved: number }) {
  await db.insert(auditLogs).values({ tenantId, entityType: 'maestro_monitor', entityId: tenantId, action: 'AI_MONITOR_RUN',
    newValues: { ...result, completedAt: new Date().toISOString() } });
}
