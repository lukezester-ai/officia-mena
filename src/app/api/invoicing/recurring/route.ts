import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createRecurringInvoice,
  getRecurringInvoices,
  getRecurringInvoice,
  generateNextInvoice,
  getRecurringHistory,
  updateRecurringInvoice,
  pauseRecurringInvoice,
  resumeRecurringInvoice,
  deleteRecurringInvoice,
  processDueRecurringInvoices,
  getRecurringInvoiceStats,
} from '@/lib/invoicing';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const recurring = await getRecurringInvoices(tenant.id);
      return NextResponse.json({ success: true, data: recurring });
    }

    if (action === 'get') {
      const recurringId = searchParams.get('recurringId');
      if (!recurringId) {
        return NextResponse.json({ success: false, error: 'Recurring invoice ID is required' }, { status: 400 });
      }

      const recurring = await getRecurringInvoice(recurringId, tenant.id);
      return NextResponse.json({ success: true, data: recurring });
    }

    if (action === 'history') {
      const recurringId = searchParams.get('recurringId');
      if (!recurringId) {
        return NextResponse.json({ success: false, error: 'Recurring invoice ID is required' }, { status: 400 });
      }

      const history = await getRecurringHistory(recurringId);
      return NextResponse.json({ success: true, data: history });
    }

    if (action === 'stats') {
      const stats = await getRecurringInvoiceStats(tenant.id);
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
      const { name, description, clientId, templateId, frequency, interval, dayOfMonth, dayOfWeek, startDate, endDate, invoiceAmount, vatRate, currency, paymentTerms, autoGenerate, autoSend } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const recurring = await createRecurringInvoice({
        tenantId: tenant.id,
        name,
        description,
        clientId,
        templateId,
        frequency,
        interval,
        dayOfMonth,
        dayOfWeek,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        invoiceAmount,
        vatRate,
        currency,
        paymentTerms,
        autoGenerate,
        autoSend,
        userId,
      });

      return NextResponse.json({ success: true, data: recurring });
    }

    if (action === 'generate') {
      const { recurringId } = body;

      const result = await generateNextInvoice(recurringId, tenant.id);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'process-due') {
      const results = await processDueRecurringInvoices(tenant.id);
      return NextResponse.json({ success: true, data: results });
    }

    if (action === 'pause') {
      const { recurringId } = body;

      const recurring = await pauseRecurringInvoice(recurringId, tenant.id);
      return NextResponse.json({ success: true, data: recurring });
    }

    if (action === 'resume') {
      const { recurringId } = body;

      const recurring = await resumeRecurringInvoice(recurringId, tenant.id);
      return NextResponse.json({ success: true, data: recurring });
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
      const { recurringId, updates } = body;

      const recurring = await updateRecurringInvoice(recurringId, tenant.id, updates);
      return NextResponse.json({ success: true, data: recurring });
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
    const recurringId = searchParams.get('recurringId');

    if (!recurringId) {
      return NextResponse.json({ success: false, error: 'Recurring invoice ID is required' }, { status: 400 });
    }

    await deleteRecurringInvoice(recurringId, tenant.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
