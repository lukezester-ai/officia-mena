import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  generateInventoryAnalytics,
  getInventoryAnalytics,
  getAnalyticsSnapshot,
  getSlowMovingProducts,
  getFastMovingProducts,
  generateDemandForecast,
  getForecast,
  getStockoutRisk,
  getInventoryHealthScore,
  deleteAnalyticsSnapshot,
} from '@/lib/inventory';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'analytics') {
      const limit = Number(searchParams.get('limit')) || 12;
      const analytics = await getInventoryAnalytics(tenant.id, limit);
      return NextResponse.json({ success: true, data: analytics });
    }

    if (action === 'analytics-snapshot') {
      const snapshotId = searchParams.get('snapshotId');
      if (!snapshotId) {
        return NextResponse.json({ success: false, error: 'Snapshot ID is required' }, { status: 400 });
      }

      const snapshot = await getAnalyticsSnapshot(tenant.id, snapshotId);
      return NextResponse.json({ success: true, data: snapshot });
    }

    if (action === 'slow-moving') {
      const daysThreshold = Number(searchParams.get('days')) || 90;
      const slowMoving = await getSlowMovingProducts(tenant.id, daysThreshold);
      return NextResponse.json({ success: true, data: slowMoving });
    }

    if (action === 'fast-moving') {
      const daysThreshold = Number(searchParams.get('days')) || 30;
      const fastMoving = await getFastMovingProducts(tenant.id, daysThreshold);
      return NextResponse.json({ success: true, data: fastMoving });
    }

    if (action === 'forecast') {
      const productId = searchParams.get('productId');
      if (!productId) {
        return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
      }

      const forecast = await getForecast(productId, tenant.id);
      return NextResponse.json({ success: true, data: forecast });
    }

    if (action === 'stockout-risk') {
      const productId = searchParams.get('productId');
      const warehouseId = searchParams.get('warehouseId');

      if (!productId || !warehouseId) {
        return NextResponse.json({ success: false, error: 'Product ID and Warehouse ID are required' }, { status: 400 });
      }

      const risk = await getStockoutRisk(productId, warehouseId, tenant.id);
      return NextResponse.json({ success: true, data: risk });
    }

    if (action === 'health-score') {
      const healthScore = await getInventoryHealthScore(tenant.id);
      return NextResponse.json({ success: true, data: healthScore });
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

    if (action === 'generate-analytics') {
      const { periodType, periodStart, periodEnd } = body;

      const analytics = await generateInventoryAnalytics({
        tenantId: tenant.id,
        periodType,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
      });

      return NextResponse.json({ success: true, data: analytics });
    }

    if (action === 'generate-forecast') {
      const { productId, forecastPeriod, monthsAhead } = body;

      const forecast = await generateDemandForecast(tenant.id, productId, forecastPeriod, monthsAhead);
      return NextResponse.json({ success: true, data: forecast });
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
    const snapshotId = searchParams.get('snapshotId');

    if (!snapshotId) {
      return NextResponse.json({ success: false, error: 'Snapshot ID is required' }, { status: 400 });
    }

    await deleteAnalyticsSnapshot(snapshotId, tenant.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
