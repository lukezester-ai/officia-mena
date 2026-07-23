/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use server';

import { db } from '@/lib/db/db';
import { approvals } from '@/lib/db/schema/approvals';
import { eq, desc, and } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';

export async function getApprovals(filter: 'all' | 'pending' | 'approved' | 'rejected' = 'all') {
  try {
    const tenant = await requireTenant();
    
    // In a real app we query the DB
    let condition: any = eq(approvals.tenantId, tenant.id);
    if (filter !== 'all') {
      condition = and(condition, eq(approvals.status, filter));
    }
    
    let data = await db.select().from(approvals)
      .where(condition)
      .orderBy(desc(approvals.createdAt))
      .limit(50);
    
    // Seed dummy data if empty so the user can test the UI!
    if (data.length === 0 && filter === 'all') {
      const dummyApprovals = [
        {
          tenantId: tenant.id,
          type: 'purchase_order',
          referenceNumber: 'PO-20231101-9921',
          referenceAmount: '125000.00',
          description: 'طلب شراء أجهزة سيرفرات لمركز البيانات الجديد',
          status: 'pending',
          requestedBy: 'فريق تقنية المعلومات',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        },
        {
          tenantId: tenant.id,
          type: 'invoice',
          referenceNumber: 'INV-20231102-4412',
          referenceAmount: '45000.00',
          description: 'فاتورة استشارية لشركة ديلويت',
          status: 'pending',
          requestedBy: 'مدير العمليات',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
        },
        {
          tenantId: tenant.id,
          type: 'quotation',
          referenceNumber: 'QT-20231028-1102',
          referenceAmount: '850000.00',
          description: 'عرض سعر لمشروع وزارة الصحة',
          status: 'approved',
          requestedBy: 'فريق المبيعات',
          approvedBy: 'أحمد عبدالله',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
        }
      ];
      
      await db.insert(approvals).values(dummyApprovals);
      
      // Fetch again
      data = await db.select().from(approvals).where(eq(approvals.tenantId, tenant.id)).orderBy(desc(approvals.createdAt));
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
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
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateApprovalStatus(id: string, newStatus: 'approved' | 'rejected', notes?: string) {
  try {
    const tenant = await requireTenant();
    
    await db.update(approvals).set({
      status: newStatus,
      approvedBy: 'أحمد عبدالله (CFO)',
      notes: notes || null,
      updatedAt: new Date()
    }).where(and(eq(approvals.id, id), eq(approvals.tenantId, tenant.id)));
    
    revalidatePath('/dashboard/approvals');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
