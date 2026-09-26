import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createReorderSettings,
  getReorderSettings,
  updateReorderSettings,
  deleteReorderSettings,
  checkReorderNeeded,
  createLowStockAlert,
  getAlerts,
  resolveAlert,
  checkExpiredProducts,
  checkExpiringSoonProducts,
  createOverstockAlert,
  generateReorderRecommendations,
  getAlertStats,
} from '@/lib/inventory';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'reorder-settings') {
      const productId = searchParams.get('productId') || undefined;
      const settings = await getReorderSettings(tenant.id, productId);
      return NextResponse.json({ success: true, data: settings });
    }

    if (action === 'reorder-needed') {
      const reorderNeeded = await checkReorderNeeded(tenant.id);
      return NextResponse.json({ success: true, data: reorderNeeded });
    }

    if (action === 'alerts') {
      const productId = searchParams.get('productId') || undefined;
      const isResolved = searchParams.get('isResolved') === 'true' ? true : searchParams.get('isResolved') === 'false' ? false : undefined;
      const alerts = await getAlerts(tenant.id, productId, isResolved);
      return NextResponse.json({ success: true, data: alerts });
    }

    if (action === 'alert-stats') {
      const stats = await getAlertStats(tenant.id);
      return NextResponse.json({ success: true, data: stats });
    }

    if (action === 'expired') {
      const expired = await checkExpiredProducts(tenant.id);
      return NextResponse.json({ success: true, data: expired });
    }

    if (action === 'expiring-soon') {
      const daysThreshold = Number(searchParams.get('days')) || 30;
      const expiringSoon = await checkExpiringSoonProducts(tenant.id, daysThreshold);
      return NextResponse.json({ success: true, data: expiringSoon });
    }

    if (action === 'reorder-recommendations') {
      const recommendations = await generateReorderRecommendations(tenant.id);
      return NextResponse.json({ success: true, data: recommendations });
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

    if (action === 'create-reorder-settings') {
      const { productId, warehouseId, reorderPoint, reorderQuantity, leadTimeDays, safetyStock, maxStockLevel, autoOrder, preferredSupplierId } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const settings = await createReorderSettings({
        tenantId: tenant.id,
        productId,
        warehouseId,
        reorderPoint,
        reorderQuantity,
        leadTimeDays,
        safetyStock,
        maxStockLevel,
        autoOrder,
        preferredSupplierId,
        userId,
      });

      return NextResponse.json({ success: true, data: settings });
    }

    if (action === 'create-low-stock-alert') {
      const { productId, warehouseId, currentQuantity, reorderPoint } = body;

      const alert = await createLowStockAlert(tenant.id, productId, warehouseId, currentQuantity, reorderPoint);
      return NextResponse.json({ success: true, data: alert });
    }

    if (action === 'create-overstock-alert') {
      const { productId, warehouseId, currentQuantity, maxStockLevel } = body;

      const alert = await createOverstockAlert(tenant.id, productId, warehouseId, currentQuantity, maxStockLevel);
      return NextResponse.json({ success: true, data: alert });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('admin', 'inventory');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'update-reorder-settings') {
      const { settingsId, updates } = body;

      const settings = await updateReorderSettings(settingsId, tenant.id, updates);
      return NextResponse.json({ success: true, data: settings });
    }

    if (action === 'resolve-alert') {
      const { alertId } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const alert = await resolveAlert(alertId, tenant.id, userId);
      return NextResponse.json({ success: true, data: alert });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin', 'inventory');
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'delete-reorder-settings') {
      const settingsId = searchParams.get('settingsId');
      if (!settingsId) {
        return NextResponse.json({ success: false, error: 'Settings ID is required' }, { status: 400 });
      }

      await deleteReorderSettings(settingsId, tenant.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
