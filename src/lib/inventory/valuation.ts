import { db } from '@/lib/db/db';
import {
  inventoryValuation,
  inventoryLevels,
  stockMovements,
} from '@/lib/db/schema/inventory_extensions';
import { eq, and, desc } from 'drizzle-orm';

export interface ValuationLayer {
  quantity: number;
  unitCost: number;
  date: Date;
  movementId: string;
}

export interface ValuationInput {
  tenantId: string;
  productId: string;
  warehouseId: string;
  valuationMethod: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE';
  userId: string;
}

export async function calculateInventoryValuation(input: ValuationInput) {
  const [currentLevel] = await db
    .select({ quantity: inventoryLevels.quantity })
    .from(inventoryLevels)
    .where(and(
      eq(inventoryLevels.productId, input.productId),
      eq(inventoryLevels.warehouseId, input.warehouseId)
    ))
    .limit(1);

  const movements = await db
    .select({
      id: stockMovements.id,
      type: stockMovements.type,
      quantity: stockMovements.quantity,
      createdAt: stockMovements.createdAt,
    })
    .from(stockMovements)
    .where(and(
      eq(stockMovements.productId, input.productId),
      eq(stockMovements.warehouseId, input.warehouseId),
      eq(stockMovements.type, 'IN')
    ))
    .orderBy(stockMovements.createdAt);

  const currentQuantity = currentLevel?.quantity || 0;

  let totalValue = 0;
  let unitCost = 0;
  let layerData: ValuationLayer[] = [];

  switch (input.valuationMethod) {
    case 'FIFO':
      ({ totalValue, unitCost, layerData } = calculateFIFO(movements, currentQuantity));
      break;
    case 'LIFO':
      ({ totalValue, unitCost, layerData } = calculateLIFO(movements, currentQuantity));
      break;
    case 'WEIGHTED_AVERAGE':
      ({ totalValue, unitCost, layerData } = calculateWeightedAverage(movements, currentQuantity));
      break;
  }

  const [valuation] = await db
    .insert(inventoryValuation)
    .values({
      tenantId: input.tenantId,
      productId: input.productId,
      warehouseId: input.warehouseId,
      valuationMethod: input.valuationMethod,
      unitCost: unitCost.toFixed(2),
      totalValue: totalValue.toFixed(2),
      quantity: currentQuantity,
      valuationDate: new Date(),
      layerData: layerData as any,
    })
    .returning();

  return valuation;
}

function calculateFIFO(movements: any[], currentQuantity: number) {
  const layers: ValuationLayer[] = [];
  let remainingQuantity = currentQuantity;
  let totalValue = 0;

  for (const movement of movements) {
    if (remainingQuantity <= 0) break;

    const layerQuantity = Math.min(movement.quantity, remainingQuantity);
    const layerValue = layerQuantity * 10; // Would use actual cost from movement
    totalValue += layerValue;

    layers.push({
      quantity: layerQuantity,
      unitCost: 10, // Would use actual cost
      date: movement.createdAt,
      movementId: movement.id,
    });

    remainingQuantity -= layerQuantity;
  }

  const unitCost = currentQuantity > 0 ? totalValue / currentQuantity : 0;

  return { totalValue, unitCost, layerData: layers };
}

function calculateLIFO(movements: any[], currentQuantity: number) {
  const layers: ValuationLayer[] = [];
  let remainingQuantity = currentQuantity;
  let totalValue = 0;

  // Process movements in reverse order (newest first)
  for (let i = movements.length - 1; i >= 0; i--) {
    const movement = movements[i];
    if (remainingQuantity <= 0) break;

    const layerQuantity = Math.min(movement.quantity, remainingQuantity);
    const layerValue = layerQuantity * 10; // Would use actual cost from movement
    totalValue += layerValue;

    layers.push({
      quantity: layerQuantity,
      unitCost: 10, // Would use actual cost
      date: movement.createdAt,
      movementId: movement.id,
    });

    remainingQuantity -= layerQuantity;
  }

  const unitCost = currentQuantity > 0 ? totalValue / currentQuantity : 0;

  return { totalValue, unitCost, layerData: layers };
}

function calculateWeightedAverage(movements: any[], currentQuantity: number) {
  let totalQuantity = 0;
  let totalCost = 0;

  for (const movement of movements) {
    const movementCost = movement.quantity * 10; // Would use actual cost
    totalQuantity += movement.quantity;
    totalCost += movementCost;
  }

  const unitCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;
  const totalValue = currentQuantity * unitCost;

  const layers: ValuationLayer[] = [{
    quantity: currentQuantity,
    unitCost,
    date: new Date(),
    movementId: 'weighted-average',
  }];

  return { totalValue, unitCost, layerData: layers };
}

export async function getInventoryValuation(
  productId: string,
  warehouseId: string,
  tenantId: string
) {
  const [valuation] = await db
    .select()
    .from(inventoryValuation)
    .where(and(
      eq(inventoryValuation.productId, productId),
      eq(inventoryValuation.warehouseId, warehouseId),
      eq(inventoryValuation.tenantId, tenantId)
    ))
    .orderBy(desc(inventoryValuation.valuationDate))
    .limit(1);

  return valuation;
}

export async function getValuationHistory(
  productId: string,
  warehouseId: string,
  tenantId: string,
  limit = 12
) {
  return db
    .select()
    .from(inventoryValuation)
    .where(and(
      eq(inventoryValuation.productId, productId),
      eq(inventoryValuation.warehouseId, warehouseId),
      eq(inventoryValuation.tenantId, tenantId)
    ))
    .orderBy(desc(inventoryValuation.valuationDate))
    .limit(limit);
}

export async function getTotalInventoryValue(tenantId: string) {
  const valuations = await db
    .select()
    .from(inventoryValuation)
    .where(eq(inventoryValuation.tenantId, tenantId))
    .orderBy(desc(inventoryValuation.valuationDate));

  // Get the latest valuation for each product/warehouse combination
  const latestValuations = new Map();
  for (const valuation of valuations) {
    const key = `${valuation.productId}-${valuation.warehouseId}`;
    if (!latestValuations.has(key)) {
      latestValuations.set(key, valuation);
    }
  }

  let totalValue = 0;
  for (const valuation of latestValuations.values()) {
    totalValue += Number(valuation.totalValue);
  }

  return {
    totalValue: totalValue.toFixed(2),
    itemCount: latestValuations.size,
    valuations: Array.from(latestValuations.values()),
  };
}

export async function compareValuationMethods(
  productId: string,
  warehouseId: string,
  tenantId: string
) {
  const methods: Array<'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE'> = ['FIFO', 'LIFO', 'WEIGHTED_AVERAGE'];
  const comparison = [];

  for (const method of methods) {
    const valuation = await calculateInventoryValuation({
      tenantId,
      productId,
      warehouseId,
      valuationMethod: method,
      userId: 'system',
    });

    comparison.push({
      method,
      totalValue: Number(valuation.totalValue),
      unitCost: Number(valuation.unitCost),
      quantity: valuation.quantity,
    });
  }

  return comparison;
}
