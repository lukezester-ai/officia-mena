/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use server';

import { db } from '@/lib/db/db';
import { quotations } from '@/lib/db/schema/quotations';
import { invoices } from '@/lib/db/schema/invoices';
import { eq, desc, and } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';
import { generateZatcaQrCode, ZatcaTags } from '@/lib/accounting/zatca-qr';
import { postIssuedInvoice } from '@/lib/accounting/postings';

export async function getQuotations() {
  try {
    const tenant = await requireTenant();
    
    const data = await db
      .select()
      .from(quotations)
      .where(eq(quotations.tenantId, tenant.id))
      .orderBy(desc(quotations.createdAt))
      .limit(50);
      
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createQuotation(data: {
  clientName: string;
  clientTrn?: string;
  subtotal: number;
  vatRate: number;
  notes?: string;
}) {
  try {
    const tenant = await requireTenant();
    
    const subtotal = data.subtotal;
    const vatAmount = subtotal * (data.vatRate / 100);
    const totalAmount = subtotal + vatAmount;
    
    const quoteNumber = `QT-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)}`;

    await db.insert(quotations).values({
      tenantId: tenant.id,
      quotationNumber: quoteNumber,
      clientName: data.clientName,
      clientTrn: data.clientTrn || null,
      subtotal: subtotal.toFixed(2),
      vatRate: data.vatRate.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      issueDate: new Date(),
      status: 'sent',
      notes: data.notes
    });
    
    revalidatePath('/dashboard/quotations');
    return { success: true, quotationNumber: quoteNumber };
  } catch (error: any) {
    console.error('Quotation creation error:', error);
    return { success: false, error: error.message };
  }
}

export async function convertToInvoice(quotationId: string) {
  try {
    const tenant = await requireTenant();
    
    // Fetch the quotation
    const quoteData = await db.select().from(quotations).where(and(eq(quotations.id, quotationId), eq(quotations.tenantId, tenant.id))).limit(1);
    if (quoteData.length === 0) {
      return { success: false, error: 'Quotation not found' };
    }
    
    const quote = quoteData[0];
    
    if (quote.status === 'converted') {
      return { success: false, error: 'Already converted to invoice' };
    }

    // Generate ZATCA QR
    const zatcaData: ZatcaTags = {
      sellerName: 'Officia MENA Corp',
      vatNumber: '310123456700003',
      timestamp: new Date().toISOString(),
      invoiceTotal: quote.totalAmount,
      vatTotal: quote.vatAmount
    };
    const qrCode = generateZatcaQrCode(zatcaData);
    
    const invNumber = `INV-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)}`;

    // Insert Invoice
    const [invoice] = await db.insert(invoices).values({
      tenantId: tenant.id,
      invoiceNumber: invNumber,
      clientName: quote.clientName,
      clientTrn: quote.clientTrn,
      subtotal: quote.subtotal,
      vatRate: quote.vatRate,
      vatAmount: quote.vatAmount,
      totalAmount: quote.totalAmount,
      issueDate: new Date(),
      status: 'issued',
      zatcaQrCode: qrCode,
      isZatcaReported: true,
      notes: quote.notes // Pass the items along
    }).returning();

    await postIssuedInvoice({
      tenantId: tenant.id,
      invoiceId: invoice.id,
      invoiceNumber: invNumber,
      clientName: quote.clientName,
      subtotal: quote.subtotal,
      vatAmount: quote.vatAmount,
      totalAmount: quote.totalAmount,
      currency: invoice.currency,
      entryDate: invoice.issueDate,
    });

    // Mark quotation as converted
    await db.update(quotations).set({
      status: 'converted',
      updatedAt: new Date()
    }).where(and(eq(quotations.id, quotationId), eq(quotations.tenantId, tenant.id)));
    
    revalidatePath('/dashboard/quotations');
    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard/accounting');
    return { success: true, invoiceNumber: invNumber };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
