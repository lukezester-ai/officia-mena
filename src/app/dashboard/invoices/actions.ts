'use server';

import { checkHalalComplianceForSale, HalalProductData } from '@/lib/inventory/halal-checker';
import { generateZatcaQrCode } from '@/lib/accounting/zatca-qr';

export interface InvoiceItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
  isHalalCertified: boolean;
  hijriExpiry?: string;
  halalExpiryDate?: Date;
}

export async function createInvoiceWithChecks(clientName: string, items: InvoiceItem[]) {
  // 1. Compliance Check (Halal & Hijri)
  for (const item of items) {
    const productData: HalalProductData = {
      sku: item.sku,
      isHalalCertified: item.isHalalCertified,
      halalExpiryDate: item.halalExpiryDate,
      expiryDateHijri: item.hijriExpiry
    };

    const check = checkHalalComplianceForSale(productData);
    
    if (!check.isValid && check.severity === 'BLOCK') {
      return {
        success: false,
        error: `تم حظر الفاتورة: المنتج "${item.name}" غير صالح للبيع. ${check.reason}`
      };
    }
  }

  // 2. Calculate Totals (VAT 15%)
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const vatAmount = subtotal * 0.15;
  const total = subtotal + vatAmount;

  // 3. Generate ZATCA Phase 2 QR Code
  const qrCode = generateZatcaQrCode({
    sellerName: 'الرمال الذهبية ذ.م.م',
    vatNumber: '310122393500003',
    timestamp: new Date().toISOString(),
    invoiceTotal: total.toFixed(2),
    vatTotal: vatAmount.toFixed(2)
  });

  // 4. Simulate saving to DB and deducting from Inventory
  // db.insert(invoices)...
  // db.update(inventory_levels)...

  return {
    success: true,
    invoiceId: `INV-${Math.floor(Math.random() * 10000)}`,
    qrCode,
    total: total.toFixed(2),
    message: 'تم إصدار الفاتورة وتحديث المخزون بنجاح.'
  };
}
