'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, inArray } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import {
  createJournalEntry,
  ensureDefaultChartOfAccounts,
  findJournalEntryBySource,
  getAccountingOverview,
  reverseJournalEntry,
} from '@/lib/accounting/ledger';
import {
  postApprovedExpense,
  postIssuedInvoice,
  postPayrollAccrual,
  postPosSale,
} from '@/lib/accounting/postings';
import { db } from '@/lib/db/db';
import { accounts } from '@/lib/db/schema/accounting';
import { expenses } from '@/lib/db/schema/expenses';
import { payrollRuns } from '@/lib/db/schema/hr';
import { invoices } from '@/lib/db/schema/invoices';
import { products } from '@/lib/db/schema/inventory';
import { getErrorMessage } from '@/lib/errors';

type ManualJournalLineInput = {
  accountId: string;
  description?: string;
  debit?: string;
  credit?: string;
};

type ManualJournalEntryInput = {
  entryDate?: string;
  memo?: string;
  lines: ManualJournalLineInput[];
};

type RepairSummary = {
  issuedInvoices: number;
  posSales: number;
  approvedExpenses: number;
  payrollAccruals: number;
};

export async function getAccountingDashboard() {
  try {
    const tenant = await requireTenant();
    const data = await getAccountingOverview(tenant.id);
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function seedChartOfAccounts() {
  try {
    const tenant = await requireTenant();
    await ensureDefaultChartOfAccounts(tenant.id);
    revalidatePath('/dashboard/accounting');
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createManualJournalEntry(input: ManualJournalEntryInput) {
  try {
    const tenant = await requireTenant();
    const lines = input.lines
      .map((line) => ({
        ...line,
        description: line.description?.trim() || undefined,
        debit: line.debit?.trim() || undefined,
        credit: line.credit?.trim() || undefined,
      }))
      .filter((line) => line.accountId && (line.debit || line.credit));

    const accountIds = Array.from(new Set(lines.map((line) => line.accountId)));
    if (accountIds.length === 0) {
      return { success: false, error: 'Select at least two accounts.' };
    }

    const tenantAccounts = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(inArray(accounts.id, accountIds));

    const allowedAccountIds = new Set(tenantAccounts.map((account) => account.id));
    if (tenantAccounts.length !== accountIds.length) {
      return { success: false, error: 'One or more selected accounts do not exist.' };
    }

    const crossTenantAccount = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.tenantId, tenant.id));
    const tenantAccountIds = new Set(crossTenantAccount.map((account) => account.id));
    if (accountIds.some((accountId) => !tenantAccountIds.has(accountId) || !allowedAccountIds.has(accountId))) {
      return { success: false, error: 'One or more selected accounts are not available for this tenant.' };
    }

    const entry = await createJournalEntry({
      tenantId: tenant.id,
      entryDate: input.entryDate ? new Date(input.entryDate) : undefined,
      memo: input.memo?.trim() || 'Manual journal entry',
      sourceType: 'manual',
      lines,
    });

    revalidatePath('/dashboard/accounting');
    return { success: true, entryNumber: entry.entryNumber };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function reverseAccountingEntry(formData: FormData) {
  try {
    const tenant = await requireTenant();
    const entryId = String(formData.get('entryId') || '');

    if (!entryId) {
      throw new Error('Missing journal entry id.');
    }

    await reverseJournalEntry(tenant.id, entryId);
    revalidatePath('/dashboard/accounting');
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function repairMissingAccountingPostings(): Promise<{
  success: boolean;
  summary?: RepairSummary;
  error?: string;
}> {
  try {
    const tenant = await requireTenant();
    const summary: RepairSummary = {
      issuedInvoices: 0,
      posSales: 0,
      approvedExpenses: 0,
      payrollAccruals: 0,
    };

    const invoiceRows = await db
      .select()
      .from(invoices)
      .where(eq(invoices.tenantId, tenant.id));

    for (const invoice of invoiceRows) {
      if (invoice.status !== 'issued' && invoice.status !== 'paid' && invoice.status !== 'overdue') {
        continue;
      }

      if (invoice.invoiceNumber.startsWith('POS-')) {
        const existing = await findJournalEntryBySource(tenant.id, 'pos.sale', invoice.id);
        if (existing) continue;

        await postPosSale({
          tenantId: tenant.id,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          subtotal: invoice.subtotal,
          vatAmount: invoice.vatAmount,
          totalAmount: invoice.totalAmount,
          currency: invoice.currency,
          entryDate: invoice.issueDate,
        });
        summary.posSales++;
      } else {
        const existing = await findJournalEntryBySource(tenant.id, 'invoice.issued', invoice.id);
        if (existing) continue;

        await postIssuedInvoice({
          tenantId: tenant.id,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          subtotal: invoice.subtotal,
          vatAmount: invoice.vatAmount,
          totalAmount: invoice.totalAmount,
          currency: invoice.currency,
          entryDate: invoice.issueDate,
        });
        summary.issuedInvoices++;
      }
    }

    const expenseRows = await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.tenantId, tenant.id),
          inArray(expenses.status, ['approved', 'reconciled'])
        )
      );

    for (const expense of expenseRows) {
      const existing = await findJournalEntryBySource(tenant.id, 'expense.approved', expense.id);
      if (existing) continue;

      await postApprovedExpense({
        tenantId: tenant.id,
        expenseId: expense.id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        currency: expense.currency,
        entryDate: expense.expenseDate,
      });
      summary.approvedExpenses++;
    }

    const payrollRunRows = await db
      .select()
      .from(payrollRuns)
      .where(
        and(
          eq(payrollRuns.tenantId, tenant.id),
          inArray(payrollRuns.wpsStatus, ['GENERATED', 'SUBMITTED'])
        )
      );

    for (const payrollRun of payrollRunRows) {
      const existing = await findJournalEntryBySource(tenant.id, 'payroll.accrual', payrollRun.id);
      if (existing) continue;

      await postPayrollAccrual({
        tenantId: tenant.id,
        payrollRunId: payrollRun.id,
        periodMonth: Number(payrollRun.periodMonth),
        periodYear: Number(payrollRun.periodYear),
        amount: payrollRun.totalAmount,
        entryDate: new Date(Number(payrollRun.periodYear), Number(payrollRun.periodMonth) - 1, 1),
      });
      summary.payrollAccruals++;
    }

    revalidatePath('/dashboard/accounting');
    return { success: true, summary };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateProductCostPrice(formData: FormData) {
  try {
    const tenant = await requireTenant();
    const productId = String(formData.get('productId') || '');
    const costPrice = Number(formData.get('costPrice') || 0);

    if (!productId) {
      throw new Error('Missing product id.');
    }

    if (!Number.isFinite(costPrice) || costPrice <= 0) {
      throw new Error('Cost price must be greater than zero.');
    }

    await db
      .update(products)
      .set({ costPrice: costPrice.toFixed(2), updatedAt: new Date() })
      .where(and(eq(products.id, productId), eq(products.tenantId, tenant.id)));

    revalidatePath('/dashboard/accounting');
    revalidatePath('/dashboard/inventory');
    revalidatePath('/dashboard/pos');
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}
