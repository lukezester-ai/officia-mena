 
 

'use server';

import { db } from '@/lib/db/db';
import { approvals } from '@/lib/db/schema/approvals';
import { eq, desc, and, type SQL } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/rbac';

export async function getApprovals(filter: 'all' | 'pending' | 'approved' | 'rejected' = 'all') {
  try {
    const tenant = await requireTenant();
    let condition: SQL | undefined = eq(approvals.tenantId, tenant.id);
    if (filter !== 'all') {
      condition = and(condition, eq(approvals.status, filter));
    }
    const data = await db.select().from(approvals)
      .where(condition)
      .orderBy(desc(approvals.createdAt))
      .limit(50);
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

export async function getApprovalsSummary() {
  try {
    const tenant = await requireTenant();
    const data = await db.select().from(approvals).where(eq(approvals.tenantId, tenant.id));
    
    const summary = {
      pending: data.filter(a => a.status === 'pending').length,
      approved: data.filter(a => a.status === 'approved').length,
      rejected: data.filter(a => a.status === 'rejected').length,
      pendingAmount: data.filter(a => a.status === 'pending').reduce((sum, a) => sum + parseFloat(a.referenceAmount), 0)
    };
    
    return { success: true, summary };
  } catch (error: unknown) {
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

export async function updateApprovalStatus(id: string, newStatus: 'approved' | 'rejected', notes?: string) {
  try {
    const reviewer = await requireRole('admin', 'finance', 'manager');
    const tenant = await requireTenant();
    
    await db.update(approvals).set({
      status: newStatus,
      approvedBy: [reviewer.firstName, reviewer.lastName].filter(Boolean).join(' ') || reviewer.email,
      notes: notes || null,
      updatedAt: new Date()
    }).where(and(eq(approvals.id, id), eq(approvals.tenantId, tenant.id)));
    
    revalidatePath('/dashboard/approvals');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}

