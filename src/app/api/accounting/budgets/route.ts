import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createBudget,
  getBudgets,
  getBudget,
  addBudgetLine,
  updateBudgetLine,
  approveBudget,
  getBudgetVsActual,
  getBudgetAlerts,
  deleteBudget,
} from '@/lib/accounting';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const fiscalYear = searchParams.get('fiscalYear') ? Number(searchParams.get('fiscalYear')) : undefined;
      const budgets = await getBudgets(tenant.id, fiscalYear);
      return NextResponse.json({ success: true, data: budgets });
    }

    if (action === 'get') {
      const budgetId = searchParams.get('budgetId');
      if (!budgetId) {
        return NextResponse.json({ success: false, error: 'Budget ID is required' }, { status: 400 });
      }

      const budget = await getBudget(budgetId, tenant.id);
      return NextResponse.json({ success: true, data: budget });
    }

    if (action === 'budget-vs-actual') {
      const budgetId = searchParams.get('budgetId');
      if (!budgetId) {
        return NextResponse.json({ success: false, error: 'Budget ID is required' }, { status: 400 });
      }

      const budgetVsActual = await getBudgetVsActual(budgetId, tenant.id);
      return NextResponse.json({ success: true, data: budgetVsActual });
    }

    if (action === 'alerts') {
      const alerts = await getBudgetAlerts(tenant.id);
      return NextResponse.json({ success: true, data: alerts });
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
      const { name, description, fiscalYear, fiscalMonth, currency } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const budget = await createBudget({
        tenantId: tenant.id,
        name,
        description,
        fiscalYear,
        fiscalMonth,
        currency,
        userId,
      });

      return NextResponse.json({ success: true, data: budget });
    }

    if (action === 'add-line') {
      const { budgetId, accountId, budgetedAmount, varianceThreshold, notes } = body;

      const line = await addBudgetLine({
        budgetId,
        accountId,
        budgetedAmount,
        varianceThreshold,
        notes,
      });

      return NextResponse.json({ success: true, data: line });
    }

    if (action === 'approve') {
      const { budgetId } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const budget = await approveBudget(budgetId, tenant.id, userId);
      return NextResponse.json({ success: true, data: budget });
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

    if (action === 'update-line') {
      const { lineId, budgetedAmount, varianceThreshold, notes } = body;

      const line = await updateBudgetLine(lineId, budgetedAmount, varianceThreshold, notes);
      return NextResponse.json({ success: true, data: line });
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
    const budgetId = searchParams.get('budgetId');

    if (!budgetId) {
      return NextResponse.json({ success: false, error: 'Budget ID is required' }, { status: 400 });
    }

    await deleteBudget(budgetId, tenant.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
