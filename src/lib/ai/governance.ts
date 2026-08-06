import { db } from '@/lib/db/db';
import { aiApprovals } from '@/lib/db/schema/ai_governance';
import { eq, and } from 'drizzle-orm';

export interface CreateAiApprovalRequest {
  tenantId: string;
  actionType: string;
  payload: Record<string, unknown>;
  confidenceScore: number;
  aiReasoning?: string;
}

/**
 * Creates a new Human-in-the-loop approval request for an AI action
 */
export async function createAiApprovalRequest(input: CreateAiApprovalRequest) {
  const [request] = await db.insert(aiApprovals).values({
    tenantId: input.tenantId,
    actionType: input.actionType,
    payload: input.payload,
    confidenceScore: input.confidenceScore.toString(),
    aiReasoning: input.aiReasoning,
    status: 'pending',
  }).returning();

  return request;
}

/**
 * Approves an AI action. The actual execution of the action should be handled
 * by the caller after receiving success from this function.
 */
export async function approveAiAction(tenantId: string, requestId: string, reviewerId: string, notes?: string) {
  const [request] = await db.update(aiApprovals)
    .set({
      status: 'approved',
      humanReviewerId: reviewerId,
      reviewedAt: new Date(),
      reviewerNotes: notes,
      updatedAt: new Date(),
    })
    .where(and(eq(aiApprovals.id, requestId), eq(aiApprovals.tenantId, tenantId)))
    .returning();

  if (!request) {
    throw new Error('Approval request not found or not accessible.');
  }

  return request;
}

/**
 * Rejects an AI action, ensuring it is not executed.
 */
export async function rejectAiAction(tenantId: string, requestId: string, reviewerId: string, notes?: string) {
  const [request] = await db.update(aiApprovals)
    .set({
      status: 'rejected',
      humanReviewerId: reviewerId,
      reviewedAt: new Date(),
      reviewerNotes: notes,
      updatedAt: new Date(),
    })
    .where(and(eq(aiApprovals.id, requestId), eq(aiApprovals.tenantId, tenantId)))
    .returning();

  if (!request) {
    throw new Error('Approval request not found or not accessible.');
  }

  return request;
}

/**
 * Gets all pending AI approvals for a tenant
 */
export async function getPendingAiApprovals(tenantId: string) {
  return db.select()
    .from(aiApprovals)
    .where(and(eq(aiApprovals.tenantId, tenantId), eq(aiApprovals.status, 'pending')))
    .orderBy(aiApprovals.createdAt);
}
