/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use server';

import { db } from '@/lib/db/db';
import { installments } from '@/lib/db/schema/installments';
import { invoices } from '@/lib/db/schema/invoices';
import { eq, and } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';

export async function createInstallmentPlan(invoiceId: string, numberOfInstallments: number) {
  try {
    const tenant = await requireTenant();
    
    // Fetch the invoice
    const invData = await db.select().from(invoices).where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenant.id))).limit(1);
    if (invData.length === 0) return { success: false, error: 'Invoice not found' };
    
    const invoice = invData[0];
    const totalAmount = parseFloat(invoice.totalAmount || '0');
    
    if (totalAmount <= 0) return { success: false, error: 'Invoice amount must be greater than zero' };
    
    const installmentAmount = (totalAmount / numberOfInstallments).toFixed(2);
    
    const newInstallments = [];
    const currentDate = new Date();
    
    // Create installments spaced by 1 month
    for (let i = 0; i < numberOfInstallments; i++) {
      const dueDate = new Date(currentDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1); // 1st payment in 1 month
      
      newInstallments.push({
        tenantId: tenant.id,
        invoiceId: invoice.id,
        amount: installmentAmount,
        dueDate: dueDate,
        status: 'pending'
      });
    }
    
    // Delete any existing installments for this invoice first
    await db.delete(installments).where(and(eq(installments.invoiceId, invoiceId), eq(installments.tenantId, tenant.id)));
    
    // Insert new ones
    await db.insert(installments).values(newInstallments);
    
    revalidatePath('/dashboard/invoices');
    return { success: true };
  } catch (error: any) {
    console.error('Create installment plan error:', error);
    return { success: false, error: error.message };
  }
}

export async function getInvoiceInstallments(invoiceId: string) {
  try {
    const tenant = await requireTenant();
    
    const data = await db
      .select()
      .from(installments)
      .where(and(eq(installments.invoiceId, invoiceId), eq(installments.tenantId, tenant.id)))
      .orderBy(installments.dueDate);
      
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function payInstallment(installmentId: string) {
  try {
    const tenant = await requireTenant();
    
    await db.update(installments)
      .set({ status: 'paid', paidAt: new Date(), updatedAt: new Date() })
      .where(and(eq(installments.id, installmentId), eq(installments.tenantId, tenant.id)));
      
    revalidatePath('/dashboard/invoices');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
