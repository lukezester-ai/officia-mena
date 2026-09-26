import { db } from '@/lib/db/db';
import {
  inventoryAnalytics,
  inventoryForecasting,
  inventoryLevels,
  stockMovements,
} from '@/lib/db/schema/inventory_extensions';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export interface AnalyticsInput {
  tenantId: string;
  periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  periodStart: Date;
  periodEnd: Date;
}

export async function generateInventoryAnalytics(input: AnalyticsInput) {
  const levels = await db
    .select({
      productId: inventoryLevels.productId,
      warehouseId: inventoryLevels.warehouseId,
      quantity: inventoryLevels.quantity,
    })
    .from(inventoryLevels)
    .where(eq(inventoryLevels.tenantId, input.tenantId));

  const totalProducts = new Set(levels.map(l => l.productId)).size;
  const totalValue = 0; // Would need cost prices from products

  // Count low stock, out of stock, overstock
  const lowStockCount = 0; // Would need minStockLevel from products
  const outOfStockCount = levels.filter(l => l.quantity === 0).length;
  const overstockCount = 0; // Would need maxStockLevel from reorder settings

  // Calculate turnover rate (simplified)
  const turnoverRate = 2.5; // Would calculate from sales data

  const analyticsData = {
    totalProducts,
    totalValue: totalValue.toFixed(2),
    lowStockCount,
    outOfStockCount,
    overstockCount,
    expiredCount: 0, // Would check expiry dates
    turnoverRate: turnoverRate.toFixed(2),
    byWarehouse: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    movementStats: {
      totalIn: 0,
      totalOut: 0,
      netChange: 0,
    },
  };

  // Group by warehouse
  for (const level of levels) {
    analyticsData.byWarehouse[level.warehouseId] = (analyticsData.byWarehouse[level.warehouseId] || 0) + level.quantity;
  }

  // Get movement stats
  const movements = await db
    .select({
      type: stockMovements.type,
      quantity: stockMovements.quantity,
    })
    .from(stockMovements)
    .where(and(
      eq(stockMovements.tenantId, input.tenantId),
      gte(stockMovements.createdAt, input.periodStart),
      lte(stockMovements.createdAt, input.periodEnd)
    ));

  for (const movement of movements) {
    if (movement.type === 'IN') {
      analyticsData.movementStats.totalIn += movement.quantity;
    } else if (movement.type === 'OUT') {
      analyticsData.movementStats.totalOut += movement.quantity;
    }
  }

  analyticsData.movementStats.netChange = analyticsData.movementStats.totalIn - analyticsData.movementStats.totalOut;

  // Store analytics snapshot
  const [analytics] = await db
    .insert(inventoryAnalytics)
    .values({
      tenantId: input.tenantId,
      periodType: input.periodType,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      totalProducts,
      totalValue: totalValue.toFixed(2),
      lowStockCount,
      outOfStockCount,
      overstockCount,
      expiredCount: 0,
      turnoverRate: turnoverRate.toFixed(2),
      data: analyticsData as any,
    })
    .returning();

  return analytics;
}

export async function getInventoryAnalytics(tenantId: string, limit = 12) {
  return db
    .select()
    .from(inventoryAnalytics)
    .where(eq(inventoryAnalytics.tenantId, tenantId))
    .orderBy(desc(inventoryAnalytics.periodStart))
    .limit(limit);
}

export async function getAnalyticsSnapshot(tenantId: string, snapshotId: string) {
  const [analytics] = await db
    .select()
    .from(inventoryAnalytics)
    .where(and(eq(inventoryAnalytics.id, snapshotId), eq(inventoryAnalytics.tenantId, tenantId)))
    .limit(1);

  return analytics;
}

export async function getSlowMovingProducts(tenantId: string, daysThreshold = 90) {
  // Get products with no OUT movements in the last X days
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  const movements = await db
    .select({
      productId: stockMovements.productId,
      lastMovementDate: stockMovements.createdAt,
    })
    .from(stockMovements)
    .where(and(
      eq(stockMovements.tenantId, tenantId),
      eq(stockMovements.type, 'OUT'),
      gte(stockMovements.createdAt, thresholdDate)
    ));

  const movedProductIds = new Set(movements.map(m => m.productId));

  // Get all products
  const levels = await db
    .select({
      productId: inventoryLevels.productId,
      quantity: inventoryLevels.quantity,
    })
    .from(inventoryLevels)
    .where(eq(inventoryLevels.tenantId, tenantId));

  const slowMoving = levels
    .filter(l => !movedProductIds.has(l.productId) && l.quantity > 0)
    .map(l => ({
      productId: l.productId,
      quantity: l.quantity,
      daysSinceLastMovement: daysThreshold,
    }));

  return slowMoving;
}

export async function getFastMovingProducts(tenantId: string, daysThreshold = 30) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  const movements = await db
    .select({
      productId: stockMovements.productId,
      quantity: stockMovements.quantity,
    })
    .from(stockMovements)
    .where(and(
      eq(stockMovements.tenantId, tenantId),
      eq(stockMovements.type, 'OUT'),
      gte(stockMovements.createdAt, thresholdDate)
    ));

  const productMovements = new Map();
  for (const movement of movements) {
    const current = productMovements.get(movement.productId) || 0;
    productMovements.set(movement.productId, current + movement.quantity);
  }

  const fastMoving = Array.from(productMovements.entries())
    .map(([productId, quantity]) => ({ productId, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 20);

  return fastMoving;
}

export async function generateDemandForecast(
  tenantId: string,
  productId: string,
  forecastPeriod: 'weekly' | 'monthly' | 'quarterly',
  monthsAhead = 6
) {
  // Simple forecasting based on historical movements
  const historicalMovements = await db
    .select({
      quantity: stockMovements.quantity,
      createdAt: stockMovements.createdAt,
    })
    .from(stockMovements)
    .where(and(
      eq(stockMovements.tenantId, tenantId),
      eq(stockMovements.productId, productId),
      eq(stockMovements.type, 'OUT')
    ))
    .orderBy(stockMovements.createdAt)
    .limit(100);

  const forecastData = [];
  const periodDays = forecastPeriod === 'weekly' ? 7 : forecastPeriod === 'monthly' ? 30 : 90;

  for (let i = 1; i <= monthsAhead; i++) {
    const forecastDate = new Date();
    forecastDate.setMonth(forecastDate.getMonth() + i);

    // Simple average-based forecasting
    const avgDemand = historicalMovements.length > 0
      ? historicalMovements.reduce((sum, m) => sum + m.quantity, 0) / historicalMovements.length
      : 0;

    const forecastedDemand = avgDemand * (forecastPeriod === 'weekly' ? 4 : forecastPeriod === 'monthly' ? 1 : 0.33);

    forecastData.push({
      period: forecastDate.toISOString().split('T')[0],
      forecastedDemand: Math.round(forecastedDemand),
      confidence: 0.7, // Simplified confidence
    });
  }

  const [forecast] = await db
    .insert(inventoryForecasting)
    .values({
      tenantId,
      productId,
      forecastType: 'demand',
      forecastPeriod,
      forecastDate: new Date(),
      forecastData: forecastData as any,
      confidence: 0.7,
      lastTrainedAt: new Date(),
    })
    .returning();

  return forecast;
}

export async function getForecast(productId: string, tenantId: string) {
  const [forecast] = await db
    .select()
    .from(inventoryForecasting)
    .where(and(
      eq(inventoryForecasting.productId, productId),
      eq(inventoryForecasting.tenantId, tenantId)
    ))
    .orderBy(desc(inventoryForecasting.forecastDate))
    .limit(1);

  return forecast;
}

export async function getStockoutRisk(productId: string, warehouseId: string, tenantId: string) {
  const [level] = await db
    .select({ quantity: inventoryLevels.quantity })
    .from(inventoryLevels)
    .where(and(
      eq(inventoryLevels.productId, productId),
      eq(inventoryLevels.warehouseId, warehouseId)
    ))
    .limit(1);

  const currentQuantity = level?.quantity || 0;

  // Get demand forecast
  const forecast = await getForecast(productId, tenantId);
  const forecastData = forecast?.forecastData as any[] || [];
  const weeklyDemand = forecastData.length > 0 ? forecastData[0].forecastedDemand : 0;

  // Calculate weeks of stock
  const weeksOfStock = weeklyDemand > 0 ? currentQuantity / weeklyDemand : Infinity;

  const risk = weeksOfStock < 1 ? 'high' : weeksOfStock < 2 ? 'medium' : 'low';

  return {
    currentQuantity,
    weeklyDemand,
    weeksOfStock: weeksOfStock === Infinity ? 'N/A' : weeksOfStock.toFixed(1),
    risk,
    recommendedAction: risk === 'high' ? 'Reorder immediately' : risk === 'medium' ? 'Reorder soon' : 'Monitor',
  };
}

export async function getInventoryHealthScore(tenantId: string) {
  const levels = await db
    .select()
    .from(inventoryLevels)
    .where(eq(inventoryLevels.tenantId, tenantId));

  const alerts = await db
    .select()
    .from(inventoryAnalytics)
    .where(eq(inventoryAnalytics.tenantId, tenantId))
    .orderBy(desc(inventoryAnalytics.periodStart))
    .limit(1);

  const latestAlerts = alerts[0]?.data as any || {};

  // Calculate health score (0-100)
  const outOfStockPenalty = latestAlerts.outOfStockCount * 5;
  const lowStockPenalty = latestAlerts.lowStockCount * 2;
  const overstockPenalty = latestAlerts.overstockCount * 1;

  const totalProducts = levels.length;
  const baseScore = 100;
  const penalty = outOfStockPenalty + lowStockPenalty + overstockPenalty;
  const healthScore = Math.max(0, baseScore - penalty);

  return {
    healthScore,
    outOfStockCount: latestAlerts.outOfStockCount || 0,
    lowStockCount: latestAlerts.lowStockCount || 0,
    overstockCount: latestAlerts.overstockCount || 0,
    totalProducts,
    grade: healthScore >= 90 ? 'A' : healthScore >= 80 ? 'B' : healthScore >= 70 ? 'C' : healthScore >= 60 ? 'D' : 'F',
  };
}

export async function deleteAnalyticsSnapshot(snapshotId: string, tenantId: string) {
  await db
    .delete(inventoryAnalytics)
    .where(and(eq(inventoryAnalytics.id, snapshotId), eq(inventoryAnalytics.tenantId, tenantId)));
}
