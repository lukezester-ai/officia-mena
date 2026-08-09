import { embed } from 'ai';
import type { ToolSet } from 'ai';
import { google } from '@ai-sdk/google';
import { and, desc, eq, isNull, lte, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getAccountingOverview } from '@/lib/accounting';
import { db } from '@/lib/db/db';
import { aiInboxItems } from '@/lib/db/schema/ai_inbox';
import { documentChunks } from '@/lib/db/schema/documents';
import { expenses } from '@/lib/db/schema/expenses';
import { employeeDocuments, employees, payrollRuns } from '@/lib/db/schema/hr';
import { inventoryLevels, products } from '@/lib/db/schema/inventory';
import { invoices } from '@/lib/db/schema/invoices';
import { getErrorMessage } from '@/lib/errors';
import { createMaestroProposal } from '@/lib/ai/actions';
import { deleteMaestroMemory, saveMaestroMemory } from '@/lib/ai/memory';

type MaestroTenant = {
  id: string;
  name: string;
  country: string | null;
  trn: string | null;
  crn: string;
};

type Source = {
  type: 'database' | 'document' | 'regulation';
  entity: string;
  id?: string;
  label: string;
  href?: string;
};

const makeTool = <T extends z.ZodTypeAny>(config: {
  description: string;
  parameters: T;
  execute: (args: z.infer<T>) => Promise<Record<string, unknown>>;
}) => config as unknown as ToolSet[string];

const generatedAt = () => new Date().toISOString();
const databaseSource = (entity: string, label: string, href?: string): Source => ({
  type: 'database', entity, label, href,
});

function toolFailure(scope: string, error: unknown) {
  return {
    ok: false,
    scope,
    error: getErrorMessage(error),
    generatedAt: generatedAt(),
    sources: [] as Source[],
  };
}

function createFinancialTools(tenant: MaestroTenant) {
  return {
    getFinancialOverview: makeTool({
      description: 'Get the current deterministic financial overview: P&L, balance sheet, cash flow, VAT, receivables, payables and accounting control checks.',
      parameters: z.object({}),
      execute: async () => {
        try {
          const overview = await getAccountingOverview(tenant.id);
          return {
            ok: true,
            company: tenant.name,
            data: {
              profitAndLoss: overview.financialStatements.profitAndLoss,
              balanceSheet: overview.financialStatements.balanceSheet,
              cashFlow: overview.cashFlow,
              vat: overview.vatControl,
              receivables: overview.aging.receivables,
              payables: overview.aging.payables,
              controlChecks: overview.controlChecks,
            },
            generatedAt: generatedAt(),
            sources: [
              databaseSource('journal_entries', 'General ledger', '/dashboard/accounting'),
              databaseSource('invoices', 'Sales invoices', '/dashboard/invoices'),
              databaseSource('expenses', 'Expenses', '/dashboard/expenses'),
              databaseSource('bank_transactions', 'Bank transactions', '/dashboard/bank'),
            ],
          };
        } catch (error) {
          return toolFailure('financial_overview', error);
        }
      },
    }),
    getReceivablesAging: makeTool({
      description: 'Get outstanding customer receivables grouped by current, 31-60, 61-90 and over 90 days.',
      parameters: z.object({ limit: z.number().int().min(1).max(50).default(10) }),
      execute: async ({ limit }: { limit: number }) => {
        try {
          const overview = await getAccountingOverview(tenant.id);
          return {
            ok: true,
            data: { ...overview.aging.receivables, items: overview.aging.receivables.items.slice(0, limit) },
            generatedAt: generatedAt(),
            sources: [databaseSource('invoices', 'Outstanding invoices', '/dashboard/invoices')],
          };
        } catch (error) {
          return toolFailure('receivables_aging', error);
        }
      },
    }),
    getRecentTransactions: makeTool({
      description: 'Get recent invoices and expenses from the company database. Use this for questions about latest activity.',
      parameters: z.object({ limit: z.number().int().min(1).max(20).default(8) }),
      execute: async ({ limit }: { limit: number }) => {
        try {
          const [recentInvoices, recentExpenses] = await Promise.all([
            db.select({ id: invoices.id, number: invoices.invoiceNumber, client: invoices.clientName, amount: invoices.totalAmount, currency: invoices.currency, status: invoices.status, date: invoices.issueDate })
              .from(invoices).where(eq(invoices.tenantId, tenant.id)).orderBy(desc(invoices.issueDate)).limit(limit),
            db.select({ id: expenses.id, description: expenses.description, amount: expenses.amount, currency: expenses.currency, status: expenses.status, date: expenses.expenseDate })
              .from(expenses).where(eq(expenses.tenantId, tenant.id)).orderBy(desc(expenses.createdAt)).limit(limit),
          ]);
          return {
            ok: true,
            data: { invoices: recentInvoices, expenses: recentExpenses },
            generatedAt: generatedAt(),
            sources: [
              ...recentInvoices.map((invoice) => ({ type: 'database' as const, entity: 'invoice', id: invoice.id, label: invoice.number, href: `/dashboard/invoices/${invoice.id}` })),
              databaseSource('expenses', 'Recent expenses', '/dashboard/expenses'),
            ],
          };
        } catch (error) {
          return toolFailure('recent_transactions', error);
        }
      },
    }),
  };
}

function createHrTools(tenant: MaestroTenant) {
  return {
    getExpiringEmployeeDocuments: makeTool({
      description: 'Get real employee documents that are expired or expire within a requested number of days.',
      parameters: z.object({ days: z.number().int().min(1).max(365).default(60) }),
      execute: async ({ days }: { days: number }) => {
        try {
          const deadline = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
          const rows = await db.select({
            id: employeeDocuments.id,
            employeeId: employees.employeeId,
            firstName: employees.firstName,
            lastName: employees.lastName,
            documentType: employeeDocuments.documentType,
            expiryDate: employeeDocuments.expiryDate,
          }).from(employeeDocuments)
            .innerJoin(employees, eq(employeeDocuments.employeeId, employees.id))
            .where(and(eq(employeeDocuments.tenantId, tenant.id), lte(employeeDocuments.expiryDate, deadline)))
            .orderBy(employeeDocuments.expiryDate)
            .limit(50);
          const today = new Date().toISOString().slice(0, 10);
          return {
            ok: true,
            data: rows.map((row) => ({ ...row, status: row.expiryDate < today ? 'expired' : 'expiring' })),
            generatedAt: generatedAt(),
            sources: [databaseSource('employee_documents', 'Employee documents', '/dashboard/hr')],
          };
        } catch (error) {
          return toolFailure('employee_documents', error);
        }
      },
    }),
    getPayrollSummary: makeTool({
      description: 'Get the latest real payroll runs and WPS submission status.',
      parameters: z.object({ limit: z.number().int().min(1).max(12).default(3) }),
      execute: async ({ limit }: { limit: number }) => {
        try {
          const rows = await db.select().from(payrollRuns)
            .where(eq(payrollRuns.tenantId, tenant.id))
            .orderBy(desc(payrollRuns.periodYear), desc(payrollRuns.periodMonth))
            .limit(limit);
          return {
            ok: true,
            data: rows,
            generatedAt: generatedAt(),
            sources: [databaseSource('payroll_runs', 'Payroll and WPS', '/dashboard/hr/payroll')],
          };
        } catch (error) {
          return toolFailure('payroll', error);
        }
      },
    }),
  };
}

function createInventoryTools(tenant: MaestroTenant) {
  return {
    getInventoryRisks: makeTool({
      description: 'Get real low-stock, missing-cost, expired certification and controlled-goods risks.',
      parameters: z.object({ limit: z.number().int().min(1).max(50).default(20) }),
      execute: async ({ limit }: { limit: number }) => {
        try {
          const [productRows, levelRows] = await Promise.all([
            db.select().from(products).where(eq(products.tenantId, tenant.id)),
            db.select().from(inventoryLevels).where(eq(inventoryLevels.tenantId, tenant.id)),
          ]);
          const quantityByProduct = new Map<string, number>();
          for (const level of levelRows) quantityByProduct.set(level.productId, (quantityByProduct.get(level.productId) || 0) + level.quantity);
          const now = Date.now();
          const risks = productRows.flatMap((product) => {
            const quantity = quantityByProduct.get(product.id) || 0;
            const productRisks: Array<Record<string, unknown>> = [];
            if (product.type === 'product' && quantity <= (product.minStockLevel || 0)) productRisks.push({ kind: 'low_stock', severity: quantity <= 0 ? 'critical' : 'high', quantity });
            if (product.type === 'product' && quantity > 0 && Number(product.costPrice || 0) <= 0) productRisks.push({ kind: 'missing_cost', severity: 'high', quantity });
            if (product.halalExpiryDate && product.halalExpiryDate.getTime() < now) productRisks.push({ kind: 'halal_certificate_expired', severity: 'critical', expiryDate: product.halalExpiryDate });
            if (product.isFertilizer && product.securityClearanceExpiry && product.securityClearanceExpiry.getTime() < now) productRisks.push({ kind: 'security_clearance_expired', severity: 'critical', expiryDate: product.securityClearanceExpiry });
            return productRisks.map((risk) => ({ productId: product.id, sku: product.sku, productName: product.name, ...risk }));
          }).slice(0, limit);
          return {
            ok: true,
            data: risks,
            generatedAt: generatedAt(),
            sources: [databaseSource('products', 'Products and inventory levels', '/dashboard/inventory')],
          };
        } catch (error) {
          return toolFailure('inventory_risks', error);
        }
      },
    }),
  };
}

function createInboxTools(tenant: MaestroTenant) {
  return {
    getAssistantInbox: makeTool({
      description: 'Get current open AI alerts, anomalies and warnings ordered by priority and date.',
      parameters: z.object({ limit: z.number().int().min(1).max(50).default(10) }),
      execute: async ({ limit }: { limit: number }) => {
        try {
          const items = await db.select().from(aiInboxItems)
            .where(and(eq(aiInboxItems.tenantId, tenant.id), eq(aiInboxItems.status, 'open')))
            .orderBy(sql`CASE ${aiInboxItems.priority} WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`, desc(aiInboxItems.createdAt))
            .limit(limit);
          return {
            ok: true,
            data: items,
            generatedAt: generatedAt(),
            sources: [databaseSource('ai_inbox_items', 'Maestro inbox', '/dashboard')],
          };
        } catch (error) {
          return toolFailure('assistant_inbox', error);
        }
      },
    }),
  };
}

function createDocumentTools(tenant: MaestroTenant) {
  return {
    searchDocuments: makeTool({
      description: 'Search only the current company’s uploaded documents and return excerpts with file citations.',
      parameters: z.object({ query: z.string().trim().min(2).max(500) }),
      execute: async ({ query }: { query: string }) => {
        try {
          const { embedding } = await embed({ model: google.embedding('text-embedding-004'), value: query });
          const similarity = sql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(embedding)})`;
          const results = await db.select({ id: documentChunks.id, fileName: documentChunks.fileName, content: documentChunks.content, similarity })
            .from(documentChunks)
            .where(and(eq(documentChunks.docType, 'user_document'), eq(documentChunks.tenantId, tenant.id)))
            .orderBy(desc(similarity)).limit(5);
          return {
            ok: true,
            data: results.map((row) => ({ id: row.id, fileName: row.fileName, excerpt: row.content.slice(0, 1200), confidence: Number(row.similarity) })),
            generatedAt: generatedAt(),
            sources: results.map((row) => ({ type: 'document' as const, entity: 'document_chunk', id: row.id, label: row.fileName, href: '/dashboard/documents' })),
          };
        } catch (error) {
          return toolFailure('document_search', error);
        }
      },
    }),
    searchZatcaRegulations: makeTool({
      description: 'Search the curated ZATCA regulations knowledge base and return cited passages. Do not claim legal certainty beyond these sources.',
      parameters: z.object({ query: z.string().trim().min(2).max(500) }),
      execute: async ({ query }: { query: string }) => {
        try {
          const { embedding } = await embed({ model: google.embedding('text-embedding-004'), value: query });
          const similarity = sql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(embedding)})`;
          const results = await db.select({ id: documentChunks.id, fileName: documentChunks.fileName, content: documentChunks.content, similarity })
            .from(documentChunks)
            .where(and(eq(documentChunks.docType, 'zatca_regulation'), or(isNull(documentChunks.tenantId), eq(documentChunks.tenantId, tenant.id))!))
            .orderBy(desc(similarity)).limit(4);
          return {
            ok: true,
            data: results.map((row) => ({ passage: row.content, confidence: Number(row.similarity) })),
            generatedAt: generatedAt(),
            sources: results.map((row) => ({ type: 'regulation' as const, entity: 'zatca_regulation', id: row.id, label: row.fileName })),
          };
        } catch (error) {
          return toolFailure('zatca_search', error);
        }
      },
    }),
  };
}

function createProposalTools(tenant: MaestroTenant, requestedByUserId: string) {
  const reasoning = z.string().trim().min(5).max(2000);
  const confidenceScore = z.number().min(0).max(100);
  return {
    proposeDraftInvoice: makeTool({
      description: 'Create a human-review proposal for a DRAFT invoice. This does not create or issue an invoice. Always summarize the exact amounts before calling.',
      parameters: z.object({
        clientName: z.string().trim().min(1).max(255), clientTrn: z.string().trim().max(50).optional(),
        subtotal: z.number().positive(), vatRate: z.number().min(0).max(100).default(15), notes: z.string().max(5000).optional(),
        reasoning, confidenceScore,
      }),
      execute: async ({ reasoning: why, confidenceScore: confidence, ...payload }) => {
        try {
          const proposal = await createMaestroProposal({ tenantId: tenant.id, actionType: 'draft_invoice', payload, reasoning: why, confidenceScore: confidence, requestedByUserId });
          return { ok: true, requiresHumanApproval: true, proposalId: proposal.id, status: proposal.status, reviewUrl: '/dashboard/ai-maestro/approvals', generatedAt: generatedAt() };
        } catch (error) { return toolFailure('propose_draft_invoice', error); }
      },
    }),
    proposeDraftExpense: makeTool({
      description: 'Create a human-review proposal for a pending expense record. This does not write the expense until an authorized reviewer approves it.',
      parameters: z.object({
        description: z.string().trim().min(1).max(1000), amount: z.number().positive(), category: z.string().trim().min(1).max(50),
        expenseDate: z.string().date(), reasoning, confidenceScore,
      }),
      execute: async ({ reasoning: why, confidenceScore: confidence, ...payload }) => {
        try {
          const proposal = await createMaestroProposal({ tenantId: tenant.id, actionType: 'draft_expense', payload, reasoning: why, confidenceScore: confidence, requestedByUserId });
          return { ok: true, requiresHumanApproval: true, proposalId: proposal.id, status: proposal.status, reviewUrl: '/dashboard/ai-maestro/approvals', generatedAt: generatedAt() };
        } catch (error) { return toolFailure('propose_draft_expense', error); }
      },
    }),
    proposeDraftPurchaseOrder: makeTool({
      description: 'Create a human-review proposal for a DRAFT purchase order. No order is sent and inventory is not changed.',
      parameters: z.object({
        supplierName: z.string().trim().min(1).max(255), subtotal: z.number().positive(), vatRate: z.number().min(0).max(100).default(15),
        notes: z.string().max(5000).optional(), reasoning, confidenceScore,
      }),
      execute: async ({ reasoning: why, confidenceScore: confidence, ...payload }) => {
        try {
          const proposal = await createMaestroProposal({ tenantId: tenant.id, actionType: 'draft_purchase_order', payload, reasoning: why, confidenceScore: confidence, requestedByUserId });
          return { ok: true, requiresHumanApproval: true, proposalId: proposal.id, status: proposal.status, reviewUrl: '/dashboard/ai-maestro/approvals', generatedAt: generatedAt() };
        } catch (error) { return toolFailure('propose_draft_purchase_order', error); }
      },
    }),
    proposeEmailSend: makeTool({
      description: 'Create a human-review proposal to send an external email. Never call unless the user explicitly asks to send and has confirmed recipient, subject and exact body.',
      parameters: z.object({ to: z.string().email(), subject: z.string().trim().min(1).max(200), text: z.string().trim().min(1).max(20_000), reasoning, confidenceScore }),
      execute: async ({ reasoning: why, confidenceScore: confidence, ...payload }) => {
        try { const proposal = await createMaestroProposal({ tenantId: tenant.id, actionType: 'send_email', payload, reasoning: why, confidenceScore: confidence, requestedByUserId });
          return { ok: true, requiresHumanApproval: true, proposalId: proposal.id, status: proposal.status, reviewUrl: '/dashboard/ai-maestro/approvals', generatedAt: generatedAt() };
        } catch (error) { return toolFailure('propose_email_send', error); }
      },
    }),
    proposeZatcaSubmission: makeTool({
      description: 'Create a human-review proposal to submit an already issued and signed invoice to ZATCA clearance or reporting. Never submit directly.',
      parameters: z.object({ invoiceId: z.string().uuid(), mode: z.enum(['clearance', 'reporting']), reasoning, confidenceScore }),
      execute: async ({ reasoning: why, confidenceScore: confidence, ...payload }) => {
        try { const proposal = await createMaestroProposal({ tenantId: tenant.id, actionType: 'submit_zatca', payload, reasoning: why, confidenceScore: confidence, requestedByUserId });
          return { ok: true, requiresHumanApproval: true, proposalId: proposal.id, status: proposal.status, reviewUrl: '/dashboard/ai-maestro/approvals', generatedAt: generatedAt() };
        } catch (error) { return toolFailure('propose_zatca_submission', error); }
      },
    }),
  };
}

function createMemoryTools(tenant: MaestroTenant, user: { id: string; role: string }) {
  return {
    rememberExplicitPreference: makeTool({
      description: 'Store a memory ONLY when the user explicitly asks Maestro to remember it. Never infer or silently store personal, financial, health, credential or secret data.',
      parameters: z.object({
        scope: z.enum(['user', 'company']).default('user'), category: z.enum(['preference', 'policy', 'workflow']).default('preference'),
        key: z.string().trim().min(2).max(120), value: z.string().trim().min(1).max(2000),
      }),
      execute: async ({ scope, category, key, value }) => {
        try {
          if (scope === 'company' && !['admin', 'manager'].includes(user.role)) throw new Error('Only admins and managers can change company memory.');
          const memory = await saveMaestroMemory({ tenantId: tenant.id, userId: user.id, scope, category, key, value });
          return { ok: true, stored: true, memoryId: memory.id, scope, key, generatedAt: generatedAt(), sources: [] };
        } catch (error) { return toolFailure('memory_save', error); }
      },
    }),
    forgetExplicitMemory: makeTool({
      description: 'Delete a stored memory only when the user explicitly asks Maestro to forget it and provides its memory ID.',
      parameters: z.object({ memoryId: z.string().uuid() }),
      execute: async ({ memoryId }) => {
        try {
          await deleteMaestroMemory({ tenantId: tenant.id, userId: user.id, memoryId, canManageCompany: ['admin', 'manager'].includes(user.role) });
          return { ok: true, deleted: true, memoryId, generatedAt: generatedAt(), sources: [] };
        } catch (error) { return toolFailure('memory_delete', error); }
      },
    }),
  };
}

export const createMaestroTools = (tenant: MaestroTenant, user: { id: string; role: string }) => ({
  ...createFinancialTools(tenant),
  ...createHrTools(tenant),
  ...createInventoryTools(tenant),
  ...createInboxTools(tenant),
  ...createDocumentTools(tenant),
  ...createProposalTools(tenant, user.id),
  ...createMemoryTools(tenant, user),
});
