import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createReminder,
  getReminders,
  sendReminder,
  getDueReminders,
  updateReminder,
  deleteReminder,
  createDefaultReminders,
  getReminderStats,
} from '@/lib/invoicing';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const invoiceId = searchParams.get('invoiceId') || undefined;
      const reminders = await getReminders(tenant.id, invoiceId);
      return NextResponse.json({ success: true, data: reminders });
    }

    if (action === 'due') {
      const dueReminders = await getDueReminders(tenant.id);
      return NextResponse.json({ success: true, data: dueReminders });
    }

    if (action === 'stats') {
      const stats = await getReminderStats(tenant.id);
      return NextResponse.json({ success: true, data: stats });
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

    if (action === 'create') {
      await requireRole('admin', 'finance');
      const { invoiceId, reminderType, daysBeforeDue, daysAfterDue, subject, message, isAutomated } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const reminder = await createReminder({
        tenantId: tenant.id,
        invoiceId,
        reminderType,
        daysBeforeDue,
        daysAfterDue,
        subject,
        message,
        isAutomated,
        userId,
      });

      return NextResponse.json({ success: true, data: reminder });
    }

    if (action === 'send') {
      await requireRole('admin', 'finance');
      const { reminderId } = body;

      const result = await sendReminder(reminderId, tenant.id);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'create-default') {
      await requireRole('admin', 'finance');
      const { invoiceId } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const reminders = await createDefaultReminders(tenant.id, invoiceId, userId);
      return NextResponse.json({ success: true, data: reminders });
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
      const { reminderId, updates } = body;

      const reminder = await updateReminder(reminderId, tenant.id, updates);
      return NextResponse.json({ success: true, data: reminder });
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
    const reminderId = searchParams.get('reminderId');

    if (!reminderId) {
      return NextResponse.json({ success: false, error: 'Reminder ID is required' }, { status: 400 });
    }

    await deleteReminder(reminderId, tenant.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
