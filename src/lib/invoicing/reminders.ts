import { db } from '@/lib/db/db';
import { invoiceReminders, invoices } from '@/lib/db/schema/invoice_extensions';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export interface ReminderInput {
  tenantId: string;
  invoiceId: string;
  reminderType: 'due_date' | 'overdue' | 'custom';
  daysBeforeDue?: number;
  daysAfterDue?: number;
  subject?: string;
  message: string;
  isAutomated: boolean;
  userId: string;
}

export async function createReminder(input: ReminderInput) {
  const [reminder] = await db
    .insert(invoiceReminders)
    .values({
      tenantId: input.tenantId,
      invoiceId: input.invoiceId,
      reminderType: input.reminderType,
      daysBeforeDue: input.daysBeforeDue,
      daysAfterDue: input.daysAfterDue,
      subject: input.subject,
      message: input.message,
      isAutomated: input.isAutomated,
      isActive: true,
      sendCount: 0,
      createdByUserId: input.userId,
    })
    .returning();

  return reminder;
}

export async function getReminders(tenantId: string, invoiceId?: string) {
  const query = db
    .select()
    .from(invoiceReminders)
    .where(and(eq(invoiceReminders.tenantId, tenantId), eq(invoiceReminders.isActive, true)));

  if (invoiceId) {
    query.where(and(
      eq(invoiceReminders.tenantId, tenantId),
      eq(invoiceReminders.isActive, true),
      eq(invoiceReminders.invoiceId, invoiceId)
    ));
  }

  return query.orderBy(desc(invoiceReminders.createdAt));
}

export async function sendReminder(reminderId: string, tenantId: string) {
  const [reminder] = await db
    .select()
    .from(invoiceReminders)
    .where(and(eq(invoiceReminders.id, reminderId), eq(invoiceReminders.tenantId, tenantId)))
    .limit(1);

  if (!reminder) {
    throw new Error('Reminder not found');
  }

  // Get invoice details
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, reminder.invoiceId))
    .limit(1);

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Here you would integrate with email service (Resend)
  // For now, we'll just update the reminder stats
  const [updated] = await db
    .update(invoiceReminders)
    .set({
      lastSentAt: new Date(),
      sendCount: reminder.sendCount + 1,
      updatedAt: new Date(),
    })
    .where(eq(invoiceReminders.id, reminderId))
    .returning();

  return { reminder: updated, invoice };
}

export async function getDueReminders(tenantId: string) {
  const today = new Date();

  const reminders = await db
    .select()
    .from(invoiceReminders)
    .where(and(
      eq(invoiceReminders.tenantId, tenantId),
      eq(invoiceReminders.isActive, true),
      eq(invoiceReminders.isAutomated, true)
    ));

  const dueReminders = [];

  for (const reminder of reminders) {
    const [invoice] = await db
      .select({ dueDate: invoices.dueDate, status: invoices.status })
      .from(invoices)
      .where(eq(invoices.id, reminder.invoiceId))
      .limit(1);

    if (!invoice) continue;

    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
    if (!dueDate) continue;

    if (invoice.status === 'paid' || invoice.status === 'cancelled') continue;

    // Check if reminder is due
    if (reminder.reminderType === 'due_date' && reminder.daysBeforeDue) {
      const reminderDate = new Date(dueDate.getTime() - reminder.daysBeforeDue * 24 * 60 * 60 * 1000);
      if (today >= reminderDate && today <= dueDate) {
        dueReminders.push({ reminder, invoice, reminderDate });
      }
    }

    if (reminder.reminderType === 'overdue' && reminder.daysAfterDue) {
      const reminderDate = new Date(dueDate.getTime() + reminder.daysAfterDue * 24 * 60 * 60 * 1000);
      if (today >= reminderDate) {
        dueReminders.push({ reminder, invoice, reminderDate });
      }
    }
  }

  return dueReminders;
}

export async function updateReminder(
  reminderId: string,
  tenantId: string,
  updates: Partial<{
    subject: string;
    message: string;
    isAutomated: boolean;
    isActive: boolean;
  }>
) {
  const [reminder] = await db
    .update(invoiceReminders)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(invoiceReminders.id, reminderId), eq(invoiceReminders.tenantId, tenantId)))
    .returning();

  return reminder;
}

export async function deleteReminder(reminderId: string, tenantId: string) {
  await db
    .update(invoiceReminders)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(invoiceReminders.id, reminderId), eq(invoiceReminders.tenantId, tenantId)));
}

export async function createDefaultReminders(tenantId: string, invoiceId: string, userId: string) {
  const reminders = [
    {
      reminderType: 'due_date' as const,
      daysBeforeDue: 7,
      subject: 'Invoice Due Soon',
      message: 'This is a reminder that your invoice is due in 7 days.',
      isAutomated: true,
    },
    {
      reminderType: 'due_date' as const,
      daysBeforeDue: 1,
      subject: 'Invoice Due Tomorrow',
      message: 'This is a reminder that your invoice is due tomorrow.',
      isAutomated: true,
    },
    {
      reminderType: 'overdue' as const,
      daysAfterDue: 1,
      subject: 'Invoice Overdue',
      message: 'This invoice is now overdue. Please arrange payment.',
      isAutomated: true,
    },
    {
      reminderType: 'overdue' as const,
      daysAfterDue: 7,
      subject: 'Invoice Overdue - Second Notice',
      message: 'This invoice is 7 days overdue. Please contact us to arrange payment.',
      isAutomated: true,
    },
  ];

  const createdReminders = [];

  for (const reminderData of reminders) {
    const reminder = await createReminder({
      tenantId,
      invoiceId,
      ...reminderData,
      userId,
    });
    createdReminders.push(reminder);
  }

  return createdReminders;
}

export async function getReminderStats(tenantId: string) {
  const reminders = await getReminders(tenantId);

  const stats = {
    total: reminders.length,
    automated: reminders.filter(r => r.isAutomated).length,
    manual: reminders.filter(r => !r.isAutomated).length,
    sent: reminders.reduce((sum, r) => sum + r.sendCount, 0),
    byType: {} as Record<string, number>,
  };

  for (const reminder of reminders) {
    stats.byType[reminder.reminderType] = (stats.byType[reminder.reminderType] || 0) + 1;
  }

  return stats;
}
