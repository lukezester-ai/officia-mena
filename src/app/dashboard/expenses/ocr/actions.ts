/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use server';

import { db } from '@/lib/db/db';
import { expenses } from '@/lib/db/schema/expenses';
import { requireTenant } from '@/lib/auth/get-tenant';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export async function processReceiptImage(base64Image: string) {
  try {
    const tenant = await requireTenant();

    // Remove the data:image/jpeg;base64, prefix if present
    const base64Data = base64Image.split(',')[1] || base64Image;

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        merchantName: z.string().describe('The name of the store or merchant'),
        totalAmount: z.number().describe('The final total amount paid including VAT'),
        date: z.string().describe('The date of the receipt in YYYY-MM-DD format'),
        category: z.string().describe('Categorize as: meals, travel, office, or software'),
      }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract the details from this receipt image. It is for a MENA business.' },
            { type: 'image', image: base64Data }
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
