import { db } from '@/lib/db/db';
import { recurringInvoices, recurringInvoiceHistory, invoices } from '@/lib/db/schema/invoice_extensions';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export interface RecurringInvoiceInput {
  tenantId: string;
  name: string;
  description?: string | null;
  clientId: string;
  templateId?: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  interval: number;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: Date;
  endDate?: Date;
  invoiceAmount: number;
  vatRate?: number;
  currency?: string;
  paymentTerms?: number;
  autoGenerate: boolean;
  autoSend: boolean;
  userId: string;
}

export async function createRecurringInvoice(input: RecurringInvoiceInput) {
  const nextInvoiceDate = calculateNextInvoiceDate(
    input.frequency,
    input.interval,
    input.dayOfMonth,
    input.dayOfWeek,
    input.startDate
  );

  const [recurring] = await db
    .insert(recurringInvoices)
    .values({
      tenantId: input.tenantId,
      name: input.name,
      description: input.description,
      clientId: input.clientId,
      templateId: input.templateId,
      frequency: input.frequency,
      interval: input.interval,
      dayOfMonth: input.dayOfMonth,
      dayOfWeek: input.dayOfWeek,
      startDate: input.startDate,
      endDate: input.endDate,
      nextInvoiceDate,
      invoiceAmount: input.invoiceAmount.toFixed(2),
      vatRate: input.vatRate?.toFixed(2) || '15.00',
      currency: input.currency || 'SAR',
      paymentTerms: input.paymentTerms || 30,
      autoGenerate: input.autoGenerate,
      autoSend: input.autoSend,
      isActive: true,
      totalGenerated: 0,
      createdByUserId: input.userId,
    })
    .returning();

  return recurring;
}

export async function getRecurringInvoices(tenantId: string) {
  return db
    .select()
    .from(recurringInvoices)
    .where(and(eq(recurringInvoices.tenantId, tenantId), eq(recurringInvoices.isActive, true)))
    .orderBy(recurringInvoices.nextInvoiceDate);
}

export async function getRecurringInvoice(recurringId: string, tenantId: string) {
  const [recurring] = await db
    .select()
    .from(recurringInvoices)
    .where(and(eq(recurringInvoices.id, recurringId), eq(recurringInvoices.tenantId, tenantId)))
    .limit(1);

  return recurring;
}

export async function generateNextInvoice(recurringId: string, tenantId: string) {
  const recurring = await getRecurringInvoice(recurringId, tenantId);
  if (!recurring) {
    throw new Error('Recurring invoice not found');
  }

  if (!recurring.autoGenerate) {
    throw new Error('Auto-generation is disabled for this recurring invoice');
  }

  // Check if next invoice date has arrived
  const today = new Date();
  const nextDate = new Date(recurring.nextInvoiceDate);

  if (today < nextDate) {
    throw new Error('Next invoice date has not arrived yet');
  }

  // Create the actual invoice (simplified - would need full invoice creation logic)
  const [invoice] = await db
    .insert(invoices)
    .values({
      tenantId: recurring.tenantId,
      invoiceNumber: `REC-${Date.now()}`, // Would need proper numbering
      issueDate: nextDate,
      dueDate: new Date(nextDate.getTime() + recurring.paymentTerms * 24 * 60 * 60 * 1000),
      clientName: `Client ${recurring.clientId}`, // Would get from clients table
      subtotal: (Number(recurring.invoiceAmount) / (1 + Number(recurring.vatRate) / 100)).toFixed(2),
      vatRate: recurring.vatRate,
      vatAmount: (Number(recurring.invoiceAmount) - Number(recurring.invoiceAmount) / (1 + Number(recurring.vatRate) / 100)).toFixed(2),
      totalAmount: recurring.invoiceAmount,
      currency: recurring.currency,
      status: 'issued',
      items: JSON.stringify([]), // Would include actual line items
    })
    .returning();

  // Create history entry
  const [history] = await db
    .insert(recurringInvoiceHistory)
    .values({
      recurringInvoiceId: recurring.id,
      generatedInvoiceId: invoice.id,
      scheduledDate: nextDate,
      generatedDate: today,
      status: 'generated',
    })
    .returning();

  // Update recurring invoice
  const nextNextDate = calculateNextInvoiceDate(
    recurring.frequency,
    recurring.interval,
    recurring.dayOfMonth,
    recurring.dayOfWeek,
    nextDate
  );

  await db
    .update(recurringInvoices)
    .set({
      nextInvoiceDate: nextNextDate,
      lastGeneratedAt: today,
      totalGenerated: recurring.totalGenerated + 1,
      updatedAt: new Date(),
    })
    .where(eq(recurringInvoices.id, recurring.id));

  // Check if we've reached the end date
  if (recurring.endDate && nextNextDate > recurring.endDate) {
    await db
      .update(recurringInvoices)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(recurringInvoices.id, recurring.id));
  }

  return { invoice, history };
}

export async function getRecurringHistory(recurringId: string) {
  return db
    .select()
    .from(recurringInvoiceHistory)
    .where(eq(recurringInvoiceHistory.recurringInvoiceId, recurringId))
    .orderBy(desc(recurringInvoiceHistory.scheduledDate));
}

export async function updateRecurringInvoice(
  recurringId: string,
  tenantId: string,
  updates: Partial<{
    name: string;
    description: string | null;
    invoiceAmount: number;
    vatRate: number;
    currency: string;
    paymentTerms: number;
    autoGenerate: boolean;
    autoSend: boolean;
    endDate: Date;
  }>
) {
  const [recurring] = await db
    .update(recurringInvoices)
    .set({
      ...updates,
      invoiceAmount: updates.invoiceAmount?.toFixed(2),
      vatRate: updates.vatRate?.toFixed(2),
      updatedAt: new Date(),
    })
    .where(and(eq(recurringInvoices.id, recurringId), eq(recurringInvoices.tenantId, tenantId)))
    .returning();

  return recurring;
}

export async function pauseRecurringInvoice(recurringId: string, tenantId: string) {
  const [recurring] = await db
    .update(recurringInvoices)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(recurringInvoices.id, recurringId), eq(recurringInvoices.tenantId, tenantId)))
    .returning();

  return recurring;
}

export async function resumeRecurringInvoice(recurringId: string, tenantId: string) {
  const [recurring] = await db
    .update(recurringInvoices)
    .set({ isActive: true, updatedAt: new Date() })
    .where(and(eq(recurringInvoices.id, recurringId), eq(recurringInvoices.tenantId, tenantId)))
    .returning();

  return recurring;
}

export async function deleteRecurringInvoice(recurringId: string, tenantId: string) {
  await db
    .update(recurringInvoices)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(recurringInvoices.id, recurringId), eq(recurringInvoices.tenantId, tenantId)));
}

export async function processDueRecurringInvoices(tenantId: string) {
  const today = new Date();
  const recurringInvoices = await getRecurringInvoices(tenantId);

  const results = [];

  for (const recurring of recurringInvoices) {
    if (!recurring.autoGenerate) continue;

    const nextDate = new Date(recurring.nextInvoiceDate);
    if (today >= nextDate) {
      try {
        const result = await generateNextInvoice(recurring.id, tenantId);
        results.push({ success: true, recurringId: recurring.id, invoiceId: result.invoice.id });
      } catch (error) {
        results.push({ success: false, recurringId: recurring.id, error: String(error) });
      }
    }
  }

  return results;
}

function calculateNextInvoiceDate(
  frequency: string,
  interval: number,
  dayOfMonth?: number,
  dayOfWeek?: number,
  startDate?: Date
): Date {
  const baseDate = startDate || new Date();
  const nextDate = new Date(baseDate);

  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * interval));
      if (dayOfWeek !== undefined) {
        nextDate.setDate(nextDate.getDate() + (dayOfWeek - nextDate.getDay() + 7) % 7);
      }
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + (14 * interval));
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      if (dayOfMonth !== undefined) {
        nextDate.setDate(Math.min(dayOfMonth, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()));
      }
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + (3 * interval));
      break;
    case 'annually':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
  }

  return nextDate;
}

export async function getRecurringInvoiceStats(tenantId: string) {
  const recurring = await getRecurringInvoices(tenantId);

  const stats = {
    total: recurring.length,
    active: recurring.filter(r => r.isActive).length,
    paused: recurring.filter(r => !r.isActive).length,
    autoGenerate: recurring.filter(r => r.autoGenerate).length,
    totalGenerated: recurring.reduce((sum, r) => sum + r.totalGenerated, 0),
    byFrequency: {} as Record<string, number>,
  };

  for (const invoice of recurring) {
    stats.byFrequency[invoice.frequency] = (stats.byFrequency[invoice.frequency] || 0) + 1;
  }

  return stats;
}
