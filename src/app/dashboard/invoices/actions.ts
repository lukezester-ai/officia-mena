'use server'

import { db } from '@/lib/db/db';
import { invoices } from '@/lib/db/schema/invoices';
import { requireTenant } from '@/lib/auth/get-tenant';
import { generateZatcaQrCode } from '@/lib/zatca';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createInvoice(formData: FormData) {
  const tenant = await requireTenant();
  
  // Extract data from form
  const clientName = formData.get('clientName') as string;
  const clientCrn = formData.get('clientCrn') as string;
  const clientAddress = formData.get('clientAddress') as string;
  
  // Items as JSON string from a hidden field
  const itemsJson = formData.get('items') as string;
  const items = JSON.parse(itemsJson || '[]');
  
  // Calculate totals
  let subtotal = 0;
  for (const item of items) {
    subtotal += (Number(item.price) * Number(item.quantity));
  }
  
  const vatRate = 0.15; // 15% VAT for Saudi Arabia
  const vatAmount = subtotal * vatRate;
  const totalAmount = subtotal + vatAmount;
  
  const issueDate = new Date();
  
  // Generate ZATCA QR Code (Phase 1)
  const qrHash = generateZatcaQrCode({
    sellerName: tenant.name,
    vatRegistrationNumber: tenant.trn || '300000000000003', // fallback to demo TRN
    timestamp: issueDate.toISOString(),
    invoiceTotal: totalAmount.toFixed(2),
    vatTotal: vatAmount.toFixed(2),
  });

  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  await db.insert(invoices).values({
    tenantId: tenant.id,
    invoiceNumber,
    issueDate,
    clientName,
    clientCrn,
    clientAddress,
    subtotal: subtotal.toFixed(2),
    vatRate: '15.00',
    vatAmount: vatAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
    items: JSON.stringify(items),
    zatcaQrCode: qrHash,
    status: 'issued'
  });

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
