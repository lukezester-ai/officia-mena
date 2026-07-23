/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db/db';
import { products, inventoryLevels, warehouses } from '@/lib/db/schema/inventory';
import { eq, desc, and } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function getProducts() {
  try {
    const tenant = await requireTenant();
    
    // Fetch products with their inventory levels
    const data = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        barcode: products.barcode,
        unitPrice: products.unitPrice,
        category: products.category,
        isPetroleum: products.isPetroleum,
        apiGravity: products.apiGravity,
        isFertilizer: products.isFertilizer,
        mewaRegistration: products.mewaRegistration,
        securityClearanceExpiry: products.securityClearanceExpiry,
        qty: inventoryLevels.quantity
      })
      .from(products)
      .leftJoin(inventoryLevels, eq(products.id, inventoryLevels.productId))
      .where(eq(products.tenantId, tenant.id))
      .orderBy(desc(products.createdAt));
      
    // Map to handle missing inventory levels
    const mapped = data.map(p => ({
      ...p,
      qty: p.qty || 0,
      status: (p.qty || 0) > 0 ? 'متاح' : 'نفذت الكمية'
    }));

    return { success: true, data: mapped };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createProduct(data: {
  name: string;
  sku: string;
  barcode: string;
  unitPrice: number;
  category: string;
  isPetroleum: boolean;
  apiGravity?: number;
  isFertilizer: boolean;
  mewaRegistration?: string;
  securityClearanceExpiry?: string;
}) {
  try {
    const tenant = await requireTenant();

    // 1. Ensure a default warehouse exists
    let warehouse = await db.query.warehouses.findFirst({
      where: (w, { eq }) => eq(w.tenantId, tenant.id)
    });
    
    if (!warehouse) {
      const wRes = await db.insert(warehouses).values({
        tenantId: tenant.id,
        name: 'المستودع الرئيسي (Main Warehouse)'
      }).returning();
      warehouse = wRes[0];
    }

    // 2. Insert the product
    const pRes = await db.insert(products).values({
      tenantId: tenant.id,
      name: data.name,
      sku: data.sku,
      barcode: data.barcode,
      unitPrice: data.unitPrice.toString(),
      category: data.category,
      isPetroleum: data.isPetroleum,
      apiGravity: data.apiGravity ? data.apiGravity.toString() : null,
      isFertilizer: data.isFertilizer,
      mewaRegistration: data.mewaRegistration || null,
      securityClearanceExpiry: data.securityClearanceExpiry ? new Date(data.securityClearanceExpiry) : null,
    }).returning();
    
    // 3. Add initial stock (e.g. 50 units for demo purposes so POS can sell them)
    await db.insert(inventoryLevels).values({
      tenantId: tenant.id,
      productId: pRes[0].id,
      warehouseId: warehouse.id,
      quantity: 50 // Demo initial stock
    });
    
    
    revalidatePath('/dashboard/inventory');
    revalidatePath('/dashboard/pos');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateProductWithAi(prompt: string) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("API Key missing");
    }

    const { text } = await generateText({
      model: anthropic('claude-3-5-sonnet-20240620'),
      prompt: `Analyze the following product description and categorize it. 
      Return ONLY a raw JSON object (no markdown, no backticks).
      Schema:
      {
        "name": string (Arabic),
        "sku": string (Generate a short SKU like PTR-001 or FERT-001),
        "unitPrice": number,
        "isPetroleum": boolean,
        "apiGravity": number (if petroleum, estimate around 30-45, else null),
        "isFertilizer": boolean,
        "category": string (Arabic)
      }
      
      User input: ${prompt}`,
    });

    const parsed = JSON.parse(text.trim());
    return { success: true, data: parsed };
  } catch (error: any) {
    console.error('AI Error:', error);
    
    // Fallback for demo if API key fails
    if (prompt.includes('ديزل') || prompt.includes('بترول') || prompt.includes('diesel')) {
       return { success: true, data: { name: 'ديزل ممتاز (لتر)', sku: 'PTR-900', unitPrice: 1.15, isPetroleum: true, apiGravity: 35.5, isFertilizer: false, category: 'محروقات' } };
    }
    if (prompt.includes('سماد') || prompt.includes('نترات')) {
       return { success: true, data: { name: 'نترات الأمونيوم (سماد)', sku: 'FRT-044', unitPrice: 150, isPetroleum: false, apiGravity: null, isFertilizer: true, category: 'كيماويات زراعية' } };
    }
    
    return { success: false, error: error.message };
  }
}
