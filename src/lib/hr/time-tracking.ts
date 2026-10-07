/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '@/lib/db/db';
import {
  timesheets,
  timeEntries,
  attendanceRecords,
} from '@/lib/db/schema/hr_extensions';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

export interface TimesheetInput {
  tenantId: string;
  employeeId: string;
  periodStart: Date;
  periodEnd: Date;
  notes?: string;
}

export async function createTimesheet(input: TimesheetInput) {
  const [timesheet] = await db
    .insert(timesheets)
    .values({
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      totalHours: '0.00',
      regularHours: '0.00',
      overtimeHours: '0.00',
      status: 'draft',
      notes: input.notes,
    })
    .returning();

  return timesheet;
}

export async function getTimesheets(employeeId: string, tenantId: string, status?: string) {
  const query = db
    .select()
    .from(timesheets)
    .where(and(eq(timesheets.employeeId, employeeId), eq(timesheets.tenantId, tenantId)));

  if (status) {
    query.where(and(
      eq(timesheets.employeeId, employeeId),
      eq(timesheets.tenantId, tenantId),
      eq(timesheets.status, status)
    ));
  }

  return query.orderBy(desc(timesheets.periodStart));
}

export async function updateTimesheet(
  timesheetId: string,
  tenantId: string,
  updates: Partial<TimesheetInput & { status: string }>
) {
  const [timesheet] = await db
    .update(timesheets)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(timesheets.id, timesheetId), eq(timesheets.tenantId, tenantId)))
    .returning();

  return timesheet;
}

export async function submitTimesheet(timesheetId: string, tenantId: string, userId: string) {
  const [timesheet] = await db
    .update(timesheets)
    .set({
      status: 'submitted',
      submittedByUserId: userId,
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(timesheets.id, timesheetId), eq(timesheets.tenantId, tenantId)))
    .returning();

  return timesheet;
}

export async function approveTimesheet(timesheetId: string, tenantId: string, userId: string) {
  const [timesheet] = await db
    .update(timesheets)
    .set({
      status: 'approved',
      approvedByUserId: userId,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(timesheets.id, timesheetId), eq(timesheets.tenantId, tenantId)))
    .returning();

  return timesheet;
}

export async function rejectTimesheet(timesheetId: string, tenantId: string) {
  const [timesheet] = await db
    .update(timesheets)
    .set({
      status: 'rejected',
      updatedAt: new Date(),
    })
    .where(and(eq(timesheets.id, timesheetId), eq(timesheets.tenantId, tenantId)))
    .returning();

  return timesheet;
}

export interface TimeEntryInput {
  tenantId: string;
  timesheetId: string;
  employeeId: string;
  date: Date;
  project?: string;
  task?: string;
  hours: number;
  isOvertime?: boolean;
  description?: string;
}

export async function addTimeEntry(input: TimeEntryInput) {
  const [entry] = await db
    .insert(timeEntries)
    .values({
      tenantId: input.tenantId,
      timesheetId: input.timesheetId,
      employeeId: input.employeeId,
      date: input.date,
      project: input.project,
      task: input.task,
      hours: input.hours.toFixed(2),
      isOvertime: input.isOvertime || false,
      description: input.description,
    })
    .returning();

  // Update timesheet totals
  await updateTimesheetTotals(input.timesheetId, input.tenantId);

  return entry;
}

export async function getTimeEntries(timesheetId: string, tenantId: string) {
  return db
    .select()
    .from(timeEntries)
    .where(and(eq(timeEntries.timesheetId, timesheetId), eq(timeEntries.tenantId, tenantId)))
    .orderBy(timeEntries.date);
}

export async function updateTimeEntry(
  entryId: string,
  tenantId: string,
  updates: Partial<TimeEntryInput>
) {
  const [entry] = await db
    .update(timeEntries)
    .set({
      ...updates,
      hours: updates.hours?.toFixed(2),
      updatedAt: new Date(),
    })
    .where(and(eq(timeEntries.id, entryId), eq(timeEntries.tenantId, tenantId)))
    .returning();

  // Update timesheet totals
  await updateTimesheetTotals(entry.timesheetId, tenantId);

  return entry;
}

export async function deleteTimeEntry(entryId: string, tenantId: string) {
  const [entry] = await db
    .select()
    .from(timeEntries)
    .where(eq(timeEntries.id, entryId))
    .limit(1);

  await db
    .delete(timeEntries)
    .where(and(eq(timeEntries.id, entryId), eq(timeEntries.tenantId, tenantId)));

  if (entry) {
    await updateTimesheetTotals(entry.timesheetId, tenantId);
  }
}

async function updateTimesheetTotals(timesheetId: string, tenantId: string) {
  const entries = await getTimeEntries(timesheetId, tenantId);

  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0);
  const overtimeHours = entries.filter(e => e.isOvertime).reduce((sum, e) => sum + Number(e.hours), 0);
  const regularHours = totalHours - overtimeHours;

  await db
    .update(timesheets)
    .set({
      totalHours: totalHours.toFixed(2),
      regularHours: regularHours.toFixed(2),
      overtimeHours: overtimeHours.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(timesheets.id, timesheetId));
}

export interface AttendanceRecordInput {
  tenantId: string;
  employeeId: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status?: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  notes?: string;
  location?: string;
}

export async function createAttendanceRecord(input: AttendanceRecordInput) {
  const [record] = await db
    .insert(attendanceRecords)
    .values({
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      date: input.date,
      checkInTime: input.checkInTime,
      checkOutTime: input.checkOutTime,
      status: input.status || 'present',
      notes: input.notes,
      location: input.location,
    })
    .returning();

  // Calculate work hours if both check-in and check-out are provided
  if (input.checkInTime && input.checkOutTime) {
    const workHours = (new Date(input.checkOutTime).getTime() - new Date(input.checkInTime).getTime()) / (1000 * 60 * 60);
    await db
      .update(attendanceRecords)
      .set({ workHours: workHours.toFixed(2) })
      .where(eq(attendanceRecords.id, record.id));
  }

  return record;
}

export async function getAttendanceRecords(employeeId: string, tenantId: string, startDate?: Date, endDate?: Date) {
  const query = db
    .select()
    .from(attendanceRecords)
    .where(and(eq(attendanceRecords.employeeId, employeeId), eq(attendanceRecords.tenantId, tenantId)));

  if (startDate && endDate) {
    query.where(and(
      eq(attendanceRecords.employeeId, employeeId),
      eq(attendanceRecords.tenantId, tenantId),
      gte(attendanceRecords.date, startDate),
      lte(attendanceRecords.date, endDate)
    ));
  }

  return query.orderBy(desc(attendanceRecords.date));
}

export async function updateAttendanceRecord(
  recordId: string,
  tenantId: string,
  updates: Partial<AttendanceRecordInput>
) {
  const [record] = await db
    .update(attendanceRecords)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(attendanceRecords.id, recordId), eq(attendanceRecords.tenantId, tenantId)))
    .returning();

  return record;
}

export async function checkIn(employeeId: string, tenantId: string, location?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [existing] = await db
    .select()
    .from(attendanceRecords)
    .where(and(
      eq(attendanceRecords.employeeId, employeeId),
      eq(attendanceRecords.tenantId, tenantId),
      gte(attendanceRecords.date, today)
    ))
    .limit(1);

  if (existing) {
    throw new Error('Already checked in today');
  }

  const record = await createAttendanceRecord({
    tenantId,
    employeeId,
    date: today,
    checkInTime: new Date(),
    status: 'present',
    location,
  });

  return record;
}

export async function checkOut(employeeId: string, tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [record] = await db
    .select()
    .from(attendanceRecords)
    .where(and(
      eq(attendanceRecords.employeeId, employeeId),
      eq(attendanceRecords.tenantId, tenantId),
      gte(attendanceRecords.date, today)
    ))
    .limit(1);

  if (!record) {
    throw new Error('No check-in record found for today');
  }

  if (record.checkOutTime) {
    throw new Error('Already checked out today');
  }

  const checkOutTime = new Date();
  const workHours = (checkOutTime.getTime() - new Date(record.checkInTime || today).getTime()) / (1000 * 60 * 60);

  const updated = await updateAttendanceRecord(record.id, tenantId, {
    checkOutTime,
    workHours: workHours.toFixed(2) as any,
  });

  return updated;
}

export async function getAttendanceStatistics(employeeId: string, tenantId: string, startDate: Date, endDate: Date) {
  const records = await getAttendanceRecords(employeeId, tenantId, startDate, endDate);

  const stats = {
    totalDays: records.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    halfDay: records.filter(r => r.status === 'half_day').length,
    leave: records.filter(r => r.status === 'leave').length,
    totalWorkHours: records.reduce((sum, r) => sum + Number(r.workHours || 0), 0),
    averageWorkHours: records.length > 0
      ? records.reduce((sum, r) => sum + Number(r.workHours || 0), 0) / records.length
      : 0,
  };

  return stats;
}
