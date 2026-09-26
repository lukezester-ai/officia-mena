import { db } from '@/lib/db/db';
import {
  inventoryTransfers,
  inventoryAdjustments,
  inventoryLevels,
  stockMovements,
} from '@/lib/db/schema/inventory_extensions';
import { eq, and, desc } from 'drizzle-orm';

export interface TransferInput {
  tenantId: string;
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  expectedArrivalDate?: Date;
  referenceNumber?: string;
  notes?: string;
  userId: string;
}

export async function createTransfer(input: TransferInput) {
  // Check if source warehouse has enough stock
  const [sourceLevel] = await db
    .select({ quantity: inventoryLevels.quantity })
    .from(inventoryLevels)
    .where(and(
      eq(inventoryLevels.productId, input.productId),
      eq(inventoryLevels.warehouseId, input.fromWarehouseId)
    ))
    .limit(1);

  if (!sourceLevel || sourceLevel.quantity < input.quantity) {
    throw new Error('Insufficient stock in source warehouse');
  }

  const [transfer] = await db
    .insert(inventoryTransfers)
    .values({
      tenantId: input.tenantId,
      productId: input.productId,
      fromWarehouseId: input.fromWarehouseId,
      toWarehouseId: input.toWarehouseId,
      quantity: input.quantity,
      status: 'pending',
      expectedArrivalDate: input.expectedArrivalDate,
      referenceNumber: input.referenceNumber,
      notes: input.notes,
      createdByUserId: input.userId,
    })
    .returning();

  return transfer;
}

export async function startTransfer(transferId: string, tenantId: string) {
  // Deduct from source warehouse
  const transfer = await getTransfer(transferId, tenantId);
  if (!transfer) {
    throw new Error('Transfer not found');
  }

  await db
    .update(inventoryLevels)
    .set({
      quantity: (inv) => inv.quantity - transfer.quantity,
      lastUpdated: new Date(),
    })
    .where(and(
      eq(inventoryLevels.productId, transfer.productId),
      eq(inventoryLevels.warehouseId, transfer.fromWarehouseId)
    ));

  // Create stock movement record
  await db
    .insert(stockMovements)
    .values({
      tenantId: transfer.tenantId,
      productId: transfer.productId,
      warehouseId: transfer.fromWarehouseId,
      type: 'OUT',
      quantity: transfer.quantity,
      referenceId: transferId,
      notes: `Transfer to warehouse ${transfer.toWarehouseId}`,
    });

  // Update transfer status
  const [updated] = await db
    .update(inventoryTransfers)
    .set({
      status: 'in_transit',
      transferDate: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(inventoryTransfers.id, transferId), eq(inventoryTransfers.tenantId, tenantId)))
    .returning();

  return updated;
}

export async function completeTransfer(transferId: string, tenantId: string) {
  const transfer = await getTransfer(transferId, tenantId);
  if (!transfer) {
    throw new Error('Transfer not found');
  }

  // Add to destination warehouse
  const [destLevel] = await db
    .select({ quantity: inventoryLevels.quantity })
    .from(inventoryLevels)
    .where(and(
      eq(inventoryLevels.productId, transfer.productId),
      eq(inventoryLevels.warehouseId, transfer.toWarehouseId)
    ))
    .limit(1);

  if (destLevel) {
    await db
      .update(inventoryLevels)
      .set({
        quantity: destLevel.quantity + transfer.quantity,
        lastUpdated: new Date(),
      })
      .where(eq(inventoryLevels.id, destLevel.id));
  } else {
    await db
      .insert(inventoryLevels)
      .values({
        tenantId: transfer.tenantId,
        productId: transfer.productId,
        warehouseId: transfer.toWarehouseId,
        quantity: transfer.quantity,
        lastUpdated: new Date(),
      });
  }

  // Create stock movement record
  await db
    .insert(stockMovements)
    .values({
      tenantId: transfer.tenantId,
      productId: transfer.productId,
      warehouseId: transfer.toWarehouseId,
      type: 'IN',
      quantity: transfer.quantity,
      referenceId: transferId,
      notes: `Transfer from warehouse ${transfer.fromWarehouseId}`,
    });

  // Update transfer status
  const [updated] = await db
    .update(inventoryTransfers)
    .set({
      status: 'completed',
      actualArrivalDate: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(inventoryTransfers.id, transferId), eq(inventoryTransfers.tenantId, tenantId)))
    .returning();

  return updated;
}

export async function cancelTransfer(transferId: string, tenantId: string) {
  const transfer = await getTransfer(transferId, tenantId);
  if (!transfer) {
    throw new Error('Transfer not found');
  }

  if (transfer.status === 'in_transit') {
    // Return stock to source warehouse
    await db
      .update(inventoryLevels)
      .set({
        quantity: (inv) => inv.quantity + transfer.quantity,
        lastUpdated: new Date(),
      })
      .where(and(
        eq(inventoryLevels.productId, transfer.productId),
        eq(inventoryLevels.warehouseId, transfer.fromWarehouseId)
      ));

    await db
      .insert(stockMovements)
      .values({
        tenantId: transfer.tenantId,
        productId: transfer.productId,
        warehouseId: transfer.fromWarehouseId,
        type: 'IN',
        quantity: transfer.quantity,
        referenceId: transferId,
        notes: 'Cancelled transfer - stock returned',
      });
  }

  const [updated] = await db
    .update(inventoryTransfers)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(and(eq(inventoryTransfers.id, transferId), eq(inventoryTransfers.tenantId, tenantId)))
    .returning();

  return updated;
}

export async function getTransfer(transferId: string, tenantId: string) {
  const [transfer] = await db
    .select()
    .from(inventoryTransfers)
    .where(and(eq(inventoryTransfers.id, transferId), eq(inventoryTransfers.tenantId, tenantId)))
    .limit(1);

  return transfer;
}

export async function getTransfers(tenantId: string, status?: string) {
  const query = db
    .select()
    .from(inventoryTransfers)
    .where(eq(inventoryTransfers.tenantId, tenantId));

  if (status) {
    query.where(and(eq(inventoryTransfers.tenantId, tenantId), eq(inventoryTransfers.status, status)));
  }

  return query.orderBy(desc(inventoryTransfers.createdAt));
}

export interface AdjustmentInput {
  tenantId: string;
  productId: string;
  warehouseId: string;
  adjustmentType: 'damage' | 'loss' | 'theft' | 'count_correction' | 'return';
  newQuantity: number;
  reason: string;
  referenceDocument?: string;
  userId: string;
}

export async function createAdjustment(input: AdjustmentInput) {
  const [currentLevel] = await db
    .select({ quantity: inventoryLevels.quantity })
    .from(inventoryLevels)
    .where(and(
      eq(inventoryLevels.productId, input.productId),
      eq(inventoryLevels.warehouseId, input.warehouseId)
    ))
    .limit(1);

  const previousQuantity = currentLevel?.quantity || 0;
  const adjustment = input.newQuantity - previousQuantity;

  const [adjustmentRecord] = await db
    .insert(inventoryAdjustments)
    .values({
      tenantId: input.tenantId,
      productId: input.productId,
      warehouseId: input.warehouseId,
      adjustmentType: input.adjustmentType,
      previousQuantity,
      newQuantity: input.newQuantity,
      adjustment,
      reason: input.reason,
      referenceDocument: input.referenceDocument,
      approvedByUserId: input.userId,
      approvedAt: new Date(),
    })
    .returning();

  // Update inventory level
  if (currentLevel) {
    await db
      .update(inventoryLevels)
      .set({
        quantity: input.newQuantity,
        lastUpdated: new Date(),
      })
      .where(eq(inventoryLevels.id, currentLevel.id));
  } else {
    await db
      .insert(inventoryLevels)
      .values({
        tenantId: input.tenantId,
        productId: input.productId,
        warehouseId: input.warehouseId,
        quantity: input.newQuantity,
        lastUpdated: new Date(),
      });
  }

  // Create stock movement record
  await db
    .insert(stockMovements)
    .values({
      tenantId: input.tenantId,
      productId: input.productId,
      warehouseId: input.warehouseId,
      type: 'ADJUSTMENT',
      quantity: adjustment,
      referenceId: adjustmentRecord.id,
      notes: `${input.adjustmentType}: ${input.reason}`,
    });

  return adjustmentRecord;
}

export async function getAdjustments(tenantId: string, productId?: string) {
  const query = db
    .select()
    .from(inventoryAdjustments)
    .where(eq(inventoryAdjustments.tenantId, tenantId));

  if (productId) {
    query.where(and(eq(inventoryAdjustments.tenantId, tenantId), eq(inventoryAdjustments.productId, productId)));
  }

  return query.orderBy(desc(inventoryAdjustments.createdAt));
}

export async function getTransferStats(tenantId: string) {
  const transfers = await getTransfers(tenantId);

  const stats = {
    total: transfers.length,
    pending: transfers.filter(t => t.status === 'pending').length,
    inTransit: transfers.filter(t => t.status === 'in_transit').length,
    completed: transfers.filter(t => t.status === 'completed').length,
    cancelled: transfers.filter(t => t.status === 'cancelled').length,
  };

  return stats;
}

export async function getAdjustmentStats(tenantId: string) {
  const adjustments = await getAdjustments(tenantId);

  const stats = {
    total: adjustments.length,
    byType: {} as Record<string, number>,
    totalAdjustment: adjustments.reduce((sum, adj) => sum + adj.adjustment, 0),
  };

  for (const adjustment of adjustments) {
    stats.byType[adjustment.adjustmentType] = (stats.byType[adjustment.adjustmentType] || 0) + 1;
  }

  return stats;
}
