/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db/db';
import { products, inventoryLevels } from '@/lib/db/schema/inventory';
import { eq } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function detectStockAnomalies() {
  try {
    const tenant = await requireTenant();
    
    // Fetch products and their levels
    const allProducts = await db.select().from(products).where(eq(products.tenantId, tenant.id)).limit(50);
    const allLevels = await db.select().from(inventoryLevels).where(eq(inventoryLevels.tenantId, tenant.id));
    
    // Aggregate data for AI
    const inventoryData = allProducts.map(p => {
      const level = allLevels.find(l => l.productId === p.id);
      return {
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.unitPrice,
        cost: p.costPrice,
        stockQuantity: level ? level.quantity : 0,
        warehouse: level ? level.warehouseId : 'Unknown'
      };
    });
    
    if (inventoryData.length === 0) {
      return { success: true, data: [] };
    }

    const systemPrompt = `
      You are an expert Inventory Analyst and Supply Chain Manager.
      Review the following JSON snapshot of a company's inventory:
      
      ${JSON.stringify(inventoryData)}
      
      Identify exact anomalies, logical errors, or risks. For example:
      - "Dead Stock": High quantity but it's an expensive item holding up capital.
      - "Low Stock Warning": Extremely low quantity for an item.
      - "Pricing Error": Cost is higher than Price.
      
      Return a list of identified anomalies. Be very specific about the product name, SKU, and the exact issue.
      Write your response and explanations in Arabic, as the user is a Saudi business owner.
    `;

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        anomalies: z.array(z.object({
          sku: z.string().describe('The SKU of the product'),
          productName: z.string().describe('The name of the product'),
          severity: z.enum(['high', 'medium', 'low']).describe('Risk severity'),
          issueType: z.string().describe('Short title of the anomaly (e.g. نفاذ المخزون)'),
          description: z.string().describe('Detailed explanation of why this is an anomaly and what to do (in Arabic)'),
          capitalTiedUp: z.number().optional().describe('Estimated capital tied up or at risk in SAR')
        })).describe('List of detected anomalies, return max 5 most critical ones')
      }),
      prompt: systemPrompt,
    });

    return { success: true, data: object.anomalies };
  } catch (error: any) {
    console.error('Anomaly detection error:', error);
    return { success: false, error: error.message };
  }
}
