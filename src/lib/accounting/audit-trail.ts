import { db } from '@/lib/db/db';
import { auditLogEntries } from '@/lib/db/schema/accounting_reports';
import { eq, and, desc, or, gte } from 'drizzle-orm';

export interface AuditLogInput {
  tenantId: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

export async function createAuditLog(input: AuditLogInput) {
  const [log] = await db
    .insert(auditLogEntries)
    .values({
      tenantId: input.tenantId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      oldValue: input.oldValue as any,
      newValue: input.newValue as any,
      userId: input.userId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      reason: input.reason,
    })
    .returning();

  return log;
}

export async function getAuditLogs(
  tenantId: string,
  entityType?: string,
  entityId?: string,
  limit = 50
) {
  const query = db
    .select()
    .from(auditLogEntries)
    .where(eq(auditLogEntries.tenantId, tenantId));

  if (entityType) {
    query.where(and(eq(auditLogEntries.tenantId, tenantId), eq(auditLogEntries.entityType, entityType)));
  }

  if (entityId) {
    query.where(and(
      eq(auditLogEntries.tenantId, tenantId),
      entityId ? eq(auditLogEntries.entityId, entityId) : undefined
    ));
  }

  return query.orderBy(desc(auditLogEntries.createdAt)).limit(limit);
}

export async function getAuditLogsByUser(tenantId: string, userId: string, limit = 50) {
  return db
    .select()
    .from(auditLogEntries)
    .where(and(eq(auditLogEntries.tenantId, tenantId), eq(auditLogEntries.userId, userId)))
    .orderBy(desc(auditLogEntries.createdAt))
    .limit(limit);
}

export async function getAuditLogsByEntity(
  tenantId: string,
  entityType: string,
  entityId: string,
  limit = 50
) {
  return db
    .select()
    .from(auditLogEntries)
    .where(
      and(
        eq(auditLogEntries.tenantId, tenantId),
        eq(auditLogEntries.entityType, entityType),
        eq(auditLogEntries.entityId, entityId)
      )
    )
    .orderBy(desc(auditLogEntries.createdAt))
    .limit(limit);
}

export async function getAuditLogSummary(tenantId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const logs = await db
    .select()
    .from(auditLogEntries)
    .where(and(eq(auditLogEntries.tenantId, tenantId), gte(auditLogEntries.createdAt, since)));

  const summary = {
    totalLogs: logs.length,
    byAction: {} as Record<string, number>,
    byEntityType: {} as Record<string, number>,
    byUser: {} as Record<string, number>,
  };

  for (const log of logs) {
    summary.byAction[log.action] = (summary.byAction[log.action] || 0) + 1;
    summary.byEntityType[log.entityType] = (summary.byEntityType[log.entityType] || 0) + 1;
    summary.byUser[log.userId] = (summary.byUser[log.userId] || 0) + 1;
  }

  return summary;
}

export async function getCriticalAuditLogs(tenantId: string, limit = 20) {
  const criticalActions = ['delete', 'reverse', 'approve'];

  return db
    .select()
    .from(auditLogEntries)
    .where(
      and(
        eq(auditLogEntries.tenantId, tenantId),
        or(...criticalActions.map(action => eq(auditLogEntries.action, action)))
      )
    )
    .orderBy(desc(auditLogEntries.createdAt))
    .limit(limit);
}

export async function getAuditTrailForApproval(
  tenantId: string,
  entityType: string,
  entityId: string
) {
  return getAuditLogsByEntity(tenantId, entityType, entityId);
}

export async function rollbackWithAudit(
  tenantId: string,
  entityType: string,
  entityId: string,
  userId: string,
  rollbackFunction: () => Promise<any>,
  reason?: string
) {
  // Get current state before rollback
  const currentLogs = await getAuditLogsByEntity(tenantId, entityType, entityId, 1);
  const currentValue = currentLogs[0]?.newValue;

  // Perform rollback
  const result = await rollbackFunction();

  // Log the rollback action
  await createAuditLog({
    tenantId,
    entityType,
    entityId,
    action: 'reverse',
    oldValue: currentValue,
    newValue: null, // After rollback
    userId,
    reason: reason || 'Manual rollback initiated',
  });

  return result;
}
