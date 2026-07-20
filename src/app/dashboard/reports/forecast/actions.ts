/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db/db';
import { invoices } from '@/lib/db/schema/invoices';
import { expenses } from '@/lib/db/schema/expenses';
import { installments } from '@/lib/db/schema/installments';
import { eq, and, gte, lte } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function generateCashflowForecast() {
  try {
    const tenant = await requireTenant();
    
    // In a real app we would calculate exact dates. For prototyping, we fetch all relevant recent/upcoming data.
    const allInvoices = await db.select().from(invoices).where(eq(invoices.tenantId, tenant.id));
    const allExpenses = await db.select().from(expenses).where(eq(expenses.tenantId, tenant.id));
    const allInstallments = await db.select().from(installments).where(eq(installments.tenantId, tenant.id));
    
    // Calculate total historical income/expense to give AI some context
    const totalHistoricalIncome = allInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || '0'), 0);
    const totalHistoricalExpense = allExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0);
    
    const upcomingInstallments = allInstallments
      .filter(i => i.status === 'pending')
      .map(i => ({ amount: parseFloat(i.amount || '0'), dueDate: i.dueDate }));
      
    const totalUpcomingReceivables = upcomingInstallments.reduce((sum, i) => sum + i.amount, 0);

    const systemPrompt = `
      You are an expert financial analyst for a business in Saudi Arabia. 
      Analyze the following summary data:
      - Total Historical Income: ${totalHistoricalIncome} SAR
      - Total Historical Expenses: ${totalHistoricalExpense} SAR
      - Upcoming Installments (Receivables expected): ${totalUpcomingReceivables} SAR across ${upcomingInstallments.length} pending installments.
      
      Your task is to generate a realistic 3-month predictive cashflow forecast.
      Project future income and expenses based on the historical averages, but include the upcoming receivables in the income.
      
      Also provide 3 actionable, professional insights (in Arabic) regarding the business's liquidity, runway, or potential risks based on these numbers.
    `;

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        forecastData: z.array(z.object({
          month: z.string().describe('Name of the upcoming month in Arabic (e.g. أغسطس)'),
          income: z.number().describe('Predicted income for the month in SAR'),
          expense: z.number().describe('Predicted expense for the month in SAR'),
          netCash: z.number().describe('Net cash flow (income - expense)')
        })).length(3).describe('Exactly 3 months of forecast'),
        insights: z.array(z.string()).length(3).describe('3 actionable insights in Arabic based on the financial data')
      }),
      prompt: systemPrompt,
    });

    return { success: true, data: object };
  } catch (error: any) {
    console.error('Forecast error:', error);
    return { success: false, error: error.message };
  }
}
