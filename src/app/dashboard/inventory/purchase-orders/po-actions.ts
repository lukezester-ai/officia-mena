/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use server';

import { db } from '@/lib/db/db';
import { purchaseOrders } from '@/lib/db/schema/purchase_orders';
import { products, inventoryLevels, stockMovements } from '@/lib/db/schema/inventory';
import { eq, desc, and } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';

export async function getPOs() {
  try {
    const tenant = await requireTenant();
    const data = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.tenantId, tenant.id))
      .orderBy(desc(purchaseOrders.createdAt))
      .limit(50);
      
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createPO(data: {
  supplierName: string;
  subtotal: number;
  vatRate: number;
  notes?: string;
}) {
  try {
    const tenant = await requireTenant();
    
    const subtotal = data.subtotal;
    const vatAmount = subtotal * (data.vatRate / 100);
    const totalAmount = subtotal + vatAmount;
    
    const poNumber = `PO-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)}`;

    await db.insert(purchaseOrders).values({
      tenantId: tenant.id,
      poNumber: poNumber,
      supplierName: data.supplierName,
      subtotal: subtotal.toFixed(2),
      vatRate: data.vatRate.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      status: 'sent',
      notes: data.notes
    });
    
    revalidatePath('/dashboard/inventory/purchase-orders');
    return { success: true, poNumber };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function receivePO(id: string, warehouseId: string) {
  try {
    const tenant = await requireTenant();
    
    // 1. Fetch PO
    const poData = await db.select().from(purchaseOrders).where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.tenantId, tenant.id))).limit(1);
    if (poData.length === 0) return { success: false, error: 'PO not found' };
    const po = poData[0];
    
    if (po.status === 'received') return { success: false, error: 'تم استلام هذه الطلبية مسبقاً' };
    
    // 2. Parse items from notes
    const notes = po.notes || '';
    if (!notes.includes('المنتجات:\n')) {
      return { success: false, error: 'لا يمكن استلام أمر شراء بدون بنود منتجات موثقة' };
    }
    
    const lines = notes.split('\n').filter(l => l.startsWith('- '));
    const items = lines.map(line => {
      const match = line.match(/- (.+) \(الكمية: ([\d.]+), السعر: ([\d.]+)\)/);
      if (match) {
        return { name: match[1].trim(), quantity: parseFloat(match[2]), price: parseFloat(match[3]) };
      }
      return null;
    }).filter(Boolean) as {name: string, quantity: number, price: number}[];

    if (items.length === 0) {
      return { success: false, error: 'لا يمكن استلام أمر شراء بدون كميات وأسعار واضحة' };
    }

    await db.transaction(async (tx) => {
      for (const item of items) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.price < 0) {
          throw new Error('بنود أمر الشراء يجب أن تحتوي على كمية صحيحة وسعر صالح');
        }

        let prodId: string;
        const existingProduct = await tx.select().from(products).where(and(eq(products.tenantId, tenant.id), eq(products.name, item.name))).limit(1);
      
        if (existingProduct.length > 0) {
          prodId = existingProduct[0].id;
        } else {
          const sku = `PO-${po.poNumber}-${items.indexOf(item) + 1}`;
          const inserted = await tx.insert(products).values({
            tenantId: tenant.id,
            name: item.name,
            sku,
            unitPrice: item.price.toString(),
            costPrice: item.price.toString(),
            description: `Auto-created from ${po.poNumber}`
          }).returning({ id: products.id });
          prodId = inserted[0].id;
        }
      
        const existingLevel = await tx.select().from(inventoryLevels)
          .where(and(eq(inventoryLevels.tenantId, tenant.id), eq(inventoryLevels.productId, prodId), eq(inventoryLevels.warehouseId, warehouseId)))
          .limit(1);
        
        if (existingLevel.length > 0) {
          await tx.update(inventoryLevels)
            .set({ quantity: existingLevel[0].quantity + item.quantity, lastUpdated: new Date() })
            .where(and(eq(inventoryLevels.id, existingLevel[0].id), eq(inventoryLevels.tenantId, tenant.id)));
        } else {
          await tx.insert(inventoryLevels).values({
            tenantId: tenant.id,
            productId: prodId,
            warehouseId,
            quantity: item.quantity
          });
        }
        
        await tx.insert(stockMovements).values({
          tenantId: tenant.id,
          productId: prodId,
          warehouseId,
          type: 'IN',
          quantity: item.quantity,
          referenceId: po.poNumber,
          notes: `استلام من أمر شراء ${po.poNumber}`
        });
      }

      await tx.update(purchaseOrders)
        .set({ status: 'received', updatedAt: new Date() })
        .where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.tenantId, tenant.id)));
    });
    
    revalidatePath('/dashboard/inventory/purchase-orders');
    revalidatePath('/dashboard/inventory/warehouses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
