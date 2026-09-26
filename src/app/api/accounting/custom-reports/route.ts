import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createCustomReport,
  getCustomReports,
  generateCustomReport,
  generatePeriodComparison,
  createReportSnapshot,
  getReportSnapshots,
  deleteCustomReport,
} from '@/lib/accounting';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const reports = await getCustomReports(tenant.id);
      return NextResponse.json({ success: true, data: reports });
    }

    if (action === 'generate') {
      const reportId = searchParams.get('reportId');
      if (!reportId) {
        return NextResponse.json({ success: false, error: 'Report ID is required' }, { status: 400 });
      }

      const report = await generateCustomReport(tenant.id, reportId);
      return NextResponse.json({ success: true, data: report });
    }

    if (action === 'period-comparison') {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      if (!startDate || !endDate) {
        return NextResponse.json({ success: false, error: 'Start date and end date are required' }, { status: 400 });
      }

      const comparison = await generatePeriodComparison(tenant.id, startDate, endDate);
      return NextResponse.json({ success: true, data: comparison });
    }

    if (action === 'snapshots') {
      const reportType = searchParams.get('reportType') || undefined;
      const limit = Number(searchParams.get('limit')) || 12;

      const snapshots = await getReportSnapshots(tenant.id, reportType, limit);
      return NextResponse.json({ success: true, data: snapshots });
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

    if (action === 'create') {
      const { name, description, reportType, configuration } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const report = await createCustomReport(
        tenant.id,
        name,
        description,
        reportType,
        configuration,
        userId
      );

      return NextResponse.json({ success: true, data: report });
    }

    if (action === 'snapshot') {
      const { reportType, periodType, periodStart, periodEnd, data } = body;

      const snapshot = await createReportSnapshot(
        tenant.id,
        reportType,
        periodType,
        new Date(periodStart),
        new Date(periodEnd),
        data
      );

      return NextResponse.json({ success: true, data: snapshot });
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
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json({ success: false, error: 'Report ID is required' }, { status: 400 });
    }

    await deleteCustomReport(tenant.id, reportId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
