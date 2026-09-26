import { db } from '@/lib/db/db';
import {
  inventoryReorderSettings,
  inventoryLevels,
  inventoryAlerts,
} from '@/lib/db/schema/inventory_extensions';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export interface ReorderSettingsInput {
  tenantId: string;
  productId: string;
  warehouseId?: string;
  reorderPoint: number;
  reorderQuantity: number;
  leadTimeDays?: number;
  safetyStock?: number;
  maxStockLevel?: number;
  autoOrder?: boolean;
  preferredSupplierId?: string;
  userId: string;
}

export async function createReorderSettings(input: ReorderSettingsInput) {
  const [settings] = await db
    .insert(inventoryReorderSettings)
    .values({
      tenantId: input.tenantId,
      productId: input.productId,
      warehouseId: input.warehouseId,
      reorderPoint: input.reorderPoint,
      reorderQuantity: input.reorderQuantity,
      leadTimeDays: input.leadTimeDays || 7,
      safetyStock: input.safetyStock || 0,
      maxStockLevel: input.maxStockLevel,
      autoOrder: input.autoOrder || false,
      preferredSupplierId: input.preferredSupplierId,
      isActive: true,
    })
    .returning();

  return settings;
}

export async function getReorderSettings(tenantId: string, productId?: string) {
  const query = db
    .select()
    .from(inventoryReorderSettings)
    .where(and(eq(inventoryReorderSettings.tenantId, tenantId), eq(inventoryReorderSettings.isActive, true)));

  if (productId) {
    query.where(and(
      eq(inventoryReorderSettings.tenantId, tenantId),
      eq(inventoryReorderSettings.isActive, true),
      eq(inventoryReorderSettings.productId, productId)
    ));
  }

  return query.orderBy(inventoryReorderSettings.productId);
}

export async function updateReorderSettings(
  settingsId: string,
  tenantId: string,
  updates: Partial<{
    reorderPoint: number;
    reorderQuantity: number;
    leadTimeDays: number;
    safetyStock: number;
    maxStockLevel: number;
    autoOrder: boolean;
    preferredSupplierId: string;
    isActive: boolean;
  }>
) {
  const [settings] = await db
    .update(inventoryReorderSettings)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(inventoryReorderSettings.id, settingsId), eq(inventoryReorderSettings.tenantId, tenantId)))
    .returning();

  return settings;
}

export async function deleteReorderSettings(settingsId: string, tenantId: string) {
  await db
    .update(inventoryReorderSettings)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(inventoryReorderSettings.id, settingsId), eq(inventoryReorderSettings.tenantId, tenantId)));
}

export async function checkReorderNeeded(tenantId: string) {
  const settings = await getReorderSettings(tenantId);
  const reorderNeeded = [];

  for (const setting of settings) {
    const [level] = await db
      .select({ quantity: inventoryLevels.quantity })
      .from(inventoryLevels)
      .where(and(
        eq(inventoryLevels.productId, setting.productId),
        setting.warehouseId ? eq(inventoryLevels.warehouseId, setting.warehouseId) : undefined
      ))
      .limit(1);

    const currentQuantity = level?.quantity || 0;
    const reorderPoint = setting.reorderPoint + setting.safetyStock;

    if (currentQuantity <= reorderPoint) {
      reorderNeeded.push({
        productId: setting.productId,
        warehouseId: setting.warehouseId,
        currentQuantity,
        reorderPoint,
        reorderQuantity: setting.reorderQuantity,
        leadTimeDays: setting.leadTimeDays,
        autoOrder: setting.autoOrder,
        preferredSupplierId: setting.preferredSupplierId,
      });
    }
  }

  return reorderNeeded;
}

export async function createLowStockAlert(
  tenantId: string,
  productId: string,
  warehouseId: string | undefined,
  currentQuantity: number,
  reorderPoint: number
) {
  const severity = currentQuantity === 0 ? 'critical' : currentQuantity < reorderPoint / 2 ? 'high' : 'medium';

  const [alert] = await db
    .insert(inventoryAlerts)
    .values({
      tenantId,
      productId,
      warehouseId,
      alertType: 'low_stock',
      severity,
      currentValue: currentQuantity,
      thresholdValue: reorderPoint,
      message: `Product ${productId} is running low on stock. Current: ${currentQuantity}, Reorder point: ${reorderPoint}`,
      isResolved: false,
    })
    .returning();

  return alert;
}

export async function getAlerts(tenantId: string, productId?: string, isResolved?: boolean) {
  const query = db
    .select()
    .from(inventoryAlerts)
    .where(eq(inventoryAlerts.tenantId, tenantId));

  if (productId) {
    query.where(and(eq(inventoryAlerts.tenantId, tenantId), eq(inventoryAlerts.productId, productId)));
  }

  if (isResolved !== undefined) {
    query.where(and(
      eq(inventoryAlerts.tenantId, tenantId),
      eq(inventoryAlerts.isResolved, isResolved)
    ));
  }

  return query.orderBy(desc(inventoryAlerts.createdAt));
}

export async function resolveAlert(alertId: string, tenantId: string, userId: string) {
  const [alert] = await db
    .update(inventoryAlerts)
    .set({
      isResolved: true,
      resolvedAt: new Date(),
      resolvedByUserId: userId,
      updatedAt: new Date(),
    })
    .where(and(eq(inventoryAlerts.id, alertId), eq(inventoryAlerts.tenantId, tenantId)))
    .returning();

  return alert;
}

export async function checkExpiredProducts(tenantId: string) {
  // This would check products with expiry dates
  // For now, return empty array
  return [];
}

export async function checkExpiringSoonProducts(tenantId: string, daysThreshold = 30) {
  // This would check products expiring within the threshold
  // For now, return empty array
  return [];
}

export async function createOverstockAlert(
  tenantId: string,
  productId: string,
  warehouseId: string | undefined,
  currentQuantity: number,
  maxStockLevel: number
) {
  const [alert] = await db
    .insert(inventoryAlerts)
    .values({
      tenantId,
      productId,
      warehouseId,
      alertType: 'overstock',
      severity: 'medium',
      currentValue: currentQuantity,
      thresholdValue: maxStockLevel,
      message: `Product ${productId} is overstocked. Current: ${currentQuantity}, Max level: ${maxStockLevel}`,
      isResolved: false,
    })
    .returning();

  return alert;
}

export async function generateReorderRecommendations(tenantId: string) {
  const reorderNeeded = await checkReorderNeeded(tenantId);
  const recommendations = [];

  for (const item of reorderNeeded) {
    const priority = item.currentQuantity === 0 ? 'urgent' : item.currentQuantity < item.reorderPoint / 2 ? 'high' : 'normal';

    recommendations.push({
      productId: item.productId,
      warehouseId: item.warehouseId,
      priority,
      currentQuantity: item.currentQuantity,
      suggestedOrderQuantity: item.reorderQuantity,
      leadTimeDays: item.leadTimeDays,
      autoOrder: item.autoOrder,
      preferredSupplierId: item.preferredSupplierId,
      estimatedArrivalDate: new Date(Date.now() + item.leadTimeDays * 24 * 60 * 60 * 1000),
    });
  }

  return recommendations;
}

export async function getAlertStats(tenantId: string) {
  const alerts = await getAlerts(tenantId);

  const stats = {
    total: alerts.length,
    unresolved: alerts.filter(a => !a.isResolved).length,
    resolved: alerts.filter(a => a.isResolved).length,
    byType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
  };

  for (const alert of alerts) {
    stats.byType[alert.alertType] = (stats.byType[alert.alertType] || 0) + 1;
    stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
  }

  return stats;
}
