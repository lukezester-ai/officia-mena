import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createReconciliationRule,
  getReconciliationRules,
  toggleReconciliationRule,
  autoReconcileBankTransactions,
  manualReconcile,
  getReconciliationStatus,
  deleteReconciliationRule,
} from '@/lib/accounting';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'rules') {
      const rules = await getReconciliationRules(tenant.id);
      return NextResponse.json({ success: true, data: rules });
    }

    if (action === 'status') {
      const status = await getReconciliationStatus(tenant.id);
      return NextResponse.json({ success: true, data: status });
    }

    if (action === 'auto-reconcile') {
      const matches = await autoReconcileBankTransactions(tenant.id);
      return NextResponse.json({ success: true, data: matches });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'create-rule') {
      const { name, ruleType, configuration } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const rule = await createReconciliationRule({
        tenantId: tenant.id,
        name,
        ruleType,
        configuration,
        userId,
      });

      return NextResponse.json({ success: true, data: rule });
    }

    if (action === 'manual-reconcile') {
      const { bankTransactionId, journalLineId } = body;

      const result = await manualReconcile(tenant.id, bankTransactionId, journalLineId);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'toggle-rule') {
      const { ruleId } = body;

      const rule = await toggleReconciliationRule(ruleId, tenant.id);
      return NextResponse.json({ success: true, data: rule });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');

    if (!ruleId) {
      return NextResponse.json({ success: false, error: 'Rule ID is required' }, { status: 400 });
    }

    await deleteReconciliationRule(ruleId, tenant.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
