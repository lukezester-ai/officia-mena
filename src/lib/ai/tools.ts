import { embed } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db/db';
import { documentChunks } from '@/lib/db/schema/documents';
import { google } from '@ai-sdk/google';
import { sql, desc, eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/errors';
import type { ToolSet } from 'ai';

type ToolMeta = {
  name: string;
  description: string;
  requiredEnvVars: string[];
};

const toolMeta: ToolMeta[] = [];

const dynamicTools: Record<string, ToolSet[string]> = {};

function register(
  name: string,
  requiredEnvVars: string[],
  config: { description: string; parameters: ReturnType<typeof z.object>; execute: (args: Record<string, unknown>) => unknown },
) {
  const description = config.description;
  toolMeta.push({ name, description, requiredEnvVars });
  dynamicTools[name] = {
    description,
    parameters: config.parameters,
    execute: config.execute,
  } as unknown as ToolSet[string];
}

export function listTools(): ToolMeta[] {
  return toolMeta.filter(t => t.requiredEnvVars.every(v => process.env[v]));
}

export const maestroTools = { ...dynamicTools } as ToolSet;

register('getExpiringIqamas', [], {
  description: 'Fetch a list of employees whose Iqama is expiring soon.',
  parameters: z.object({
    department: z.string().optional().describe('Filter by department'),
  }),
  execute: async () => ({
    department: 'HR',
    expiringDocuments: [
      { employeeName: 'John Smith', documentType: 'Iqama', expiryDate: '2026-07-22', status: 'Expiring in 4 days', fineRisk: '500 SAR/day' },
      { employeeName: 'Ravi Kumar', documentType: 'Iqama', expiryDate: '2026-07-10', status: 'Expired', fineRisk: 'Potential Deportation' },
    ],
    totalActiveEmployees: 45,
  }),
});

register('getPayrollSummary', [], {
  description: 'Fetch the latest payroll and WPS status for the current month.',
  parameters: z.object({
    month: z.string().optional().describe('The month to fetch payroll for'),
  }),
  execute: async () => ({
    department: 'Payroll',
    month: 'July 2026',
    totalSalaries: '485,200.00 SAR',
    wpsStatus: 'PENDING_SUBMISSION',
    unpaidEmployees: 0,
  }),
});

register('getComplianceRisks', [], {
  description: 'Check inventory for products that violate local MENA regulations.',
  parameters: z.object({
    category: z.string().optional().describe('Category to check'),
  }),
  execute: async () => ({
    department: 'Inventory Control',
    complianceRisks: [
      { sku: 'FOD-023', productName: 'Premium Arabic Coffee', issue: 'Halal Certificate Expired', actionRequired: 'Remove from shelves or renew SFDA certificate.' },
      { sku: 'FRT-044', productName: 'Ammonium Nitrate', issue: 'Security Clearance Expired', actionRequired: 'CRITICAL: DO NOT SELL. Renew Ministry of Interior clearance.' },
    ],
  }),
});

register('searchDocuments', ['GOOGLE_GENERATIVE_AI_API_KEY'], {
  description: 'Search uploaded company documents for information based on semantic meaning.',
  parameters: z.object({
    query: z.string().describe('The search query or question'),
  }),
  execute: async (args: Record<string, unknown>) => {
    const query = String(args.query || '');
    try {
      const { embedding } = await embed({
        model: google.embedding('text-embedding-004'),
        value: query,
      });
      const similarity = sql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(embedding)})`;
      const results = await db.select({
        fileName: documentChunks.fileName,
        content: documentChunks.content,
        similarity,
      })
        .from(documentChunks)
        .where(eq(documentChunks.docType, 'user_document'))
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
});

register('searchZatcaRegulations', ['GOOGLE_GENERATIVE_AI_API_KEY'], {
  description: 'Search official Saudi ZATCA regulations and tax laws.',
  parameters: z.object({
    query: z.string().describe('The tax or ZATCA related question'),
  }),
  execute: async (args: Record<string, unknown>) => {
    const query = String(args.query || '');
    try {
      const { embedding } = await embed({
        model: google.embedding('text-embedding-004'),
        value: query,
      });
      const similarity = sql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(embedding)})`;
      const results = await db.select({
        content: documentChunks.content,
        similarity,
      })
        .from(documentChunks)
        .where(eq(documentChunks.docType, 'zatca_regulation'))
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
});
