/* eslint-disable @typescript-eslint/no-explicit-any */

'use server';

import { db } from '@/lib/db/db';
import { bankTransactions } from '@/lib/db/schema/bank';
import { expenses } from '@/lib/db/schema/expenses';
import { payrollRuns } from '@/lib/db/schema/hr';
import { invoices } from '@/lib/db/schema/invoices';
import { accounts, journalLines } from '@/lib/db/schema/accounting';
import { and, eq, inArray } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  postApprovedExpense,
  postExpensePayment,
  postInvoicePayment,
  postIssuedInvoice,
  postPayrollPayment,
} from '@/lib/accounting/postings';

type MoneyInput = string | number | null | undefined;

function moneyToCents(value: MoneyInput) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  return Math.round(Number(value) * 100);
}

function centsToMoney(cents: number) {
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.abs(cents);
  return `${sign}${Math.floor(absolute / 100)}.${(absolute % 100).toString().padStart(2, '0')}`;
}

function addBalance(map: Map<string, number>, id: string, cents: number) {
  map.set(id, (map.get(id) || 0) + cents);
}

export async function runSmartReconciliation() {
  try {
    const tenant = await requireTenant();

    const pendingTransactions = await db
      .select({
        id: bankTransactions.id,
        description: bankTransactions.description,
        amount: bankTransactions.amount,
        date: bankTransactions.transactionDate,
        type: bankTransactions.type,
      })
      .from(bankTransactions)
      .where(and(eq(bankTransactions.tenantId, tenant.id), eq(bankTransactions.status, 'pending')));

    const pendingExpenseRows = await db
      .select({
        id: expenses.id,
        description: expenses.description,
        amount: expenses.amount,
        date: expenses.expenseDate,
        category: expenses.category,
        currency: expenses.currency,
        status: expenses.status,
      })
      .from(expenses)
      .where(and(eq(expenses.tenantId, tenant.id), inArray(expenses.status, ['pending', 'approved', 'reconciled'])));

    const outstandingInvoiceRows = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        clientName: invoices.clientName,
        subtotal: invoices.subtotal,
        vatAmount: invoices.vatAmount,
        totalAmount: invoices.totalAmount,
        date: invoices.issueDate,
        currency: invoices.currency,
        status: invoices.status,
      })
      .from(invoices)
      .where(and(eq(invoices.tenantId, tenant.id), inArray(invoices.status, ['issued', 'overdue', 'paid'])));

    const pendingPayrollRuns = await db
      .select({
        id: payrollRuns.id,
        periodMonth: payrollRuns.periodMonth,
        periodYear: payrollRuns.periodYear,
        totalAmount: payrollRuns.totalAmount,
        wpsStatus: payrollRuns.wpsStatus,
        createdAt: payrollRuns.createdAt,
      })
      .from(payrollRuns)
      .where(and(eq(payrollRuns.tenantId, tenant.id), inArray(payrollRuns.wpsStatus, ['PENDING', 'GENERATED', 'SUBMITTED'])));

    const ledgerBalanceRows = await db
      .select({
        accountCode: accounts.code,
        debit: journalLines.debit,
        credit: journalLines.credit,
        entityType: journalLines.entityType,
        entityId: journalLines.entityId,
      })
      .from(journalLines)
      .innerJoin(accounts, eq(journalLines.accountId, accounts.id))
      .where(and(eq(journalLines.tenantId, tenant.id), inArray(accounts.code, ['1100', '2000'])));

    const receivableBalanceCentsByInvoiceId = new Map<string, number>();
    const payableBalanceCentsByExpenseId = new Map<string, number>();
    const payableBalanceCentsByPayrollRunId = new Map<string, number>();

    for (const line of ledgerBalanceRows) {
      if (!line.entityId) continue;

      const debitCents = moneyToCents(line.debit);
      const creditCents = moneyToCents(line.credit);

      if (line.accountCode === '1100' && line.entityType === 'invoice') {
        addBalance(receivableBalanceCentsByInvoiceId, line.entityId, debitCents - creditCents);
      }

      if (line.accountCode === '2000' && line.entityType === 'expense') {
        addBalance(payableBalanceCentsByExpenseId, line.entityId, creditCents - debitCents);
      }

      if (line.accountCode === '2000' && line.entityType === 'payroll_run') {
        addBalance(payableBalanceCentsByPayrollRunId, line.entityId, creditCents - debitCents);
      }
    }

    const pendingExpenses = pendingExpenseRows
      .map((expense) => {
        const ledgerBalanceCents = payableBalanceCentsByExpenseId.get(expense.id);
        const remainingCents = ledgerBalanceCents === undefined
          ? (expense.status === 'reconciled' ? 0 : moneyToCents(expense.amount))
          : ledgerBalanceCents;

        return {
          ...expense,
          originalAmount: expense.amount,
          remainingAmount: centsToMoney(remainingCents),
          remainingCents,
        };
      })
      .filter((expense) => expense.remainingCents > 0);

    const outstandingInvoices = outstandingInvoiceRows
      .filter((invoice) => !invoice.invoiceNumber.startsWith('POS-'))
      .map((invoice) => {
        const ledgerBalanceCents = receivableBalanceCentsByInvoiceId.get(invoice.id);
        const remainingCents = ledgerBalanceCents === undefined
          ? moneyToCents(invoice.totalAmount)
          : ledgerBalanceCents;

        return {
          ...invoice,
          originalAmount: invoice.totalAmount,
          remainingAmount: centsToMoney(remainingCents),
          remainingCents,
        };
      })
      .filter((invoice) => invoice.remainingCents > 0);

    const payablePayrollRuns = pendingPayrollRuns
      .map((run) => {
        const ledgerBalanceCents = payableBalanceCentsByPayrollRunId.get(run.id);
        const remainingCents = ledgerBalanceCents === undefined
          ? (run.wpsStatus === 'SUBMITTED' ? 0 : moneyToCents(run.totalAmount))
          : ledgerBalanceCents;

        return {
          ...run,
          originalAmount: run.totalAmount,
          remainingAmount: centsToMoney(remainingCents),
          remainingCents,
        };
      })
      .filter((run) => run.remainingCents > 0);

    if (
      pendingTransactions.length === 0 ||
      (pendingExpenses.length === 0 && outstandingInvoices.length === 0 && payablePayrollRuns.length === 0)
    ) {
      return { success: true, message: 'No records are waiting for reconciliation.' };
    }

    const prompt = `
      You are an expert accountant AI. Reconcile pending bank transactions.

      Rules:
      - OUT bank transactions can match company expenses.
      - OUT bank transactions can match generated payroll runs.
      - IN bank transactions can match customer invoices.
      - Match by remainingAmount first, then semantic description similarity and transaction date proximity.
      - originalAmount is historical context only; remainingAmount is the amount still open in the ledger.
      - A bank transaction can match a smaller remainingAmount when it is a final partial settlement.
      - Return only high-confidence matches.

      Pending Bank Transactions:
      ${JSON.stringify(pendingTransactions, null, 2)}

      Pending Company Expenses:
      ${JSON.stringify(pendingExpenses, null, 2)}

      Outstanding Customer Invoices:
      ${JSON.stringify(outstandingInvoices, null, 2)}

      Generated Payroll Runs:
      ${JSON.stringify(payablePayrollRuns, null, 2)}
    `;

    const { object } = await generateObject({
      model: google('gemini-3.5-flash'),
      system: 'You are a strict accounting AI. Only match records when they represent the same financial event.',
      prompt,
      schema: z.object({
        matches: z.array(z.object({
          transactionId: z.string().describe('The ID of the bank transaction'),
          matchType: z.enum(['expense', 'invoice', 'payroll']).describe('Whether the transaction matches an expense, invoice, or payroll run'),
          matchId: z.string().describe('The ID of the matched expense, invoice, or payroll run'),
          confidence: z.number().min(0).max(100).describe('Confidence score from 0 to 100'),
          reason: z.string().describe('Brief Arabic reason for the match'),
        })),
      }),
    });

    let matchedCount = 0;

    for (const match of object.matches) {
      if (match.confidence <= 80) continue;

      const transaction = pendingTransactions.find((item) => item.id === match.transactionId);
      if (!transaction) continue;

      if (match.matchType === 'expense' && transaction.type === 'OUT') {
        const expense = pendingExpenses.find((item) => item.id === match.matchId);
        if (!expense) continue;

        await db
          .update(bankTransactions)
          .set({
            status: 'reconciled',
            reconciledExpenseId: expense.id,
          })
          .where(and(eq(bankTransactions.id, transaction.id), eq(bankTransactions.tenantId, tenant.id)));

        await db
          .update(expenses)
          .set({ status: 'reconciled', updatedAt: new Date() })
          .where(and(eq(expenses.id, expense.id), eq(expenses.tenantId, tenant.id)));

        await postApprovedExpense({
          tenantId: tenant.id,
          expenseId: expense.id,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          currency: expense.currency,
          entryDate: expense.date,
        });

        await postExpensePayment({
          tenantId: tenant.id,
          expenseId: expense.id,
          description: expense.description,
          amount: transaction.amount,
          currency: expense.currency,
          entryDate: transaction.date,
          sourceId: transaction.id,
        });

        matchedCount++;
      }

      if (match.matchType === 'invoice' && transaction.type === 'IN') {
        const invoice = outstandingInvoices.find((item) => item.id === match.matchId);
        if (!invoice) continue;

        await db
          .update(bankTransactions)
          .set({
            status: 'reconciled',
            reconciledInvoiceId: invoice.id,
          })
          .where(and(eq(bankTransactions.id, transaction.id), eq(bankTransactions.tenantId, tenant.id)));

        const transactionAmount = Number(transaction.amount);
        const invoiceStatus = moneyToCents(transactionAmount) >= invoice.remainingCents ? 'paid' : 'issued';

        await db
          .update(invoices)
          .set({ status: invoiceStatus, updatedAt: new Date() })
          .where(and(eq(invoices.id, invoice.id), eq(invoices.tenantId, tenant.id)));

        await postIssuedInvoice({
          tenantId: tenant.id,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          subtotal: invoice.subtotal,
          vatAmount: invoice.vatAmount,
          totalAmount: invoice.totalAmount,
          currency: invoice.currency,
          entryDate: invoice.date,
        });

        await postInvoicePayment({
          tenantId: tenant.id,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          amount: transaction.amount,
          currency: invoice.currency,
          entryDate: transaction.date,
          sourceId: transaction.id,
        });

        matchedCount++;
      }

      if (match.matchType === 'payroll' && transaction.type === 'OUT') {
        const payrollRun = payablePayrollRuns.find((item) => item.id === match.matchId);
        if (!payrollRun) continue;

        await db
          .update(bankTransactions)
          .set({ status: 'reconciled' })
          .where(and(eq(bankTransactions.id, transaction.id), eq(bankTransactions.tenantId, tenant.id)));

        await db
          .update(payrollRuns)
          .set({ wpsStatus: 'SUBMITTED' })
          .where(and(eq(payrollRuns.id, payrollRun.id), eq(payrollRuns.tenantId, tenant.id)));

        await postPayrollPayment({
          tenantId: tenant.id,
          payrollRunId: payrollRun.id,
          periodMonth: Number(payrollRun.periodMonth),
          periodYear: Number(payrollRun.periodYear),
          amount: transaction.amount,
          entryDate: transaction.date,
          sourceId: transaction.id,
        });

        matchedCount++;
      }
    }

    revalidatePath('/dashboard/bank');
    revalidatePath('/dashboard/expenses');
    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard/hr/payroll');
    revalidatePath('/dashboard/accounting');

    return { success: true, matchedCount, details: object.matches };
  } catch (error: any) {
    console.error('Reconciliation Error:', error);
    return { success: false, error: error.message };
  }
}
