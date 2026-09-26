import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createWorkflow,
  getWorkflows,
  getWorkflow,
  applyWorkflowToInvoice,
  advanceInvoiceStage,
  getInvoiceWorkflowHistory,
  updateWorkflow,
  deleteWorkflow,
  getDefaultWorkflowStages,
  getWorkflowStats,
} from '@/lib/invoicing';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const workflows = await getWorkflows(tenant.id);
      return NextResponse.json({ success: true, data: workflows });
    }

    if (action === 'get') {
      const workflowId = searchParams.get('workflowId');
      if (!workflowId) {
        return NextResponse.json({ success: false, error: 'Workflow ID is required' }, { status: 400 });
      }

      const workflow = await getWorkflow(workflowId, tenant.id);
      return NextResponse.json({ success: true, data: workflow });
    }

    if (action === 'default-stages') {
      const stages = getDefaultWorkflowStages();
      return NextResponse.json({ success: true, data: stages });
    }

    if (action === 'history') {
      const invoiceId = searchParams.get('invoiceId');
      if (!invoiceId) {
        return NextResponse.json({ success: false, error: 'Invoice ID is required' }, { status: 400 });
      }

      const history = await getInvoiceWorkflowHistory(invoiceId);
      return NextResponse.json({ success: true, data: history });
    }

    if (action === 'stats') {
      const stats = await getWorkflowStats(tenant.id);
      return NextResponse.json({ success: true, data: stats });
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

    if (action === 'create') {
      const { name, description, stages, autoTransition, requiresApproval, approvalThreshold } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const workflow = await createWorkflow({
        tenantId: tenant.id,
        name,
        description,
        stages,
        autoTransition,
        requiresApproval,
        approvalThreshold,
        userId,
      });

      return NextResponse.json({ success: true, data: workflow });
    }

    if (action === 'apply-to-invoice') {
      const { invoiceId, workflowId } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const history = await applyWorkflowToInvoice(invoiceId, workflowId, userId);
      return NextResponse.json({ success: true, data: history });
    }

    if (action === 'advance-stage') {
      const { invoiceId, workflowId, action: stageAction, notes } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const history = await advanceInvoiceStage(invoiceId, workflowId, userId, stageAction, notes);
      return NextResponse.json({ success: true, data: history });
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

    if (action === 'update') {
      const { workflowId, updates } = body;

      const workflow = await updateWorkflow(workflowId, tenant.id, updates);
      return NextResponse.json({ success: true, data: workflow });
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
    const workflowId = searchParams.get('workflowId');

    if (!workflowId) {
      return NextResponse.json({ success: false, error: 'Workflow ID is required' }, { status: 400 });
    }

    await deleteWorkflow(workflowId, tenant.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
