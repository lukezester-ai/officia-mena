'use server';

import { and, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireTenant } from '@/lib/auth/get-tenant';
import { requireRole } from '@/lib/auth/rbac';
import { scanTenantOperationalRisks, recordMonitorRun } from '@/lib/ai/monitoring';
import { db } from '@/lib/db/db';
import { aiInboxItems } from '@/lib/db/schema/ai_inbox';
import { auditLogs } from '@/lib/db/schema/audit_logs';
import { getErrorMessage } from '@/lib/errors';

const idSchema = z.string().uuid();
const snoozeSchema = z.number().int().min(1).max(30);

export async function getMaestroInbox() {
  try {
    const tenant = await requireTenant();
    const data = await db.select().from(aiInboxItems).where(eq(aiInboxItems.tenantId, tenant.id))
      .orderBy(desc(aiInboxItems.createdAt)).limit(200);
    return { success: true, data };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}

export async function runMaestroScan() {
  try {
    await requireRole('admin', 'finance', 'manager');
    const tenant = await requireTenant();
    const result = await scanTenantOperationalRisks(tenant.id);
    await recordMonitorRun(tenant.id, result);
    revalidatePath('/dashboard/ai-maestro');
    revalidatePath('/dashboard/ai-maestro/inbox');
    return { success: true, data: { detected: result.detected, autoResolved: result.autoResolved } };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}

export async function resolveMaestroAlert(id: string) {
  try {
    const reviewer = await requireRole('admin', 'finance', 'manager');
    const tenant = await requireTenant();
    const parsedId = idSchema.parse(id);
    const [before] = await db.select({ status: aiInboxItems.status }).from(aiInboxItems)
      .where(and(eq(aiInboxItems.id, parsedId), eq(aiInboxItems.tenantId, tenant.id))).limit(1);
    if (!before) throw new Error('Alert not found.');
    const [item] = await db.update(aiInboxItems).set({ status: 'resolved', resolvedAt: new Date(), resolvedByUserId: reviewer.id, updatedAt: new Date() })
      .where(and(eq(aiInboxItems.id, parsedId), eq(aiInboxItems.tenantId, tenant.id))).returning();
    if (!item) throw new Error('Alert not found.');
    await db.insert(auditLogs).values({ tenantId: tenant.id, userId: reviewer.id, entityType: 'ai_alert', entityId: item.id,
      action: 'AI_ALERT_RESOLVE', oldValues: { status: before.status }, newValues: { status: 'resolved' } });
    revalidatePath('/dashboard/ai-maestro/inbox');
    return { success: true };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}

export async function snoozeMaestroAlert(id: string, days = 7) {
  try {
    const reviewer = await requireRole('admin', 'finance', 'manager');
    const tenant = await requireTenant();
    const snoozedUntil = new Date(Date.now() + snoozeSchema.parse(days) * 86_400_000);
    const [item] = await db.update(aiInboxItems).set({ status: 'snoozed', snoozedUntil, updatedAt: new Date() })
      .where(and(eq(aiInboxItems.id, idSchema.parse(id)), eq(aiInboxItems.tenantId, tenant.id))).returning();
    if (!item) throw new Error('Alert not found.');
    await db.insert(auditLogs).values({ tenantId: tenant.id, userId: reviewer.id, entityType: 'ai_alert', entityId: item.id,
      action: 'AI_ALERT_SNOOZE', newValues: { status: 'snoozed', snoozedUntil: snoozedUntil.toISOString() } });
    revalidatePath('/dashboard/ai-maestro/inbox');
    return { success: true };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}
