'use server';

import { db } from '@/lib/db/db';
import { invoices } from '@/lib/db/schema/invoices';
import { eq, desc, and } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';
import { generateZatcaQrCode, ZatcaTags } from '@/lib/accounting/zatca-qr';
import { postIssuedInvoice, postInvoicePayment } from '@/lib/accounting/postings';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/rbac';

const invoiceInputSchema = z.object({
  clientName: z.string().trim().min(1).max(255),
  clientTrn: z.string().trim().max(50).optional(),
  subtotal: z.number().finite().positive().max(999_999_999.99),
  vatRate: z.number().finite().min(0).max(100),
  isDraft: z.boolean(),
  notes: z.string().trim().max(5000).optional(),
  lateFeeAmount: z.number().finite().min(0).max(999_999_999.99).optional(),
  lateFeeIsCharity: z.boolean().optional(),
});
const invoiceStatusSchema = z.enum(['draft', 'issued', 'paid', 'overdue', 'cancelled']);

export async function getInvoices() {
  try {
    const tenant = await requireTenant();
    const data = await db
      .select()
      .from(invoices)
      .where(eq(invoices.tenantId, tenant.id))
      .orderBy(desc(invoices.createdAt))
      .limit(50);
      
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

export async function createInvoice(data: {
  clientName: string;
  clientTrn?: string;
  subtotal: number;
  vatRate: number; // e.g. 15 for 15%
  isDraft: boolean;
  notes?: string;
  lateFeeAmount?: number;
  lateFeeIsCharity?: boolean;
}) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    data = invoiceInputSchema.parse(data);
    
    const subtotal = data.subtotal;
    const vatAmount = subtotal * (data.vatRate / 100);
    const totalAmount = subtotal + vatAmount + (data.lateFeeAmount || 0); // Include late fee in total if you want, or handle separately. Usually penalty is separate from VAT.
    
    let qrCode = null;
    const status = data.isDraft ? 'draft' : 'issued';
    
    // Only generate ZATCA QR if it's actually issued (official)
    if (!data.isDraft) {
      const zatcaData: ZatcaTags = {
        sellerName: tenant.name,
        vatNumber: tenant.trn || '',
        timestamp: new Date().toISOString(),
        invoiceTotal: totalAmount.toFixed(2),
        vatTotal: vatAmount.toFixed(2)
      };
      
      qrCode = generateZatcaQrCode(zatcaData);
    }
    
    // Generate an invoice number (INV-YYYYMMDD-Random)
    const invNumber = `INV-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)}`;

    const [invoice] = await db.insert(invoices).values({
      tenantId: tenant.id,
      invoiceNumber: invNumber,
      clientName: data.clientName,
      clientTrn: data.clientTrn || null,
      subtotal: subtotal.toFixed(2),
      vatRate: data.vatRate.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      lateFeeAmount: (data.lateFeeAmount || 0).toFixed(2),
      lateFeeIsCharity: data.lateFeeIsCharity !== undefined ? data.lateFeeIsCharity : true,
      issueDate: new Date(),
      status: status,
      zatcaQrCode: qrCode,
      isZatcaReported: false,
      zatcaStatus: 'pending',
      notes: data.notes
    }).returning();

    if (status === 'issued') {
      await postIssuedInvoice({
        tenantId: tenant.id,
        invoiceId: invoice.id,
        invoiceNumber: invNumber,
        clientName: data.clientName,
        subtotal,
        vatAmount,
        totalAmount,
        currency: invoice.currency,
        entryDate: invoice.issueDate,
      });
    }
    
    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard/accounting');
    return { success: true, invoiceNumber: invNumber };
  } catch (error: unknown) {
    console.error('Invoice creation error:', error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

export async function updateInvoiceStatus(id: string, newStatus: string) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    const validatedStatus = invoiceStatusSchema.parse(newStatus);
    
    // First, fetch the invoice to ensure it exists and get its details
    const invData = await db.select().from(invoices).where(and(eq(invoices.id, id), eq(invoices.tenantId, tenant.id))).limit(1);
    if (invData.length === 0) {
      return { success: false, error: 'Invoice not found' };
    }
    
    const invoice = invData[0];
    
    let qrCode = invoice.zatcaQrCode;
    let isReported = invoice.isZatcaReported;
    
    // If transitioning from draft to issued, generate QR code if it doesn't exist
    if ((validatedStatus === 'issued' || validatedStatus === 'paid') && !qrCode) {
      const zatcaData: ZatcaTags = {
        sellerName: tenant.name,
        vatNumber: tenant.trn || '',
        timestamp: new Date().toISOString(),
        invoiceTotal: invoice.totalAmount,
        vatTotal: invoice.vatAmount
      };
      qrCode = generateZatcaQrCode(zatcaData);
      isReported = false;
    }
    
    await db.update(invoices).set({
      status: validatedStatus,
      zatcaQrCode: qrCode,
      isZatcaReported: isReported,
      updatedAt: new Date()
    }).where(and(eq(invoices.id, id), eq(invoices.tenantId, tenant.id)));

    if ((validatedStatus === 'issued' || validatedStatus === 'paid') && !invoice.invoiceNumber.startsWith('POS-')) {
      await postIssuedInvoice({
        tenantId: tenant.id,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        subtotal: invoice.subtotal,
        vatAmount: invoice.vatAmount,
        totalAmount: invoice.totalAmount,
        currency: invoice.currency,
        entryDate: invoice.issueDate,
      });
    }

    if (validatedStatus === 'paid' && !invoice.invoiceNumber.startsWith('POS-')) {
      await postInvoicePayment({
        tenantId: tenant.id,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        amount: invoice.totalAmount,
        currency: invoice.currency,
      });
    }
    
    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard/accounting');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

export async function getInvoiceById(id: string) {
  try {
    const tenant = await requireTenant();
    
    const data = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.tenantId, tenant.id), eq(invoices.id, id)))
      .limit(1);
      
    if (data.length === 0) {
      return { success: false, error: 'الفاتورة غير موجودة' };
    }
    
    return { success: true, data: data[0] };
  } catch (error: unknown) {
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}
