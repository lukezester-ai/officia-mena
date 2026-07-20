/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db/db';
import { invoices } from '@/lib/db/schema/invoices';
import { eq, desc, and } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';
import { generateZatcaQrCode, ZatcaTags } from '@/lib/accounting/zatca-qr';

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
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createInvoice(data: {
  clientName: string;
  clientTrn?: string;
  subtotal: number;
  vatRate: number; // e.g. 15 for 15%
  isDraft: boolean;
  notes?: string;
}) {
  try {
    const tenant = await requireTenant();
    
    const subtotal = data.subtotal;
    const vatAmount = subtotal * (data.vatRate / 100);
    const totalAmount = subtotal + vatAmount;
    
    let qrCode = null;
    const status = data.isDraft ? 'draft' : 'issued';
    
    // Only generate ZATCA QR if it's actually issued (official)
    if (!data.isDraft) {
      const zatcaData: ZatcaTags = {
        sellerName: 'Officia MENA Corp', // Hardcoded company name for now
        vatNumber: '310123456700003', // Dummy TRN
        timestamp: new Date().toISOString(),
        invoiceTotal: totalAmount.toFixed(2),
        vatTotal: vatAmount.toFixed(2)
      };
      
      qrCode = generateZatcaQrCode(zatcaData);
    }
    
    // Generate an invoice number (INV-YYYYMMDD-Random)
    const invNumber = `INV-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)}`;

    await db.insert(invoices).values({
      tenantId: tenant.id,
      invoiceNumber: invNumber,
      clientName: data.clientName,
      clientTrn: data.clientTrn || null,
      subtotal: subtotal.toFixed(2),
      vatRate: data.vatRate.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      issueDate: new Date(),
      status: status,
      zatcaQrCode: qrCode,
      isZatcaReported: !data.isDraft, // simplified: if issued, we consider it reported/compliant
      notes: data.notes
    });
    
    revalidatePath('/dashboard/invoices');
    return { success: true, invoiceNumber: invNumber };
  } catch (error: any) {
    console.error('Invoice creation error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateInvoiceStatus(id: string, newStatus: string) {
  try {
    const tenant = await requireTenant();
    
    // First, fetch the invoice to ensure it exists and get its details
    const invData = await db.select().from(invoices).where(and(eq(invoices.id, id), eq(invoices.tenantId, tenant.id))).limit(1);
    if (invData.length === 0) {
      return { success: false, error: 'Invoice not found' };
    }
    
    const invoice = invData[0];
    
    let qrCode = invoice.zatcaQrCode;
    let isReported = invoice.isZatcaReported;
    
    // If transitioning from draft to issued, generate QR code if it doesn't exist
    if (newStatus === 'issued' && !qrCode) {
      const zatcaData: ZatcaTags = {
        sellerName: 'Officia MENA Corp',
        vatNumber: '310123456700003',
        timestamp: new Date().toISOString(),
        invoiceTotal: invoice.totalAmount,
        vatTotal: invoice.vatAmount
      };
      qrCode = generateZatcaQrCode(zatcaData);
      isReported = true;
    }
    
    await db.update(invoices).set({
      status: newStatus,
      zatcaQrCode: qrCode,
      isZatcaReported: isReported,
      updatedAt: new Date()
    }).where(and(eq(invoices.id, id), eq(invoices.tenantId, tenant.id)));
    
    revalidatePath('/dashboard/invoices');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
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
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
