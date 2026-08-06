import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { accounts, journalEntries, journalLines } from '@/lib/db/schema/accounting';
import { bankTransactions } from '@/lib/db/schema/bank';
import { expenses } from '@/lib/db/schema/expenses';
import { payrollRuns } from '@/lib/db/schema/hr';
import { inventoryLevels, products } from '@/lib/db/schema/inventory';
import { invoices } from '@/lib/db/schema/invoices';
import { moneyToCents, centsToMoney } from '../utils';

export function agingBucket(date: Date | null, today = new Date()) {
  if (!date) {
    return 'current' as const;
  }

  const ageInDays = Math.max(0, Math.floor((today.getTime() - date.getTime()) / 86400000));
  if (ageInDays <= 30) return 'current' as const;
  if (ageInDays <= 60) return 'days31To60' as const;
  if (ageInDays <= 90) return 'days61To90' as const;
  return 'daysOver90' as const;
}

export function cashFlowCategory(sourceType: string | null) {
  if (!sourceType) return 'Manual / other';
  if (sourceType === 'pos.sale') return 'POS cash sales';
  if (sourceType === 'invoice.payment') return 'Customer collections';
  if (sourceType === 'expense.payment') return 'Vendor payments';
  if (sourceType === 'payroll.payment') return 'Payroll payments';
  if (sourceType === 'manual') return 'Manual entries';
  if (sourceType === 'journal.reversal') return 'Reversals';
  return 'Other accounting events';
}

export async function getAccountingOverview(tenantId: string) {
  if (tenantId === 'mock-tenant-id') {
    return {
      accounts: [], journalEntries: [], recentJournalEntries: [], trialBalance: [],
      totals: { debit: '0.00', credit: '0.00', isBalanced: true },
      financialStatements: {
        profitAndLoss: { revenue: '0.00', expenses: '0.00', netIncome: '0.00' },
        balanceSheet: { assets: '0.00', liabilities: '0.00', equity: '0.00', retainedEarnings: '0.00', liabilitiesAndEquity: '0.00', isBalanced: true },
      },
      vatControl: { outputVat: '0.00', inputVat: '0.00', netVat: '0.00', position: 'payable' },
      cashFlow: { inflow: '0.00', outflow: '0.00', net: '0.00', endingCash: '0.00', categories: [] },
      controlChecks: {
        postingGaps: { issuedInvoices: 0, posSales: 0, approvedExpenses: 0, payrollAccruals: 0, total: 0 },
        bankReconciliation: { pendingCount: 0, pendingIn: '0.00', pendingOut: '0.00' },
        inventoryCosting: { missingCostCount: 0, items: [] },
        integrity: { unbalancedEntryCount: 0 },
      },
      aging: {
        receivables: { total: '0.00', buckets: { current: '0.00', days31To60: '0.00', days61To90: '0.00', daysOver90: '0.00' }, items: [] },
        payables: { total: '0.00', buckets: { current: '0.00', days31To60: '0.00', days61To90: '0.00', daysOver90: '0.00' }, items: [] },
      },
    };
  }
  const [
    accountRows,
    entryRows,
    allEntrySourceRows,
    lineRows,
    invoiceRows,
    expenseRows,
    payrollRunRows,
    bankTransactionRows,
    stockedProductRows,
  ] = await Promise.all([
    db
      .select()
      .from(accounts)
      .where(eq(accounts.tenantId, tenantId))
      .orderBy(accounts.code),
    db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.tenantId, tenantId))
      .orderBy(desc(journalEntries.entryDate))
      .limit(20),
    db
      .select({
        id: journalEntries.id,
        sourceType: journalEntries.sourceType,
        sourceId: journalEntries.sourceId,
        totalDebit: journalEntries.totalDebit,
        totalCredit: journalEntries.totalCredit,
      })
      .from(journalEntries)
      .where(eq(journalEntries.tenantId, tenantId)),
    db
      .select({
        journalEntryId: journalLines.journalEntryId,
        accountId: journalLines.accountId,
        lineNumber: journalLines.lineNumber,
        description: journalLines.description,
        debit: journalLines.debit,
        credit: journalLines.credit,
        entityType: journalLines.entityType,
        entityId: journalLines.entityId,
      })
      .from(journalLines)
      .where(eq(journalLines.tenantId, tenantId)),
    db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        clientName: invoices.clientName,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        totalAmount: invoices.totalAmount,
        currency: invoices.currency,
        status: invoices.status,
      })
      .from(invoices)
      .where(eq(invoices.tenantId, tenantId)),
    db
      .select({
        id: expenses.id,
        description: expenses.description,
        expenseDate: expenses.expenseDate,
        amount: expenses.amount,
        currency: expenses.currency,
        status: expenses.status,
      })
      .from(expenses)
      .where(eq(expenses.tenantId, tenantId)),
    db
      .select({
        id: payrollRuns.id,
        periodMonth: payrollRuns.periodMonth,
        periodYear: payrollRuns.periodYear,
        totalAmount: payrollRuns.totalAmount,
        wpsStatus: payrollRuns.wpsStatus,
        createdAt: payrollRuns.createdAt,
      })
      .from(payrollRuns)
      .where(eq(payrollRuns.tenantId, tenantId)),
    db
      .select({
        id: bankTransactions.id,
        amount: bankTransactions.amount,
        type: bankTransactions.type,
        status: bankTransactions.status,
      })
      .from(bankTransactions)
      .where(eq(bankTransactions.tenantId, tenantId)),
    db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        costPrice: products.costPrice,
        quantity: inventoryLevels.quantity,
      })
      .from(products)
      .leftJoin(inventoryLevels, eq(products.id, inventoryLevels.productId))
      .where(eq(products.tenantId, tenantId)),
  ]);

  const accountById = new Map(accountRows.map((account) => [account.id, account]));
  const totalsByAccount = new Map<string, { debitCents: number; creditCents: number }>();
  for (const line of lineRows) {
    const totals = totalsByAccount.get(line.accountId) || { debitCents: 0, creditCents: 0 };
    totals.debitCents += moneyToCents(line.debit);
    totals.creditCents += moneyToCents(line.credit);
    totalsByAccount.set(line.accountId, totals);
  }

  let totalDebitCents = 0;
  let totalCreditCents = 0;
  let revenueCents = 0;
  let expenseCents = 0;
  let assetCents = 0;
  let liabilityCents = 0;
  let equityCents = 0;
  const accountBalanceCentsByCode = new Map<string, number>();

  const trialBalance = accountRows.map((account) => {
    const totals = totalsByAccount.get(account.id) || { debitCents: 0, creditCents: 0 };
    totalDebitCents += totals.debitCents;
    totalCreditCents += totals.creditCents;

    const signedBalanceCents = account.normalBalance === 'debit'
      ? totals.debitCents - totals.creditCents
      : totals.creditCents - totals.debitCents;

    if (account.type === 'revenue') {
      revenueCents += signedBalanceCents;
    }
    if (account.type === 'expense') {
      expenseCents += signedBalanceCents;
    }
    if (account.type === 'asset') {
      assetCents += signedBalanceCents;
    }
    if (account.type === 'liability') {
      liabilityCents += signedBalanceCents;
    }
    if (account.type === 'equity') {
      equityCents += signedBalanceCents;
    }
    accountBalanceCentsByCode.set(account.code, signedBalanceCents);

    return {
      accountId: account.id,
      code: account.code,
      name: account.name,
      type: account.type,
      normalBalance: account.normalBalance,
      debit: centsToMoney(totals.debitCents),
      credit: centsToMoney(totals.creditCents),
      balance: centsToMoney(signedBalanceCents),
    };
  });

  const linesByEntryId = new Map<string, Array<{
    id: string;
    lineNumber: number;
    accountCode: string;
    accountName: string;
    description: string | null;
    debit: string;
    credit: string;
    entityType: string | null;
    entityId: string | null;
  }>>();

  for (const line of lineRows) {
    const entryLines = linesByEntryId.get(line.journalEntryId) || [];
    const account = accountById.get(line.accountId);
    entryLines.push({
      id: `${line.journalEntryId}-${line.lineNumber}`,
      lineNumber: line.lineNumber,
      accountCode: account?.code || '----',
      accountName: account?.name || 'Unknown account',
      description: line.description,
      debit: line.debit,
      credit: line.credit,
      entityType: line.entityType,
      entityId: line.entityId,
    });
    linesByEntryId.set(line.journalEntryId, entryLines);
  }

  const recentJournalEntries = entryRows.map((entry) => ({
    ...entry,
    lines: (linesByEntryId.get(entry.id) || []).sort((a, b) => a.lineNumber - b.lineNumber),
  }));
  const entrySourceTypeById = new Map(allEntrySourceRows.map((entry) => [entry.id, entry.sourceType]));
  const cashAccount = accountRows.find((account) => account.code === '1000');
  const cashFlowByCategory = new Map<string, { inflowCents: number; outflowCents: number }>();
  let cashInflowCents = 0;
  let cashOutflowCents = 0;

  if (cashAccount) {
    for (const line of lineRows) {
      if (line.accountId !== cashAccount.id) continue;

      const debitCents = moneyToCents(line.debit);
      const creditCents = moneyToCents(line.credit);
      cashInflowCents += debitCents;
      cashOutflowCents += creditCents;

      const category = cashFlowCategory(entrySourceTypeById.get(line.journalEntryId) || null);
      const totals = cashFlowByCategory.get(category) || { inflowCents: 0, outflowCents: 0 };
      totals.inflowCents += debitCents;
      totals.outflowCents += creditCents;
      cashFlowByCategory.set(category, totals);
    }
  }

  const cashFlowCategories = Array.from(cashFlowByCategory.entries()).map(([category, totals]) => ({
    category,
    inflow: centsToMoney(totals.inflowCents),
    outflow: centsToMoney(totals.outflowCents),
    net: centsToMoney(totals.inflowCents - totals.outflowCents),
  }));
  const outputVatCents = accountBalanceCentsByCode.get('2100') || 0;
  const inputVatCents = accountBalanceCentsByCode.get('1300') || 0;
  const netVatCents = outputVatCents - inputVatCents;
  const sourceKeys = new Set(
    allEntrySourceRows
      .filter((entry) => entry.sourceType && entry.sourceId)
      .map((entry) => `${entry.sourceType}:${entry.sourceId}`)
  );
  const unbalancedEntryCount = allEntrySourceRows.filter((entry) => (
    moneyToCents(entry.totalDebit) !== moneyToCents(entry.totalCredit)
  )).length;

  const receivablesAccount = accountRows.find((account) => account.code === '1100');
  const payablesAccount = accountRows.find((account) => account.code === '2000');
  const receivableBalanceCentsByInvoiceId = new Map<string, number>();
  const payableBalanceCentsByExpenseId = new Map<string, number>();
  const payableBalanceCentsByPayrollRunId = new Map<string, number>();

  for (const line of lineRows) {
    if (!line.entityId) continue;

    const debitCents = moneyToCents(line.debit);
    const creditCents = moneyToCents(line.credit);

    if (receivablesAccount && line.accountId === receivablesAccount.id && line.entityType === 'invoice') {
      receivableBalanceCentsByInvoiceId.set(
        line.entityId,
        (receivableBalanceCentsByInvoiceId.get(line.entityId) || 0) + debitCents - creditCents
      );
    }

    if (payablesAccount && line.accountId === payablesAccount.id) {
      const payableMovementCents = creditCents - debitCents;

      if (line.entityType === 'expense') {
        payableBalanceCentsByExpenseId.set(
          line.entityId,
          (payableBalanceCentsByExpenseId.get(line.entityId) || 0) + payableMovementCents
        );
      }

      if (line.entityType === 'payroll_run') {
        payableBalanceCentsByPayrollRunId.set(
          line.entityId,
          (payableBalanceCentsByPayrollRunId.get(line.entityId) || 0) + payableMovementCents
        );
      }
    }
  }

  const receivablesAgingTotals = {
    currentCents: 0,
    days31To60Cents: 0,
    days61To90Cents: 0,
    daysOver90Cents: 0,
  };
  const receivablesItems = invoiceRows
    .filter((invoice) => invoice.status === 'issued' || invoice.status === 'overdue' || invoice.status === 'paid')
    .filter((invoice) => !invoice.invoiceNumber.startsWith('POS-'))
    .flatMap((invoice) => {
      const bucket = agingBucket(invoice.dueDate || invoice.issueDate);
      const ledgerBalanceCents = receivableBalanceCentsByInvoiceId.get(invoice.id);
      const amountCents = ledgerBalanceCents === undefined
        ? moneyToCents(invoice.totalAmount)
        : ledgerBalanceCents;
      if (amountCents <= 0) {
        return [];
      }

      receivablesAgingTotals[`${bucket}Cents`] += amountCents;

      return [{
        id: invoice.id,
        documentNumber: invoice.invoiceNumber,
        counterparty: invoice.clientName,
        date: invoice.dueDate || invoice.issueDate,
        amount: centsToMoney(amountCents),
        currency: invoice.currency,
        bucket,
      }];
    });

  const payablesAgingTotals = {
    currentCents: 0,
    days31To60Cents: 0,
    days61To90Cents: 0,
    daysOver90Cents: 0,
  };
  const payablesItems = expenseRows
    .filter((expense) => expense.status === 'approved' || expense.status === 'reconciled')
    .flatMap((expense) => {
      const bucket = agingBucket(expense.expenseDate);
      const ledgerBalanceCents = payableBalanceCentsByExpenseId.get(expense.id);
      const amountCents = ledgerBalanceCents === undefined
        ? (expense.status === 'approved' ? moneyToCents(expense.amount) : 0)
        : ledgerBalanceCents;
      if (amountCents <= 0) {
        return [];
      }

      payablesAgingTotals[`${bucket}Cents`] += amountCents;

      return [{
        id: expense.id,
        documentNumber: expense.description,
        counterparty: 'Vendor / employee',
        date: expense.expenseDate,
        amount: centsToMoney(amountCents),
        currency: expense.currency,
        bucket,
      }];
    });

  const payrollPayablesItems = payrollRunRows
    .filter((run) => run.wpsStatus === 'GENERATED' || run.wpsStatus === 'PENDING' || run.wpsStatus === 'SUBMITTED')
    .flatMap((run) => {
      const bucket = agingBucket(run.createdAt);
      const ledgerBalanceCents = payableBalanceCentsByPayrollRunId.get(run.id);
      const amountCents = ledgerBalanceCents === undefined
        ? (run.wpsStatus === 'GENERATED' || run.wpsStatus === 'PENDING' ? moneyToCents(run.totalAmount) : 0)
        : ledgerBalanceCents;
      if (amountCents <= 0) {
        return [];
      }

      payablesAgingTotals[`${bucket}Cents`] += amountCents;

      return [{
        id: run.id,
        documentNumber: `Payroll ${run.periodYear}-${run.periodMonth.toString().padStart(2, '0')}`,
        counterparty: 'Employees',
        date: run.createdAt,
        amount: centsToMoney(amountCents),
        currency: 'SAR',
        bucket,
      }];
    });
  payablesItems.push(...payrollPayablesItems);

  const issuedInvoicePostingGaps = invoiceRows.filter((invoice) => (
    (invoice.status === 'issued' || invoice.status === 'paid' || invoice.status === 'overdue') &&
    !invoice.invoiceNumber.startsWith('POS-') &&
    !sourceKeys.has(`invoice.issued:${invoice.id}`)
  )).length;
  const posPostingGaps = invoiceRows.filter((invoice) => (
    invoice.invoiceNumber.startsWith('POS-') &&
    !sourceKeys.has(`pos.sale:${invoice.id}`)
  )).length;
  const expensePostingGaps = expenseRows.filter((expense) => (
    (expense.status === 'approved' || expense.status === 'reconciled') &&
    !sourceKeys.has(`expense.approved:${expense.id}`)
  )).length;
  const payrollPostingGaps = payrollRunRows.filter((run) => (
    (run.wpsStatus === 'GENERATED' || run.wpsStatus === 'SUBMITTED') &&
    !sourceKeys.has(`payroll.accrual:${run.id}`)
  )).length;
  const pendingBankTransactions = bankTransactionRows.filter((transaction) => transaction.status === 'pending');
  const pendingBankInCents = pendingBankTransactions
    .filter((transaction) => transaction.type === 'IN')
    .reduce((sum, transaction) => sum + moneyToCents(transaction.amount), 0);
  const pendingBankOutCents = pendingBankTransactions
    .filter((transaction) => transaction.type === 'OUT')
    .reduce((sum, transaction) => sum + moneyToCents(transaction.amount), 0);
  const productsMissingCost = stockedProductRows
    .filter((product) => Number(product.quantity || 0) > 0 && Number(product.costPrice || 0) <= 0)
    .map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      quantity: product.quantity || 0,
    }));

  return {
    accounts: accountRows,
    journalEntries: entryRows,
    recentJournalEntries,
    trialBalance,
    totals: {
      debit: centsToMoney(totalDebitCents),
      credit: centsToMoney(totalCreditCents),
      isBalanced: totalDebitCents === totalCreditCents,
    },
    financialStatements: {
      profitAndLoss: {
        revenue: centsToMoney(revenueCents),
        expenses: centsToMoney(expenseCents),
        netIncome: centsToMoney(revenueCents - expenseCents),
      },
      balanceSheet: {
        assets: centsToMoney(assetCents),
        liabilities: centsToMoney(liabilityCents),
        equity: centsToMoney(equityCents),
        retainedEarnings: centsToMoney(revenueCents - expenseCents),
        liabilitiesAndEquity: centsToMoney(liabilityCents + equityCents + revenueCents - expenseCents),
        isBalanced: assetCents === liabilityCents + equityCents + revenueCents - expenseCents,
      },
    },
    vatControl: {
      outputVat: centsToMoney(outputVatCents),
      inputVat: centsToMoney(inputVatCents),
      netVat: centsToMoney(netVatCents),
      position: netVatCents >= 0 ? 'payable' : 'recoverable',
    },
    cashFlow: {
      inflow: centsToMoney(cashInflowCents),
      outflow: centsToMoney(cashOutflowCents),
      net: centsToMoney(cashInflowCents - cashOutflowCents),
      endingCash: centsToMoney(accountBalanceCentsByCode.get('1000') || 0),
      categories: cashFlowCategories,
    },
    controlChecks: {
      postingGaps: {
        issuedInvoices: issuedInvoicePostingGaps,
        posSales: posPostingGaps,
        approvedExpenses: expensePostingGaps,
        payrollAccruals: payrollPostingGaps,
        total: issuedInvoicePostingGaps + posPostingGaps + expensePostingGaps + payrollPostingGaps,
      },
      bankReconciliation: {
        pendingCount: pendingBankTransactions.length,
        pendingIn: centsToMoney(pendingBankInCents),
        pendingOut: centsToMoney(pendingBankOutCents),
      },
      inventoryCosting: {
        missingCostCount: productsMissingCost.length,
        items: productsMissingCost.slice(0, 5),
      },
      integrity: {
        unbalancedEntryCount,
      },
    },
    aging: {
      receivables: {
        total: centsToMoney(
          receivablesAgingTotals.currentCents +
          receivablesAgingTotals.days31To60Cents +
          receivablesAgingTotals.days61To90Cents +
          receivablesAgingTotals.daysOver90Cents
        ),
        buckets: {
          current: centsToMoney(receivablesAgingTotals.currentCents),
          days31To60: centsToMoney(receivablesAgingTotals.days31To60Cents),
          days61To90: centsToMoney(receivablesAgingTotals.days61To90Cents),
          daysOver90: centsToMoney(receivablesAgingTotals.daysOver90Cents),
        },
        items: receivablesItems,
      },
      payables: {
        total: centsToMoney(
          payablesAgingTotals.currentCents +
          payablesAgingTotals.days31To60Cents +
          payablesAgingTotals.days61To90Cents +
          payablesAgingTotals.daysOver90Cents
        ),
        buckets: {
          current: centsToMoney(payablesAgingTotals.currentCents),
          days31To60: centsToMoney(payablesAgingTotals.days31To60Cents),
          days61To90: centsToMoney(payablesAgingTotals.days61To90Cents),
          daysOver90: centsToMoney(payablesAgingTotals.daysOver90Cents),
        },
        items: payablesItems,
      },
    },
  };
}
