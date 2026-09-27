import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createTimesheet,
  getTimesheets,
  updateTimesheet,
  submitTimesheet,
  approveTimesheet,
  rejectTimesheet,
  addTimeEntry,
  getTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
  createAttendanceRecord,
  getAttendanceRecords,
  updateAttendanceRecord,
  checkIn,
  checkOut,
  getAttendanceStatistics,
} from '@/lib/hr';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'timesheets') {
      const employeeId = searchParams.get('employeeId');
      const status = searchParams.get('status') || undefined;

      if (!employeeId) {
        return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
      }

      const timesheets = await getTimesheets(employeeId, tenant.id, status);
      return NextResponse.json({ success: true, data: timesheets });
    }

    if (action === 'time-entries') {
      const timesheetId = searchParams.get('timesheetId');
      if (!timesheetId) {
        return NextResponse.json({ success: false, error: 'Timesheet ID is required' }, { status: 400 });
      }

      const entries = await getTimeEntries(timesheetId, tenant.id);
      return NextResponse.json({ success: true, data: entries });
    }

    if (action === 'attendance') {
      const employeeId = searchParams.get('employeeId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      if (!employeeId) {
        return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
      }

      const records = await getAttendanceRecords(
        employeeId,
        tenant.id,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      return NextResponse.json({ success: true, data: records });
    }

    if (action === 'attendance-statistics') {
      const employeeId = searchParams.get('employeeId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      if (!employeeId || !startDate || !endDate) {
        return NextResponse.json({ success: false, error: 'Employee ID, start date, and end date are required' }, { status: 400 });
      }

      const stats = await getAttendanceStatistics(employeeId, tenant.id, new Date(startDate), new Date(endDate));
      return NextResponse.json({ success: true, data: stats });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'create-timesheet') {
      await requireRole('admin', 'hr');
      const { employeeId, periodStart, periodEnd, notes } = body;

      const timesheet = await createTimesheet({
        tenantId: tenant.id,
        employeeId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        notes,
      });

      return NextResponse.json({ success: true, data: timesheet });
    }

    if (action === 'add-time-entry') {
      await requireRole('admin', 'hr');
      const { timesheetId, employeeId, date, project, task, hours, isOvertime, description } = body;

      const entry = await addTimeEntry({
        tenantId: tenant.id,
        timesheetId,
        employeeId,
        date: new Date(date),
        project,
        task,
        hours,
        isOvertime,
        description,
      });

      return NextResponse.json({ success: true, data: entry });
    }

    if (action === 'create-attendance') {
      await requireRole('admin', 'hr');
      const { employeeId, date, checkInTime, checkOutTime, status, notes, location } = body;

      const record = await createAttendanceRecord({
        tenantId: tenant.id,
        employeeId,
        date: new Date(date),
        checkInTime: checkInTime ? new Date(checkInTime) : undefined,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
        status,
        notes,
        location,
      });

      return NextResponse.json({ success: true, data: record });
    }

    if (action === 'check-in') {
      const { employeeId, location } = body;

      const record = await checkIn(employeeId, tenant.id, location);
      return NextResponse.json({ success: true, data: record });
    }

    if (action === 'check-out') {
      const { employeeId } = body;

      const record = await checkOut(employeeId, tenant.id);
      return NextResponse.json({ success: true, data: record });
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

    if (action === 'update-timesheet') {
      const { timesheetId, updates } = body;

      const timesheet = await updateTimesheet(timesheetId, tenant.id, updates);
      return NextResponse.json({ success: true, data: timesheet });
    }

    if (action === 'submit-timesheet') {
      const { timesheetId, userId } = body;

      const timesheet = await submitTimesheet(timesheetId, tenant.id, userId);
      return NextResponse.json({ success: true, data: timesheet });
    }

    if (action === 'approve-timesheet') {
      const { timesheetId, userId } = body;

      const timesheet = await approveTimesheet(timesheetId, tenant.id, userId);
      return NextResponse.json({ success: true, data: timesheet });
    }

    if (action === 'reject-timesheet') {
      const { timesheetId } = body;

      const timesheet = await rejectTimesheet(timesheetId, tenant.id);
      return NextResponse.json({ success: true, data: timesheet });
    }

    if (action === 'update-time-entry') {
      const { entryId, updates } = body;

      const entry = await updateTimeEntry(entryId, tenant.id, updates);
      return NextResponse.json({ success: true, data: entry });
    }

    if (action === 'update-attendance') {
      const { recordId, updates } = body;

      const record = await updateAttendanceRecord(recordId, tenant.id, updates);
      return NextResponse.json({ success: true, data: record });
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

    if (action === 'delete-time-entry') {
      const entryId = searchParams.get('entryId');
      if (!entryId) {
        return NextResponse.json({ success: false, error: 'Entry ID is required' }, { status: 400 });
      }

      await deleteTimeEntry(entryId, tenant.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
