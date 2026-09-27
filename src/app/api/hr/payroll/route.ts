import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  calculatePayroll,
  createPayrollRun,
  getPayrollRuns,
  getPayrollRun,
  updatePayrollRunStatus,
  generatePayrollReport,
  getPayrollStatistics,
  calculateYearEndBonus,
  calculateGOSIContributions,
} from '@/lib/hr';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'payroll-runs') {
      const limit = Number(searchParams.get('limit')) || 12;
      const runs = await getPayrollRuns(tenant.id, limit);
      return NextResponse.json({ success: true, data: runs });
    }

    if (action === 'payroll-run') {
      const runId = searchParams.get('runId');
      if (!runId) {
        return NextResponse.json({ success: false, error: 'Payroll run ID is required' }, { status: 400 });
      }

      const run = await getPayrollRun(runId, tenant.id);
      return NextResponse.json({ success: true, data: run });
    }

    if (action === 'calculate') {
      const periodMonth = Number(searchParams.get('periodMonth'));
      const periodYear = Number(searchParams.get('periodYear'));

      if (!periodMonth || !periodYear) {
        return NextResponse.json({ success: false, error: 'Period month and year are required' }, { status: 400 });
      }

      const payrollItems = await calculatePayroll(tenant.id, periodMonth, periodYear);
      return NextResponse.json({ success: true, data: payrollItems });
    }

    if (action === 'report') {
      const periodMonth = Number(searchParams.get('periodMonth'));
      const periodYear = Number(searchParams.get('periodYear'));

      if (!periodMonth || !periodYear) {
        return NextResponse.json({ success: false, error: 'Period month and year are required' }, { status: 400 });
      }

      const report = await generatePayrollReport(tenant.id, periodMonth, periodYear);
      return NextResponse.json({ success: true, data: report });
    }

    if (action === 'statistics') {
      const months = Number(searchParams.get('months')) || 12;
      const stats = await getPayrollStatistics(tenant.id, months);
      return NextResponse.json({ success: true, data: stats });
    }

    if (action === 'year-end-bonus') {
      const employeeId = searchParams.get('employeeId');
      const year = Number(searchParams.get('year'));

      if (!employeeId || !year) {
        return NextResponse.json({ success: false, error: 'Employee ID and year are required' }, { status: 400 });
      }

      const bonus = await calculateYearEndBonus(employeeId, tenant.id, year);
      return NextResponse.json({ success: true, data: bonus });
    }

    if (action === 'gosi-contributions') {
      const periodMonth = Number(searchParams.get('periodMonth'));
      const periodYear = Number(searchParams.get('periodYear'));

      if (!periodMonth || !periodYear) {
        return NextResponse.json({ success: false, error: 'Period month and year are required' }, { status: 400 });
      }

      const contributions = await calculateGOSIContributions(tenant.id, periodMonth, periodYear);
      return NextResponse.json({ success: true, data: contributions });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin', 'hr', 'finance');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'create-run') {
      const { periodMonth, periodYear } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const payroll = await createPayrollRun({
        tenantId: tenant.id,
        periodMonth,
        periodYear,
        userId,
      });

      return NextResponse.json({ success: true, data: payroll });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('admin', 'hr', 'finance');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'update-status') {
      const { runId, status } = body;

      const run = await updatePayrollRunStatus(runId, tenant.id, status);
      return NextResponse.json({ success: true, data: run });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
