/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use server';

import { db } from '@/lib/db/db';
import { warehouses, products, inventoryLevels, stockMovements } from '@/lib/db/schema/inventory';
import { eq, and } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';

export async function getWarehouses() {
  try {
    const tenant = await requireTenant();
    const data = await db.select().from(warehouses).where(eq(warehouses.tenantId, tenant.id));
    
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getInventoryDistribution() {
  try {
    const tenant = await requireTenant();
    
    // Get all products, warehouses, and levels
    const allProducts = await db.select().from(products).where(eq(products.tenantId, tenant.id));
    const allWarehouses = await db.select().from(warehouses).where(eq(warehouses.tenantId, tenant.id));
    const levels = await db.select().from(inventoryLevels).where(eq(inventoryLevels.tenantId, tenant.id));
    
    // Transform into a matrix for the UI:
    // [{ product: { id, name, sku }, warehouses: { [warehouseId]: quantity }, total: sum }]
    
    const distribution = allProducts.map(product => {
      const productLevels = levels.filter(l => l.productId === product.id);
      
      const whData: Record<string, number> = {};
      let total = 0;
      
      allWarehouses.forEach(wh => {
        const level = productLevels.find(l => l.warehouseId === wh.id);
        whData[wh.id] = level ? level.quantity : 0;
        total += whData[wh.id];
      });
      
      return {
        product: { id: product.id, name: product.name, sku: product.sku },
        warehouses: whData,
        total
      };
    });
    
    return { success: true, data: distribution, warehousesList: allWarehouses };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function transferStock(productId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number) {
  try {
    if (!Number.isInteger(quantity) || quantity <= 0) return { success: false, error: 'الكمية يجب أن تكون رقماً صحيحاً أكبر من صفر' };
    if (fromWarehouseId === toWarehouseId) return { success: false, error: 'لا يمكن النقل لنفس المستودع' };
    
    const tenant = await requireTenant();

    await db.transaction(async (tx) => {
      const fromLevelData = await tx.select().from(inventoryLevels)
        .where(and(eq(inventoryLevels.tenantId, tenant.id), eq(inventoryLevels.productId, productId), eq(inventoryLevels.warehouseId, fromWarehouseId)))
        .limit(1);
      
      if (fromLevelData.length === 0 || fromLevelData[0].quantity < quantity) {
        throw new Error('الكمية المتوفرة في المستودع المصدر غير كافية');
      }
    
      const toLevelData = await tx.select().from(inventoryLevels)
        .where(and(eq(inventoryLevels.tenantId, tenant.id), eq(inventoryLevels.productId, productId), eq(inventoryLevels.warehouseId, toWarehouseId)))
        .limit(1);
    
      await tx.update(inventoryLevels)
        .set({ quantity: fromLevelData[0].quantity - quantity, lastUpdated: new Date() })
        .where(and(eq(inventoryLevels.id, fromLevelData[0].id), eq(inventoryLevels.tenantId, tenant.id)));
      
      if (toLevelData.length > 0) {
        await tx.update(inventoryLevels)
          .set({ quantity: toLevelData[0].quantity + quantity, lastUpdated: new Date() })
          .where(and(eq(inventoryLevels.id, toLevelData[0].id), eq(inventoryLevels.tenantId, tenant.id)));
      } else {
        await tx.insert(inventoryLevels).values({
          tenantId: tenant.id,
          productId,
          warehouseId: toWarehouseId,
          quantity,
        });
      }
    
      await tx.insert(stockMovements).values([
        {
          tenantId: tenant.id,
          productId,
          warehouseId: fromWarehouseId,
          type: 'OUT',
          quantity,
          referenceId: toWarehouseId,
          notes: `نقل إلى مستودع آخر (${toWarehouseId})`,
        },
        {
          tenantId: tenant.id,
          productId,
          warehouseId: toWarehouseId,
          type: 'IN',
          quantity,
          referenceId: fromWarehouseId,
          notes: `استلام من مستودع آخر (${fromWarehouseId})`,
        },
      ]);
    });
    
    revalidatePath('/dashboard/inventory/warehouses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
