'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireTenant } from '@/lib/auth/get-tenant';
import { requireRole } from '@/lib/auth/rbac';
import { approveAndExecuteMaestroProposal, listMaestroProposals, rejectMaestroProposal } from '@/lib/ai/actions';
import { getErrorMessage } from '@/lib/errors';

const requestIdSchema = z.string().uuid();
const notesSchema = z.string().trim().max(2000);

export async function getMaestroProposals() {
  try {
    const tenant = await requireTenant();
    return { success: true, data: await listMaestroProposals(tenant.id) };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}

export async function approveMaestroProposal(requestId: string, notes?: string) {
  try {
    const reviewer = await requireRole('admin', 'finance', 'manager');
    const tenant = await requireTenant();
    const request = await approveAndExecuteMaestroProposal({
      tenantId: tenant.id, requestId: requestIdSchema.parse(requestId), reviewerId: reviewer.id,
      notes: notes ? notesSchema.parse(notes) : undefined,
    });
    revalidatePath('/dashboard/ai-maestro/approvals');
    revalidatePath('/dashboard/ai-maestro');
    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard/expenses');
    revalidatePath('/dashboard/inventory/purchase-orders');
    revalidatePath('/dashboard/ai-maestro/integrations');
    return { success: true, data: request };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}

export async function rejectMaestroAction(requestId: string, notes: string) {
  try {
    const reviewer = await requireRole('admin', 'finance', 'manager');
    const tenant = await requireTenant();
    const request = await rejectMaestroProposal({
      tenantId: tenant.id, requestId: requestIdSchema.parse(requestId), reviewerId: reviewer.id,
      notes: notesSchema.min(3).parse(notes),
    });
    revalidatePath('/dashboard/ai-maestro/approvals');
    return { success: true, data: request };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}
