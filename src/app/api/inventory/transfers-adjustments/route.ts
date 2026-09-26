import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createTransfer,
  startTransfer,
  completeTransfer,
  cancelTransfer,
  getTransfer,
  getTransfers,
  createAdjustment,
  getAdjustments,
  getTransferStats,
  getAdjustmentStats,
} from '@/lib/inventory';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'transfers') {
      const status = searchParams.get('status') || undefined;
      const transfers = await getTransfers(tenant.id, status);
      return NextResponse.json({ success: true, data: transfers });
    }

    if (action === 'transfer') {
      const transferId = searchParams.get('transferId');
      if (!transferId) {
        return NextResponse.json({ success: false, error: 'Transfer ID is required' }, { status: 400 });
      }

      const transfer = await getTransfer(transferId, tenant.id);
      return NextResponse.json({ success: true, data: transfer });
    }

    if (action === 'adjustments') {
      const productId = searchParams.get('productId') || undefined;
      const adjustments = await getAdjustments(tenant.id, productId);
      return NextResponse.json({ success: true, data: adjustments });
    }

    if (action === 'transfer-stats') {
      const stats = await getTransferStats(tenant.id);
      return NextResponse.json({ success: true, data: stats });
    }

    if (action === 'adjustment-stats') {
      const stats = await getAdjustmentStats(tenant.id);
      return NextResponse.json({ success: true, data: stats });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin', 'inventory');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'create-transfer') {
      const { productId, fromWarehouseId, toWarehouseId, quantity, expectedArrivalDate, referenceNumber, notes } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const transfer = await createTransfer({
        tenantId: tenant.id,
        productId,
        fromWarehouseId,
        toWarehouseId,
        quantity,
        expectedArrivalDate: expectedArrivalDate ? new Date(expectedArrivalDate) : undefined,
        referenceNumber,
        notes,
        userId,
      });

      return NextResponse.json({ success: true, data: transfer });
    }

    if (action === 'start-transfer') {
      const { transferId } = body;

      const transfer = await startTransfer(transferId, tenant.id);
      return NextResponse.json({ success: true, data: transfer });
    }

    if (action === 'complete-transfer') {
      const { transferId } = body;

      const transfer = await completeTransfer(transferId, tenant.id);
      return NextResponse.json({ success: true, data: transfer });
    }

    if (action === 'cancel-transfer') {
      const { transferId } = body;

      const transfer = await cancelTransfer(transferId, tenant.id);
      return NextResponse.json({ success: true, data: transfer });
    }

    if (action === 'create-adjustment') {
      const { productId, warehouseId, adjustmentType, newQuantity, reason, referenceDocument } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const adjustment = await createAdjustment({
        tenantId: tenant.id,
        productId,
        warehouseId,
        adjustmentType,
        newQuantity,
        reason,
        referenceDocument,
        userId,
      });

      return NextResponse.json({ success: true, data: adjustment });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
