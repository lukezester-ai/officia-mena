/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use server';

import { db } from '@/lib/db/db';
import { expenses } from '@/lib/db/schema/expenses';
import { requireTenant } from '@/lib/auth/get-tenant';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'fake-key-to-allow-build',
});

export async function processReceiptImage(base64Image: string) {
  try {
    const tenant = await requireTenant();

    // Remove the data:image/jpeg;base64, prefix if present
    const base64Data = base64Image.split(',')[1] || base64Image;
    // Determine mime type if possible, assume jpeg as default
    const mimeType = base64Image.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';

    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-latest'),
      schema: z.object({
        merchantName: z.string().describe('The name of the store or merchant (اسم التاجر)'),
        totalAmount: z.number().describe('The final total amount paid including VAT (المبلغ الإجمالي)'),
        vatAmount: z.number().describe('The VAT/Tax amount if present on the receipt (مبلغ ضريبة القيمة المضافة). Use 0 if not found.'),
        vatNumber: z.string().describe('The Tax Registration Number (الرقم الضريبي) if present. Use "N/A" if not found.'),
        date: z.string().describe('The date of the receipt in YYYY-MM-DD format (التاريخ)'),
        category: z.string().describe('Categorize as: meals, travel, office, or software (التصنيف)'),
      }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract the details from this receipt image. It is for a business in the Middle East (MENA). Pay special attention to the total amount, VAT amount, and Tax Registration Number if it exists.' },
            { 
              type: 'image', 
              image: `data:${mimeType};base64,${base64Data}` 
            }
          ]
        }
      ]
    });

    // Save it to DB automatically
    await db.insert(expenses).values({
      tenantId: tenant.id,
      description: `OCR: ${object.merchantName}`,
      amount: object.totalAmount.toFixed(2),
      category: object.category,
      expenseDate: new Date(object.date),
      status: 'pending'
    });

    revalidatePath('/dashboard/expenses');
    return { success: true, data: object };

  } catch (error: any) {
    console.error('OCR Error:', error);
    return { success: false, error: error.message };
  }
}
