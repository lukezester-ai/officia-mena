import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  generateInvoiceAnalytics,
  getInvoiceAnalytics,
  getAnalyticsSnapshot,
  comparePeriods,
  getTopClients,
  getInvoiceAgingReport,
  getRevenueForecast,
  deleteAnalyticsSnapshot,
} from '@/lib/invoicing';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const limit = Number(searchParams.get('limit')) || 12;
      const analytics = await getInvoiceAnalytics(tenant.id, limit);
      return NextResponse.json({ success: true, data: analytics });
    }

    if (action === 'snapshot') {
      const snapshotId = searchParams.get('snapshotId');
      if (!snapshotId) {
        return NextResponse.json({ success: false, error: 'Snapshot ID is required' }, { status: 400 });
      }

      const snapshot = await getAnalyticsSnapshot(tenant.id, snapshotId);
      return NextResponse.json({ success: true, data: snapshot });
    }

    if (action === 'compare') {
      const period1Id = searchParams.get('period1Id');
      const period2Id = searchParams.get('period2Id');

      if (!period1Id || !period2Id) {
        return NextResponse.json({ success: false, error: 'Both period IDs are required' }, { status: 400 });
      }

      const comparison = await comparePeriods(tenant.id, period1Id, period2Id);
      return NextResponse.json({ success: true, data: comparison });
    }

    if (action === 'top-clients') {
      const limit = Number(searchParams.get('limit')) || 10;
      const clients = await getTopClients(tenant.id, limit);
      return NextResponse.json({ success: true, data: clients });
    }

    if (action === 'aging') {
      const aging = await getInvoiceAgingReport(tenant.id);
      return NextResponse.json({ success: true, data: aging });
    }

    if (action === 'forecast') {
      const months = Number(searchParams.get('months')) || 6;
      const forecast = await getRevenueForecast(tenant.id, months);
      return NextResponse.json({ success: true, data: forecast });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'generate') {
      const { periodType, periodStart, periodEnd } = body;

      const analytics = await generateInvoiceAnalytics({
        tenantId: tenant.id,
        periodType,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
      });

      return NextResponse.json({ success: true, data: analytics });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin', 'finance');
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
