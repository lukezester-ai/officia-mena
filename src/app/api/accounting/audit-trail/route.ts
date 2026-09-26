import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createAuditLog,
  getAuditLogs,
  getAuditLogsByUser,
  getAuditLogsByEntity,
  getAuditLogSummary,
  getCriticalAuditLogs,
  getAuditTrailForApproval,
  rollbackWithAudit,
} from '@/lib/accounting';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const entityType = searchParams.get('entityType') || undefined;
      const entityId = searchParams.get('entityId') || undefined;
      const limit = Number(searchParams.get('limit')) || 50;

      const logs = await getAuditLogs(tenant.id, entityType, entityId, limit);
      return NextResponse.json({ success: true, data: logs });
    }

    if (action === 'by-user') {
      const userId = searchParams.get('userId');
      const limit = Number(searchParams.get('limit')) || 50;

      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
      }

      const logs = await getAuditLogsByUser(tenant.id, userId, limit);
      return NextResponse.json({ success: true, data: logs });
    }

    if (action === 'by-entity') {
      const entityType = searchParams.get('entityType');
      const entityId = searchParams.get('entityId');
      const limit = Number(searchParams.get('limit')) || 50;

      if (!entityType || !entityId) {
        return NextResponse.json({ success: false, error: 'Entity type and ID are required' }, { status: 400 });
      }

      const logs = await getAuditLogsByEntity(tenant.id, entityType, entityId, limit);
      return NextResponse.json({ success: true, data: logs });
    }

    if (action === 'summary') {
      const days = Number(searchParams.get('days')) || 30;

      const summary = await getAuditLogSummary(tenant.id, days);
      return NextResponse.json({ success: true, data: summary });
    }

    if (action === 'critical') {
      const limit = Number(searchParams.get('limit')) || 20;

      const logs = await getCriticalAuditLogs(tenant.id, limit);
      return NextResponse.json({ success: true, data: logs });
    }

    if (action === 'approval-trail') {
      const entityType = searchParams.get('entityType');
      const entityId = searchParams.get('entityId');

      if (!entityType || !entityId) {
        return NextResponse.json({ success: false, error: 'Entity type and ID are required' }, { status: 400 });
      }

      const trail = await getAuditTrailForApproval(tenant.id, entityType, entityId);
      return NextResponse.json({ success: true, data: trail });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'create-log') {
      const { entityType, entityId, action: logAction, oldValue, newValue, ipAddress, userAgent, reason } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const log = await createAuditLog({
        tenantId: tenant.id,
        entityType,
        entityId,
        action: logAction,
        oldValue,
        newValue,
        userId,
        ipAddress,
        userAgent,
        reason,
      });

      return NextResponse.json({ success: true, data: log });
    }

    if (action === 'rollback') {
      await requireRole('admin', 'finance');
      const { entityType, entityId, reason } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      // In a real implementation, this would accept a rollback function
      // For now, we'll just create the audit log
      const result = await rollbackWithAudit(
        tenant.id,
        entityType,
        entityId,
        userId,
        async () => ({ success: true }), // Placeholder rollback function
        reason
      );

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
