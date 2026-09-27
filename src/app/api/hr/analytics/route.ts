import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  generateHRAnalytics,
  getHRAnalytics,
  getAnalyticsSnapshot,
  comparePeriods,
  getEmployeeRetentionRate,
  getPayrollTrend,
  getDepartmentBreakdown,
  getHeadcountForecast,
  deleteAnalyticsSnapshot,
} from '@/lib/hr';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'analytics') {
      const limit = Number(searchParams.get('limit')) || 12;
      const analytics = await getHRAnalytics(tenant.id, limit);
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

    if (action === 'compare-periods') {
      const period1Id = searchParams.get('period1Id');
      const period2Id = searchParams.get('period2Id');

      if (!period1Id || !period2Id) {
        return NextResponse.json({ success: false, error: 'Both period IDs are required' }, { status: 400 });
      }

      const comparison = await comparePeriods(tenant.id, period1Id, period2Id);
      return NextResponse.json({ success: true, data: comparison });
    }

    if (action === 'retention-rate') {
      const months = Number(searchParams.get('months')) || 12;
      const retention = await getEmployeeRetentionRate(tenant.id, months);
      return NextResponse.json({ success: true, data: retention });
    }

    if (action === 'payroll-trend') {
      const months = Number(searchParams.get('months')) || 12;
      const trend = await getPayrollTrend(tenant.id, months);
      return NextResponse.json({ success: true, data: trend });
    }

    if (action === 'department-breakdown') {
      const breakdown = await getDepartmentBreakdown(tenant.id);
      return NextResponse.json({ success: true, data: breakdown });
    }

    if (action === 'headcount-forecast') {
      const months = Number(searchParams.get('months')) || 6;
      const forecast = await getHeadcountForecast(tenant.id, months);
      return NextResponse.json({ success: true, data: forecast });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin', 'hr');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'generate-analytics') {
      const { periodType, periodStart, periodEnd } = body;

      const analytics = await generateHRAnalytics({
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
    await requireRole('admin', 'hr');
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
