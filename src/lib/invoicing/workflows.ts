import { db } from '@/lib/db/db';
import { invoiceWorkflows, invoiceWorkflowHistory, invoices } from '@/lib/db/schema/invoice_extensions';
import { eq, and, desc } from 'drizzle-orm';

export interface WorkflowStage {
  name: string;
  order: number;
  requiresApproval: boolean;
  autoTransition: boolean;
  allowedRoles: string[];
  actions: string[];
}

export interface WorkflowInput {
  tenantId: string;
  name: string;
  description?: string | null;
  stages: WorkflowStage[];
  autoTransition: boolean;
  requiresApproval: boolean;
  approvalThreshold: number;
  userId: string;
}

export async function createWorkflow(input: WorkflowInput) {
  const [workflow] = await db
    .insert(invoiceWorkflows)
    .values({
      tenantId: input.tenantId,
      name: input.name,
      description: input.description,
      stages: input.stages as any,
      autoTransition: input.autoTransition,
      requiresApproval: input.requiresApproval,
      approvalThreshold: input.approvalThreshold.toFixed(2),
      createdByUserId: input.userId,
      isActive: true,
    })
    .returning();

  return workflow;
}

export async function getWorkflows(tenantId: string) {
  return db
    .select()
    .from(invoiceWorkflows)
    .where(and(eq(invoiceWorkflows.tenantId, tenantId), eq(invoiceWorkflows.isActive, true)))
    .orderBy(invoiceWorkflows.name);
}

export async function getWorkflow(workflowId: string, tenantId: string) {
  const [workflow] = await db
    .select()
    .from(invoiceWorkflows)
    .where(and(eq(invoiceWorkflows.id, workflowId), eq(invoiceWorkflows.tenantId, tenantId)))
    .limit(1);

  return workflow;
}

export async function applyWorkflowToInvoice(invoiceId: string, workflowId: string, userId: string) {
  const workflow = await getWorkflow(workflowId, 'temp-tenant'); // Would need actual tenantId
  if (!workflow) {
    throw new Error('Workflow not found');
  }

  const stages = workflow.stages as WorkflowStage[];
  const firstStage = stages.sort((a, b) => a.order - b.order)[0];

  // Create workflow history entry
  const [history] = await db
    .insert(invoiceWorkflowHistory)
    .values({
      invoiceId,
      workflowId,
      stage: firstStage.name,
      action: 'created',
      actorId: userId,
      metadata: { workflowName: workflow.name } as any,
    })
    .returning();

  return history;
}

export async function advanceInvoiceStage(
  invoiceId: string,
  workflowId: string,
  userId: string,
  action: string,
  notes?: string
) {
  const workflow = await getWorkflow(workflowId, 'temp-tenant');
  if (!workflow) {
    throw new Error('Workflow not found');
  }

  const stages = workflow.stages as WorkflowStage[];
  const [currentHistory] = await db
    .select()
    .from(invoiceWorkflowHistory)
    .where(eq(invoiceWorkflowHistory.invoiceId, invoiceId))
    .orderBy(desc(invoiceWorkflowHistory.createdAt))
    .limit(1);

  const currentStage = currentHistory?.stage;
  const currentStageConfig = stages.find(s => s.name === currentStage);
  const nextStage = stages.find(s => s.order === (currentStageConfig?.order || 0) + 1);

  if (!nextStage) {
    throw new Error('No next stage available');
  }

  // Check if approval is required
  if (nextStage.requiresApproval) {
    const invoice = await db
      .select({ totalAmount: invoices.totalAmount })
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (Number(invoice[0]?.totalAmount) > Number(workflow.approvalThreshold)) {
      throw new Error('Approval required for this amount');
    }
  }

  // Create workflow history entry
  const [history] = await db
    .insert(invoiceWorkflowHistory)
    .values({
      invoiceId,
      workflowId,
      stage: nextStage.name,
      previousStage: currentStage,
      action,
      actorId: userId,
      notes,
      metadata: { workflowName: workflow.name } as any,
    })
    .returning();

  // Update invoice status based on stage
  const statusMap: Record<string, string> = {
    'draft': 'draft',
    'review': 'pending',
    'approved': 'issued',
    'sent': 'issued',
    'paid': 'paid',
    'cancelled': 'cancelled',
  };

  const newStatus = statusMap[nextStage.name] || 'draft';

  await db
    .update(invoices)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(invoices.id, invoiceId));

  return history;
}

export async function getInvoiceWorkflowHistory(invoiceId: string) {
  return db
    .select()
    .from(invoiceWorkflowHistory)
    .where(eq(invoiceWorkflowHistory.invoiceId, invoiceId))
    .orderBy(invoiceWorkflowHistory.createdAt);
}

export async function updateWorkflow(
  workflowId: string,
  tenantId: string,
  updates: Partial<{
    name: string;
    description: string | null;
    stages: WorkflowStage[];
    autoTransition: boolean;
    requiresApproval: boolean;
    approvalThreshold: number;
  }>
) {
  const [workflow] = await db
    .update(invoiceWorkflows)
    .set({
      ...updates,
      stages: updates.stages as any,
      approvalThreshold: updates.approvalThreshold?.toFixed(2),
      updatedAt: new Date(),
    })
    .where(and(eq(invoiceWorkflows.id, workflowId), eq(invoiceWorkflows.tenantId, tenantId)))
    .returning();

  return workflow;
}

export async function deleteWorkflow(workflowId: string, tenantId: string) {
  await db
    .update(invoiceWorkflows)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(invoiceWorkflows.id, workflowId), eq(invoiceWorkflows.tenantId, tenantId)));
}

export function getDefaultWorkflowStages(): WorkflowStage[] {
  return [
    {
      name: 'draft',
      order: 1,
      requiresApproval: false,
      autoTransition: false,
      allowedRoles: ['admin', 'finance', 'manager'],
      actions: ['create', 'edit', 'delete'],
    },
    {
      name: 'review',
      order: 2,
      requiresApproval: true,
      autoTransition: false,
      allowedRoles: ['admin', 'finance'],
      actions: ['approve', 'reject', 'request_changes'],
    },
    {
      name: 'approved',
      order: 3,
      requiresApproval: false,
      autoTransition: true,
      allowedRoles: ['admin', 'finance'],
      actions: ['send', 'edit'],
    },
    {
      name: 'sent',
      order: 4,
      requiresApproval: false,
      autoTransition: false,
      allowedRoles: ['admin', 'finance'],
      actions: ['mark_paid', 'send_reminder'],
    },
    {
      name: 'paid',
      order: 5,
      requiresApproval: false,
      autoTransition: false,
      allowedRoles: ['admin', 'finance'],
      actions: ['archive', 'refund'],
    },
  ];
}

export async function getWorkflowStats(tenantId: string) {
  const workflows = await getWorkflows(tenantId);

  const stats = await Promise.all(
    workflows.map(async (workflow) => {
      const [totalInvoices] = await db
        .select({ count: invoiceWorkflowHistory.id })
        .from(invoiceWorkflowHistory)
        .where(eq(invoiceWorkflowHistory.workflowId, workflow.id));

      const [pendingInvoices] = await db
        .select({ count: invoiceWorkflowHistory.id })
        .from(invoiceWorkflowHistory)
        .where(and(
          eq(invoiceWorkflowHistory.workflowId, workflow.id),
          eq(invoiceWorkflowHistory.stage, 'review')
        ));

      return {
        workflowId: workflow.id,
        name: workflow.name,
        totalInvoices: Number(totalInvoices?.count || 0),
        pendingInvoices: Number(pendingInvoices?.count || 0),
        isActive: workflow.isActive,
      };
    })
  );

  return stats;
}
