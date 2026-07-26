import { embed } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db/db';
import { documentChunks } from '@/lib/db/schema/documents';
import { google } from '@ai-sdk/google';
import { sql, and, desc, eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/errors';
import type { ToolSet } from 'ai';

const isDev = process.env.NODE_ENV === 'development';
const IS_MOCK_DATA_ENABLED = isDev || process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === '1';

const makeTool = <T extends z.ZodTypeAny>(config: {
  description: string;
  parameters: T;
  execute: (args: z.infer<T>) => Promise<Record<string, unknown>>;
}) => config as unknown as ToolSet[string];

export const hrTools = {
  getExpiringIqamas: makeTool({
    description: 'Fetch a list of employees whose Iqama is expiring soon.',
    parameters: z.object({
      department: z.string().optional().describe('Filter by department'),
    }),
    execute: async () => {
      if (IS_MOCK_DATA_ENABLED) {
        return {
          department: 'HR',
          expiringDocuments: [
            { employeeName: 'John Smith', documentType: 'Iqama', expiryDate: '2026-07-22', status: 'Expiring in 4 days', fineRisk: '500 SAR/day' },
            { employeeName: 'Ravi Kumar', documentType: 'Iqama', expiryDate: '2026-07-10', status: 'Expired', fineRisk: 'Potential Deportation' },
          ],
          totalActiveEmployees: 45,
        };
      }
      return { department: 'HR', message: 'Real DB query not yet implemented.' };
    },
  }),
  getPayrollSummary: makeTool({
    description: 'Fetch the latest payroll and WPS status for the current month.',
    parameters: z.object({
      month: z.string().optional().describe('The month to fetch payroll for'),
    }),
    execute: async () => {
      if (IS_MOCK_DATA_ENABLED) {
        return {
          department: 'Payroll',
          month: 'July 2026',
          totalSalaries: '485,200.00 SAR',
          wpsStatus: 'PENDING_SUBMISSION',
          unpaidEmployees: 0,
        };
      }
      return { department: 'Payroll', message: 'Real DB query not yet implemented.' };
    },
  }),
};

export const inventoryTools = {
  getComplianceRisks: makeTool({
    description: 'Check inventory for products that violate local MENA regulations.',
    parameters: z.object({
      category: z.string().optional().describe('Category to check'),
    }),
    execute: async () => {
      if (IS_MOCK_DATA_ENABLED) {
        return {
          department: 'Inventory Control',
          complianceRisks: [
            { sku: 'FOD-023', productName: 'Premium Arabic Coffee', issue: 'Halal Certificate Expired', actionRequired: 'Remove from shelves or renew SFDA certificate.' },
            { sku: 'FRT-044', productName: 'Ammonium Nitrate', issue: 'Security Clearance Expired', actionRequired: 'CRITICAL: DO NOT SELL. Renew Ministry of Interior clearance.' },
          ],
        };
      }
      return { department: 'Inventory Control', message: 'Real DB query not yet implemented.' };
    },
  }),
};

export const documentTools = {
  searchDocuments: makeTool({
    description: 'Search uploaded company documents for information based on semantic meaning.',
    parameters: z.object({
      query: z.string().describe('The search query or question'),
      tenantId: z.string().optional().describe('Tenant ID for multi-tenant isolation'),
    }),
    execute: async ({ query, tenantId }: { query: string; tenantId?: string }) => {
      try {
        const { embedding } = await embed({
          model: google.embedding('text-embedding-004'),
          value: query,
        });
        const similarity = sql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(embedding)})`;
        const conditions = [eq(documentChunks.docType, 'user_document')];
        if (tenantId) {
          conditions.push(eq(documentChunks.tenantId, tenantId));
        }
        const results = await db.select({
          fileName: documentChunks.fileName,
          content: documentChunks.content,
          similarity,
        })
          .from(documentChunks)
          .where(and(...conditions))
          .orderBy(desc(similarity))
          .limit(3);
        return {
          department: 'Document Management',
          results: results.map(r => ({ fileName: r.fileName, excerpt: r.content, relevanceScore: r.similarity })),
        };
      } catch (e: unknown) {
        return { error: 'Failed to search documents: ' + getErrorMessage(e) };
      }
    },
  }),
  searchZatcaRegulations: makeTool({
    description: 'Search official Saudi ZATCA regulations and tax laws.',
    parameters: z.object({
      query: z.string().describe('The tax or ZATCA related question'),
      tenantId: z.string().optional().describe('Tenant ID for multi-tenant isolation'),
    }),
    execute: async ({ query, tenantId }: { query: string; tenantId?: string }) => {
      try {
        const { embedding } = await embed({
          model: google.embedding('text-embedding-004'),
          value: query,
        });
        const similarity = sql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(embedding)})`;
        const conditions = [eq(documentChunks.docType, 'zatca_regulation')];
        if (tenantId) {
          conditions.push(eq(documentChunks.tenantId, tenantId));
        }
        const results = await db.select({
          content: documentChunks.content,
          similarity,
        })
          .from(documentChunks)
          .where(and(...conditions))
          .orderBy(desc(similarity))
          .limit(2);
        return {
          department: 'Tax & Compliance Advisor (ZATCA)',
          results: results.map(r => ({ rule: r.content, confidence: r.similarity })),
        };
      } catch (e: unknown) {
        return { error: 'Failed to query ZATCA regulations: ' + getErrorMessage(e) };
      }
    },
  }),
};

export const maestroTools = {
  ...hrTools,
  ...inventoryTools,
  ...documentTools,
};
