import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createLeaveType,
  getLeaveTypes,
  updateLeaveType,
  deleteLeaveType,
  initializeLeaveBalance,
  getLeaveBalances,
  updateLeaveBalance,
  createLeaveRequest,
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  getLeaveRequestsByDateRange,
  getLeaveStatistics,
} from '@/lib/hr';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'leave-types') {
      const types = await getLeaveTypes(tenant.id);
      return NextResponse.json({ success: true, data: types });
    }

    if (action === 'leave-balances') {
      const employeeId = searchParams.get('employeeId');
      const year = searchParams.get('year') ? Number(searchParams.get('year')) : undefined;

      if (!employeeId) {
        return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
      }

      const balances = await getLeaveBalances(employeeId, tenant.id, year);
      return NextResponse.json({ success: true, data: balances });
    }

    if (action === 'leave-requests') {
      const employeeId = searchParams.get('employeeId') || undefined;
      const status = searchParams.get('status') || undefined;

      const requests = await getLeaveRequests(tenant.id, employeeId, status);
      return NextResponse.json({ success: true, data: requests });
    }

    if (action === 'leave-by-date-range') {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      if (!startDate || !endDate) {
        return NextResponse.json({ success: false, error: 'Start date and end date are required' }, { status: 400 });
      }

      const requests = await getLeaveRequestsByDateRange(tenant.id, new Date(startDate), new Date(endDate));
      return NextResponse.json({ success: true, data: requests });
    }

    if (action === 'leave-statistics') {
      const year = searchParams.get('year') ? Number(searchParams.get('year')) : undefined;
      const stats = await getLeaveStatistics(tenant.id, year);
      return NextResponse.json({ success: true, data: stats });
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

    if (action === 'create-leave-type') {
      const { name, description, code, daysPerYear, isPaid, requiresApproval, requiresDocument } = body;

      const leaveType = await createLeaveType({
        tenantId: tenant.id,
        name,
        description,
        code,
        daysPerYear,
        isPaid,
        requiresApproval,
        requiresDocument,
      });

      return NextResponse.json({ success: true, data: leaveType });
    }

    if (action === 'initialize-balance') {
      const { employeeId, leaveTypeId, year } = body;

      const balance = await initializeLeaveBalance(tenant.id, employeeId, leaveTypeId, year);
      return NextResponse.json({ success: true, data: balance });
    }

    if (action === 'create-leave-request') {
      const { employeeId, leaveTypeId, startDate, endDate, totalDays, reason, attachmentUrl } = body;

      const request = await createLeaveRequest({
        tenantId: tenant.id,
        employeeId,
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays,
        reason,
        attachmentUrl,
      });

      return NextResponse.json({ success: true, data: request });
    }

    if (action === 'approve-request') {
      const { requestId, approverId } = body;

      const request = await approveLeaveRequest(requestId, tenant.id, approverId);
      return NextResponse.json({ success: true, data: request });
    }

    if (action === 'reject-request') {
      const { requestId, approverId, reason } = body;

      const request = await rejectLeaveRequest(requestId, tenant.id, approverId, reason);
      return NextResponse.json({ success: true, data: request });
    }

    if (action === 'cancel-request') {
      const { requestId } = body;

      const request = await cancelLeaveRequest(requestId, tenant.id);
      return NextResponse.json({ success: true, data: request });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('admin', 'hr');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'update-leave-type') {
      const { leaveTypeId, updates } = body;

      const leaveType = await updateLeaveType(leaveTypeId, tenant.id, updates);
      return NextResponse.json({ success: true, data: leaveType });
    }

    if (action === 'update-balance') {
      const { balanceId, updates } = body;

      const balance = await updateLeaveBalance(balanceId, tenant.id, updates);
      return NextResponse.json({ success: true, data: balance });
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
    const action = searchParams.get('action');

    if (action === 'delete-leave-type') {
      const leaveTypeId = searchParams.get('leaveTypeId');
      if (!leaveTypeId) {
        return NextResponse.json({ success: false, error: 'Leave type ID is required' }, { status: 400 });
      }

      await deleteLeaveType(leaveTypeId, tenant.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
