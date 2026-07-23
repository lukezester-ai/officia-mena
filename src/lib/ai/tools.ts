/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { tool, embed } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db/db';
import { documentChunks } from '@/lib/db/schema/documents';
import { google } from '@ai-sdk/google';
import { sql, desc } from 'drizzle-orm';

export const hrTools = {
  getExpiringIqamas: tool({
    description: 'Fetch a list of employees whose Iqama (Residency Visa) is expiring soon or has already expired. Useful for HR compliance and risk analysis.',
    parameters: z.object({
      department: z.string().optional().describe('Filter by department (optional)'),
    }),
    execute: async (_args: any) => {
      // Simulated DB response
      return {
        department: 'HR',
        expiringDocuments: [
          { employeeName: 'John Smith', documentType: 'Iqama', expiryDate: '2026-07-22', status: 'Expiring in 4 days', fineRisk: '500 SAR/day' },
          { employeeName: 'Ravi Kumar', documentType: 'Iqama', expiryDate: '2026-07-10', status: 'Expired', fineRisk: 'Potential Deportation' }
        ],
        totalActiveEmployees: 45
      };
    },
  } as any),
  getPayrollSummary: tool({
    description: 'Fetch the latest payroll and Wage Protection System (WPS) status for the current month.',
    parameters: z.object({
      month: z.string().optional().describe('The month to fetch payroll for'),
    }),
    execute: async (_args: any) => {
      return {
        department: 'Payroll',
        month: 'July 2026',
        totalSalaries: '485,200.00 SAR',
        wpsStatus: 'PENDING_SUBMISSION',
        unpaidEmployees: 0
      };
    }
  } as any)
};

export const inventoryTools = {
  getComplianceRisks: tool({
    description: 'Check the inventory for products that violate local MENA regulations (e.g., expired Halal certificates or expired Security Clearances for fertilizers).',
    parameters: z.object({
      category: z.string().optional().describe('Category to check'),
    }),
    execute: async (_args: any) => {
      // Simulated DB response
      return {
        department: 'Inventory Control',
        complianceRisks: [
          { sku: 'FOD-023', productName: 'Premium Arabic Coffee', issue: 'Halal Certificate Expired (1444-01-01)', actionRequired: 'Remove from shelves or renew SFDA certificate.' },
          { sku: 'FRT-044', productName: 'Ammonium Nitrate (Fertilizer)', issue: 'Security Clearance Expired (2025-12-31)', actionRequired: 'CRITICAL: DO NOT SELL. Renew Ministry of Interior clearance immediately.' }
        ]
      };
    }
  } as any)
};

// The Maestro can use all tools from all departments
export const documentTools = {
  searchDocuments: tool({
    description: 'Search the uploaded company documents and contracts for information based on semantic meaning. Use this whenever the user asks about rules, contracts, policies, or specific documents.',
    parameters: z.object({
      query: z.string().describe('The search query or question'),
    }),
    execute: async ({ query }) => {
      try {
        // Embed the query
        const { embedding } = await embed({
          model: google.embedding('text-embedding-004'),
          value: query,
        });

        // Search the vector DB
        const similarity = sql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(embedding)})`;
        
        const results = await db.select({
          fileName: documentChunks.fileName,
          content: documentChunks.content,
          similarity: similarity,
        })
        .from(documentChunks)
        .orderBy(desc(similarity))
        .limit(3); // Get top 3 chunks

        return {
          department: 'Document Management',
          results: results.map(r => ({ fileName: r.fileName, excerpt: r.content, relevanceScore: r.similarity }))
        };
      } catch (e: any) {
        return { error: 'Failed to search documents: ' + e.message };
      }
    }
  } as any)
};

export const maestroTools = {
  ...hrTools,
  ...inventoryTools,
  ...documentTools
};
