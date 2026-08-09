import { createHash } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/db';
import { aiApprovals } from '@/lib/db/schema/ai_governance';
import { auditLogs } from '@/lib/db/schema/audit_logs';
import { expenses } from '@/lib/db/schema/expenses';
import { invoices } from '@/lib/db/schema/invoices';
import { purchaseOrders } from '@/lib/db/schema/purchase_orders';
import { integrationJobs } from '@/lib/db/schema/ai_orchestration';

export const actionTypeSchema = z.enum(['draft_invoice', 'draft_expense', 'draft_purchase_order', 'send_email', 'submit_zatca']);
export type MaestroActionType = z.infer<typeof actionTypeSchema>;

const draftInvoiceSchema = z.object({
  clientName: z.string().trim().min(1).max(255),
  clientTrn: z.string().trim().max(50).optional(),
  subtotal: z.number().finite().positive().max(999_999_999.99),
  vatRate: z.number().finite().min(0).max(100).default(15),
  notes: z.string().trim().max(5000).optional(),
});
const draftExpenseSchema = z.object({
  description: z.string().trim().min(1).max(1000),
  amount: z.number().finite().positive().max(999_999_999.99),
  category: z.string().trim().min(1).max(50),
  expenseDate: z.string().date(),
});
const draftPurchaseOrderSchema = z.object({
  supplierName: z.string().trim().min(1).max(255),
  subtotal: z.number().finite().positive().max(999_999_999.99),
  vatRate: z.number().finite().min(0).max(100).default(15),
  notes: z.string().trim().max(5000).optional(),
});
const sendEmailSchema = z.object({ to: z.string().email(), subject: z.string().trim().min(1).max(200), text: z.string().trim().min(1).max(20_000) });
const submitZatcaSchema = z.object({ invoiceId: z.string().uuid(), mode: z.enum(['clearance', 'reporting']) });

export const actionPayloadSchemas = {
  draft_invoice: draftInvoiceSchema,
  draft_expense: draftExpenseSchema,
  draft_purchase_order: draftPurchaseOrderSchema,
  send_email: sendEmailSchema,
  submit_zatca: submitZatcaSchema,
} as const;

export function validateActionPayload(actionType: MaestroActionType, payload: unknown) {
  return actionPayloadSchemas[actionType].parse(payload);
}

export async function createMaestroProposal(input: {
  tenantId: string;
  actionType: MaestroActionType;
  payload: unknown;
  confidenceScore: number;
  reasoning: string;
  requestedByUserId: string;
}) {
  const payload = validateActionPayload(input.actionType, input.payload);
  const timeBucket = Math.floor(Date.now() / 300_000);
  const idempotencyKey = createHash('sha256')
    .update(JSON.stringify({ tenantId: input.tenantId, actionType: input.actionType, payload, timeBucket }))
    .digest('hex');

  const [proposal] = await db.insert(aiApprovals).values({
    tenantId: input.tenantId,
    actionType: input.actionType,
    payload,
    confidenceScore: Math.max(0, Math.min(100, input.confidenceScore)).toFixed(2),
    aiReasoning: input.reasoning.slice(0, 5000),
    requestedByUserId: input.requestedByUserId,
    idempotencyKey,
  }).onConflictDoNothing({ target: [aiApprovals.tenantId, aiApprovals.idempotencyKey] }).returning();

  if (proposal) {
    await db.insert(auditLogs).values({
      tenantId: input.tenantId, userId: input.requestedByUserId, entityType: 'ai_proposal',
      entityId: proposal.id, action: 'AI_PROPOSE', newValues: { actionType: input.actionType, payload },
    });
    return proposal;
  }
  const [existing] = await db.select().from(aiApprovals)
    .where(and(eq(aiApprovals.tenantId, input.tenantId), eq(aiApprovals.idempotencyKey, idempotencyKey))).limit(1);
  return existing;
}

export async function listMaestroProposals(tenantId: string) {
  return db.select().from(aiApprovals)
    .where(eq(aiApprovals.tenantId, tenantId))
    .orderBy(desc(aiApprovals.createdAt))
    .limit(100);
}

export async function rejectMaestroProposal(input: { tenantId: string; requestId: string; reviewerId: string; notes: string }) {
  return db.transaction(async (tx) => {
    const [request] = await tx.update(aiApprovals).set({
      status: 'rejected', humanReviewerId: input.reviewerId, reviewerNotes: input.notes,
      reviewedAt: new Date(), updatedAt: new Date(),
    }).where(and(eq(aiApprovals.id, input.requestId), eq(aiApprovals.tenantId, input.tenantId), eq(aiApprovals.status, 'pending'))).returning();
    if (!request) throw new Error('Pending proposal not found.');
    await tx.insert(auditLogs).values({
      tenantId: input.tenantId, userId: input.reviewerId, entityType: 'ai_proposal', entityId: request.id,
      action: 'AI_REJECT', oldValues: { status: 'pending' }, newValues: { status: 'rejected', notes: input.notes },
    });
    return request;
  });
}

export async function approveAndExecuteMaestroProposal(input: { tenantId: string; requestId: string; reviewerId: string; notes?: string }) {
  return db.transaction(async (tx) => {
    const [request] = await tx.update(aiApprovals).set({
      status: 'approved', executionStatus: 'executing', humanReviewerId: input.reviewerId,
      reviewerNotes: input.notes, reviewedAt: new Date(), updatedAt: new Date(),
    }).where(and(
      eq(aiApprovals.id, input.requestId), eq(aiApprovals.tenantId, input.tenantId),
      eq(aiApprovals.status, 'pending'), eq(aiApprovals.executionStatus, 'not_started'),
    )).returning();
    if (!request) throw new Error('Proposal was already reviewed or executed.');

    const actionType = actionTypeSchema.parse(request.actionType);
    const payload = validateActionPayload(actionType, request.payload);
    let result: { id: string; entityType: string; values: Record<string, unknown> };

    if (actionType === 'draft_invoice') {
      const data = draftInvoiceSchema.parse(payload);
      const vatAmount = data.subtotal * data.vatRate / 100;
      const [row] = await tx.insert(invoices).values({
        tenantId: input.tenantId,
        invoiceNumber: `DRAFT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        clientName: data.clientName, clientTrn: data.clientTrn || null,
        subtotal: data.subtotal.toFixed(2), vatRate: data.vatRate.toFixed(2),
        vatAmount: vatAmount.toFixed(2), totalAmount: (data.subtotal + vatAmount).toFixed(2),
        issueDate: new Date(), status: 'draft', notes: data.notes,
        isZatcaReported: false, zatcaStatus: 'pending',
      }).returning();
      result = { id: row.id, entityType: 'invoice', values: row };
    } else if (actionType === 'draft_expense') {
      const data = draftExpenseSchema.parse(payload);
      const [row] = await tx.insert(expenses).values({
        tenantId: input.tenantId, description: data.description, amount: data.amount.toFixed(2),
        category: data.category, expenseDate: new Date(`${data.expenseDate}T00:00:00.000Z`), status: 'pending',
      }).returning();
      result = { id: row.id, entityType: 'expense', values: row };
    } else if (actionType === 'draft_purchase_order') {
      const data = draftPurchaseOrderSchema.parse(payload);
      const vatAmount = data.subtotal * data.vatRate / 100;
      const [row] = await tx.insert(purchaseOrders).values({
        tenantId: input.tenantId, poNumber: `PO-DRAFT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        supplierName: data.supplierName, subtotal: data.subtotal.toFixed(2), vatRate: data.vatRate.toFixed(2),
        vatAmount: vatAmount.toFixed(2), totalAmount: (data.subtotal + vatAmount).toFixed(2), status: 'draft', notes: data.notes,
      }).returning();
      result = { id: row.id, entityType: 'purchase_order', values: row };
    } else {
      const jobType = actionType;
      const [row] = await tx.insert(integrationJobs).values({ tenantId: input.tenantId, jobType, payload,
        idempotencyKey: createHash('sha256').update(`${input.tenantId}:${request.id}:${jobType}`).digest('hex'),
        approvedByUserId: input.reviewerId }).onConflictDoNothing({ target: [integrationJobs.tenantId, integrationJobs.idempotencyKey] }).returning();
      if (!row) throw new Error('Integration job already exists.');
      result = { id: row.id, entityType: 'integration_job', values: row };
    }

    await tx.insert(auditLogs).values({
      tenantId: input.tenantId, userId: input.reviewerId, entityType: 'ai_proposal',
      entityId: request.id, action: 'AI_APPROVE', oldValues: { status: 'pending' },
      newValues: { status: 'approved', actionType, notes: input.notes },
    });
    await tx.insert(auditLogs).values({
      tenantId: input.tenantId, userId: input.reviewerId, entityType: result.entityType,
      entityId: result.id, action: 'AI_DRAFT_CREATE', newValues: {
        proposalId: request.id, actionType, payload, result: result.values,
      },
    });
    const [completed] = await tx.update(aiApprovals).set({
      executionStatus: 'completed', executedAt: new Date(), resultEntityType: result.entityType,
      resultEntityId: result.id, updatedAt: new Date(),
    }).where(eq(aiApprovals.id, request.id)).returning();
    return completed;
  });
}
