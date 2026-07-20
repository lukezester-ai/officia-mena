/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db/db';
import { bankTransactions } from '@/lib/db/schema/bank';
import { expenses } from '@/lib/db/schema/expenses';
import { eq, and } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export async function runSmartReconciliation() {
  try {
    const tenant = await requireTenant();

    // 1. Fetch pending OUT transactions
    const pendingTransactions = await db
      .select({
        id: bankTransactions.id,
        description: bankTransactions.description,
        amount: bankTransactions.amount,
        date: bankTransactions.transactionDate,
      })
      .from(bankTransactions)
      .where(
        and(
          eq(bankTransactions.tenantId, tenant.id),
          eq(bankTransactions.status, 'pending'),
          eq(bankTransactions.type, 'OUT')
        )
      );

    // 2. Fetch pending expenses
    const pendingExpenses = await db
      .select({
        id: expenses.id,
        description: expenses.description,
        amount: expenses.amount,
        date: expenses.expenseDate,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.tenantId, tenant.id),
          eq(expenses.status, 'pending')
        )
      );

    if (pendingTransactions.length === 0 || pendingExpenses.length === 0) {
      return { success: true, message: 'لا توجد بيانات بانتظار التسوية.' };
    }

    // 3. AI Magic
    const prompt = `
      You are an expert accountant AI. Your job is to reconcile (match) bank transactions with company expenses.
      
      Pending Bank Transactions:
      ${JSON.stringify(pendingTransactions, null, 2)}
      
      Pending Company Expenses:
      ${JSON.stringify(pendingExpenses, null, 2)}
      
      Match them based on amount similarity, description semantic similarity, and dates.
      Return ONLY the confident matches.
    `;

    const { object } = await generateObject({
      model: google('gemini-3.5-flash'),
      system: 'You are a strict accounting AI. You only match records if you are highly confident they represent the same financial event.',
      prompt,
      schema: z.object({
        matches: z.array(z.object({
          transactionId: z.string().describe('The ID of the bank transaction'),
          expenseId: z.string().describe('The ID of the expense'),
          confidence: z.number().min(0).max(100).describe('Confidence score 0-100'),
          reason: z.string().describe('Brief reason in Arabic for the match')
        }))
      })
    });

    const matches = object.matches;
    let matchedCount = 0;

    // 4. Update Database
    for (const match of matches) {
      if (match.confidence > 80) { // Only high confidence
        // Update Transaction
        await db.update(bankTransactions)
          .set({ 
            status: 'reconciled',
            reconciledExpenseId: match.expenseId 
          })
          .where(eq(bankTransactions.id, match.transactionId));

        // Update Expense
        await db.update(expenses)
          .set({ status: 'reconciled' })
          .where(eq(expenses.id, match.expenseId));
          
        matchedCount++;
      }
    }

    revalidatePath('/dashboard/bank');
    revalidatePath('/dashboard/expenses');
    
    return { success: true, matchedCount, details: matches };

  } catch (error: any) {
    console.error('Reconciliation Error:', error);
    return { success: false, error: error.message };
  }
}
