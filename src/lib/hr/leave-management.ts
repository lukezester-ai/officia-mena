import { db } from '@/lib/db/db';
import {
  leaveTypes,
  leaveBalances,
  leaveRequests,
} from '@/lib/db/schema/hr_extensions';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

const toDateString = (date: Date) => date.toISOString().slice(0, 10);

export interface LeaveTypeInput {
  tenantId: string;
  name: string;
  description?: string;
  code: string;
  daysPerYear: number;
  isPaid?: boolean;
  requiresApproval?: boolean;
  requiresDocument?: boolean;
}

export async function createLeaveType(input: LeaveTypeInput) {
  const [leaveType] = await db
    .insert(leaveTypes)
    .values({
      tenantId: input.tenantId,
      name: input.name,
      description: input.description,
      code: input.code,
      daysPerYear: input.daysPerYear,
      isPaid: input.isPaid !== undefined ? input.isPaid : true,
      requiresApproval: input.requiresApproval !== undefined ? input.requiresApproval : true,
      requiresDocument: input.requiresDocument || false,
      isActive: true,
    })
    .returning();

  return leaveType;
}

export async function getLeaveTypes(tenantId: string) {
  return db
    .select()
    .from(leaveTypes)
    .where(and(eq(leaveTypes.tenantId, tenantId), eq(leaveTypes.isActive, true)))
    .orderBy(leaveTypes.name);
}

export async function updateLeaveType(
  leaveTypeId: string,
  tenantId: string,
  updates: Partial<LeaveTypeInput & { isActive: boolean }>
) {
  const [leaveType] = await db
    .update(leaveTypes)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(leaveTypes.id, leaveTypeId), eq(leaveTypes.tenantId, tenantId)))
    .returning();

  return leaveType;
}

export async function deleteLeaveType(leaveTypeId: string, tenantId: string) {
  await db
    .update(leaveTypes)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(leaveTypes.id, leaveTypeId), eq(leaveTypes.tenantId, tenantId)));
}

export async function initializeLeaveBalance(
  tenantId: string,
  employeeId: string,
  leaveTypeId: string,
  year: number
) {
  const leaveType = await db
    .select({ daysPerYear: leaveTypes.daysPerYear })
    .from(leaveTypes)
    .where(eq(leaveTypes.id, leaveTypeId))
    .limit(1);

  const [balance] = await db
    .insert(leaveBalances)
    .values({
      tenantId,
      employeeId,
      leaveTypeId,
      year,
      totalDays: leaveType[0]?.daysPerYear || 0,
      usedDays: 0,
      pendingDays: 0,
      carryOverDays: 0,
    })
    .returning();

  return balance;
}

export async function getLeaveBalances(employeeId: string, tenantId: string, year?: number) {
  const conditions = [eq(leaveBalances.employeeId, employeeId), eq(leaveBalances.tenantId, tenantId)];

  if (year) {
    conditions.push(eq(leaveBalances.year, year));
  }

  return db
    .select()
    .from(leaveBalances)
    .where(and(...conditions))
    .orderBy(desc(leaveBalances.year));
}

export async function updateLeaveBalance(
  balanceId: string,
  tenantId: string,
  updates: Partial<{
    usedDays: number;
    pendingDays: number;
    carryOverDays: number;
  }>
) {
  const [balance] = await db
    .update(leaveBalances)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(leaveBalances.id, balanceId), eq(leaveBalances.tenantId, tenantId)))
    .returning();

  return balance;
}

export interface LeaveRequestInput {
  tenantId: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string;
  attachmentUrl?: string;
}

export async function createLeaveRequest(input: LeaveRequestInput) {
  // Check if employee has enough leave balance
  const currentYear = new Date().getFullYear();
  const [balance] = await db
    .select()
    .from(leaveBalances)
    .where(and(
      eq(leaveBalances.employeeId, input.employeeId),
      eq(leaveBalances.leaveTypeId, input.leaveTypeId),
      eq(leaveBalances.year, currentYear),
      eq(leaveBalances.tenantId, input.tenantId)
    ))
    .limit(1);

  if (!balance) {
    throw new Error('Leave balance not found for this year');
  }

  const availableDays = balance.totalDays - (balance.usedDays ?? 0) - (balance.pendingDays ?? 0);
  if (availableDays < input.totalDays) {
    throw new Error(`Insufficient leave balance. Available: ${availableDays}, Requested: ${input.totalDays}`);
  }

  const [request] = await db
    .insert(leaveRequests)
    .values({
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      leaveTypeId: input.leaveTypeId,
      startDate: toDateString(input.startDate),
      endDate: toDateString(input.endDate),
      totalDays: input.totalDays,
      reason: input.reason,
      attachmentUrl: input.attachmentUrl,
      status: 'pending',
    })
    .returning();

  // Update pending days in balance
  await updateLeaveBalance(balance.id, input.tenantId, {
    pendingDays: (balance.pendingDays ?? 0) + input.totalDays,
  });

  return request;
}

export async function getLeaveRequests(tenantId: string, employeeId?: string, status?: string) {
  const conditions = [eq(leaveRequests.tenantId, tenantId)];

  if (employeeId) {
    conditions.push(eq(leaveRequests.employeeId, employeeId));
  }

  if (status) {
    conditions.push(eq(leaveRequests.status, status));
  }

  return db
    .select()
    .from(leaveRequests)
    .where(and(...conditions))
    .orderBy(desc(leaveRequests.createdAt));
}

export async function approveLeaveRequest(requestId: string, tenantId: string, approverId: string) {
  const [request] = await db
    .select()
    .from(leaveRequests)
    .where(and(eq(leaveRequests.id, requestId), eq(leaveRequests.tenantId, tenantId)))
    .limit(1);

  if (!request) {
    throw new Error('Leave request not found');
  }

  if (request.status !== 'pending') {
    throw new Error('Leave request is not pending');
  }

  // Update leave request
  const [updated] = await db
    .update(leaveRequests)
    .set({
      status: 'approved',
      approvedByUserId: approverId,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(leaveRequests.id, requestId))
    .returning();

  // Update leave balance
  const currentYear = new Date().getFullYear();
  const [balance] = await db
    .select()
    .from(leaveBalances)
    .where(and(
      eq(leaveBalances.employeeId, request.employeeId),
      eq(leaveBalances.leaveTypeId, request.leaveTypeId),
      eq(leaveBalances.year, currentYear)
    ))
    .limit(1);

  if (balance) {
    await updateLeaveBalance(balance.id, tenantId, {
      usedDays: (balance.usedDays ?? 0) + request.totalDays,
      pendingDays: (balance.pendingDays ?? 0) - request.totalDays,
    });
  }

  return updated;
}

export async function rejectLeaveRequest(requestId: string, tenantId: string, approverId: string, reason: string) {
  const [request] = await db
    .select()
    .from(leaveRequests)
    .where(and(eq(leaveRequests.id, requestId), eq(leaveRequests.tenantId, tenantId)))
    .limit(1);

  if (!request) {
    throw new Error('Leave request not found');
  }

  if (request.status !== 'pending') {
    throw new Error('Leave request is not pending');
  }

  // Update leave request
  const [updated] = await db
    .update(leaveRequests)
    .set({
      status: 'rejected',
      approvedByUserId: approverId,
      approvedAt: new Date(),
      rejectionReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(leaveRequests.id, requestId))
    .returning();

  // Update leave balance (remove pending days)
  const currentYear = new Date().getFullYear();
  const [balance] = await db
    .select()
    .from(leaveBalances)
    .where(and(
      eq(leaveBalances.employeeId, request.employeeId),
      eq(leaveBalances.leaveTypeId, request.leaveTypeId),
      eq(leaveBalances.year, currentYear)
    ))
    .limit(1);

  if (balance) {
    await updateLeaveBalance(balance.id, tenantId, {
      pendingDays: (balance.pendingDays ?? 0) - request.totalDays,
    });
  }

  return updated;
}

export async function cancelLeaveRequest(requestId: string, tenantId: string) {
  const [request] = await db
    .select()
    .from(leaveRequests)
    .where(and(eq(leaveRequests.id, requestId), eq(leaveRequests.tenantId, tenantId)))
    .limit(1);

  if (!request) {
    throw new Error('Leave request not found');
  }

  if (request.status === 'approved') {
    throw new Error('Cannot cancel approved leave request');
  }

  // Update leave request
  const [updated] = await db
    .update(leaveRequests)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(eq(leaveRequests.id, requestId))
    .returning();

  // Update leave balance (remove pending days)
  if (request.status === 'pending') {
    const currentYear = new Date().getFullYear();
    const [balance] = await db
      .select()
      .from(leaveBalances)
      .where(and(
        eq(leaveBalances.employeeId, request.employeeId),
        eq(leaveBalances.leaveTypeId, request.leaveTypeId),
        eq(leaveBalances.year, currentYear)
      ))
      .limit(1);

    if (balance) {
      await updateLeaveBalance(balance.id, tenantId, {
        pendingDays: (balance.pendingDays ?? 0) - request.totalDays,
      });
    }
  }

  return updated;
}

export async function getLeaveRequestsByDateRange(
  tenantId: string,
  startDate: Date,
  endDate: Date
) {
  return db
    .select()
    .from(leaveRequests)
    .where(and(
      eq(leaveRequests.tenantId, tenantId),
      eq(leaveRequests.status, 'approved'),
      gte(leaveRequests.startDate, toDateString(startDate)),
      lte(leaveRequests.endDate, toDateString(endDate))
    ))
    .orderBy(leaveRequests.startDate);
}

export async function getLeaveStatistics(tenantId: string, year?: number) {
  const currentYear = year || new Date().getFullYear();
  const requests = await db
    .select()
    .from(leaveRequests)
    .where(and(
      eq(leaveRequests.tenantId, tenantId),
      gte(leaveRequests.startDate, `${currentYear}-01-01`),
      lte(leaveRequests.startDate, `${currentYear}-12-31`)
    ));

  const stats = {
    totalRequests: requests.length,
    approved: requests.filter(r => r.status === 'approved').length,
    pending: requests.filter(r => r.status === 'pending').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
    byType: {} as Record<string, number>,
  };

  for (const request of requests) {
    stats.byType[request.leaveTypeId] = (stats.byType[request.leaveTypeId] || 0) + 1;
  }

  return stats;
}
