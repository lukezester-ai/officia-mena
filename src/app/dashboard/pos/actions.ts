/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db/db';
import { products, inventoryLevels, stockMovements } from '@/lib/db/schema/inventory';
import { invoices } from '@/lib/db/schema/invoices';
import { eq, sql } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';
import { generateZatcaQrCode, ZatcaTags } from '@/lib/accounting/zatca-qr';

export async function getPosProducts() {
  try {
    const tenant = await requireTenant();
    
    // Fetch all products for this tenant with their quantities
    const data = await db
      .select({
        id: products.id,
        name: products.name,
        unitPrice: products.unitPrice,
        category: products.category,
        qty: inventoryLevels.quantity
      })
      .from(products)
      .leftJoin(inventoryLevels, eq(products.id, inventoryLevels.productId))
      .where(eq(products.tenantId, tenant.id))
      .limit(100); // Limit for POS performance
      
    // Map data to ensure no null quantities
    const mapped = data.map(p => ({
      ...p,
      qty: p.qty || 0
    }));
      
    // If no products exist, we can return some dummy ones for the UI demo
    if (data.length === 0) {
      return {
        success: true,
        data: [
          { id: '1', name: 'Arabica Coffee Beans', unitPrice: '45.00', category: 'Beverages' },
          { id: '2', name: 'Premium Dates (1kg)', unitPrice: '120.00', category: 'Food' },
          { id: '3', name: 'Office Chair (Ergonomic)', unitPrice: '450.00', category: 'Furniture' },
          { id: '4', name: 'Logitech Mouse', unitPrice: '150.00', category: 'Electronics' },
          { id: '5', name: 'A4 Printer Paper (Box)', unitPrice: '65.00', category: 'Office Supplies' },
          { id: '6', name: 'Oud Perfume (50ml)', unitPrice: '300.00', category: 'Cosmetics' }
        ]
      };
    }
    return { success: true, data: mapped };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkoutPos(data: {
  items: any[];
  subtotal: number;
  vatRate: number; // e.g. 15 for 15%
  paymentMethod: string;
}) {
  try {
    const tenant = await requireTenant();
    
    const subtotal = data.subtotal;
    const vatAmount = subtotal * (data.vatRate / 100);
    const totalAmount = subtotal + vatAmount;
    
    // 1. Generate ZATCA QR (Since POS is immediate issuance)
    const zatcaData: ZatcaTags = {
      sellerName: 'Officia MENA Corp (POS)',
      vatNumber: '310123456700003',
      timestamp: new Date().toISOString(),
      invoiceTotal: totalAmount.toFixed(2),
      vatTotal: vatAmount.toFixed(2)
    };
    const qrCode = generateZatcaQrCode(zatcaData);
    
    // 2. Generate Invoice Number
    const invNumber = `POS-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)}`;

    // 3. Insert into Invoices Table (B2C Cash Customer)
    await db.insert(invoices).values({
      tenantId: tenant.id,
      invoiceNumber: invNumber,
      clientName: 'Cash Customer (B2C)',
      clientTrn: null,
      subtotal: subtotal.toFixed(2),
      vatRate: data.vatRate.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      issueDate: new Date(),
      status: 'issued',
      zatcaQrCode: qrCode,
      isZatcaReported: true
    });
    // 4. Cross-Department Automation: Deduct Inventory
    for (const item of data.items) {
      if (!item.id || item.id.length < 10) continue; // Skip dummy products without real UUIDs
      
      // Reduce inventory
      await db.update(inventoryLevels)
        .set({ quantity: sql`${inventoryLevels.quantity} - ${item.qty}` })
        .where(eq(inventoryLevels.productId, item.id));
        
      // Record stock movement (optional but good for tracking)
      // We assume warehouseId is the first one found for this product, for simplicity
      const invLevel = await db.query.inventoryLevels.findFirst({
        where: eq(inventoryLevels.productId, item.id)
      });
      if (invLevel) {
        await db.insert(stockMovements).values({
          tenantId: tenant.id,
          productId: item.id,
          warehouseId: invLevel.warehouseId,
          type: 'OUT',
          quantity: item.qty,
          referenceId: invNumber,
          notes: 'POS Sale'
        });
      }
    }
    
    revalidatePath('/dashboard/inventory');
    revalidatePath('/dashboard/taxes');
    
    return { success: true, invoiceNumber: invNumber, qrCode };
  } catch (error: any) {
    console.error('POS Checkout error:', error);
    return { success: false, error: error.message };
  }
}
