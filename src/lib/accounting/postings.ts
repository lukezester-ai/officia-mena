import {
  createJournalEntryOnce,
  ensureDefaultChartOfAccounts,
  getAccountIdByCode,
  type JournalLineInput,
} from './ledger';

type MoneyInput = string | number;

type IssuedInvoicePostingInput = {
  tenantId: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  subtotal: MoneyInput;
  vatAmount: MoneyInput;
  totalAmount: MoneyInput;
  currency?: string | null;
  entryDate?: Date;
};

type PosSalePostingInput = {
  tenantId: string;
  invoiceId: string;
  invoiceNumber: string;
  subtotal: MoneyInput;
  vatAmount: MoneyInput;
  totalAmount: MoneyInput;
  currency?: string | null;
  entryDate?: Date;
};

type ApprovedExpensePostingInput = {
  tenantId: string;
  expenseId: string;
  description: string;
  amount: MoneyInput;
  category?: string | null;
  currency?: string | null;
  entryDate?: Date | null;
};

type InvoicePaymentPostingInput = {
  tenantId: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: MoneyInput;
  currency?: string | null;
  entryDate?: Date | null;
  sourceId?: string;
};

type ExpensePaymentPostingInput = {
  tenantId: string;
  expenseId: string;
  description: string;
  amount: MoneyInput;
  currency?: string | null;
  entryDate?: Date | null;
  sourceId?: string;
};

type InventoryCogsPostingInput = {
  tenantId: string;
  sourceId: string;
  referenceNumber: string;
  amount: MoneyInput;
  currency?: string | null;
  entryDate?: Date | null;
};

type PayrollAccrualPostingInput = {
  tenantId: string;
  payrollRunId: string;
  periodMonth: number;
  periodYear: number;
  amount: MoneyInput;
  currency?: string | null;
  entryDate?: Date | null;
};

type PayrollPaymentPostingInput = {
  tenantId: string;
  payrollRunId: string;
  periodMonth: number;
  periodYear: number;
  amount: MoneyInput;
  currency?: string | null;
  entryDate?: Date | null;
  sourceId?: string;
};

function toAmount(value: MoneyInput) {
  return typeof value === 'number' ? value.toFixed(2) : value;
}

function hasPositiveAmount(value: MoneyInput) {
  return Number(value) > 0;
}

function splitVatInclusiveAmount(total: MoneyInput, vatRate = 15) {
  const gross = Number(total);
  if (!Number.isFinite(gross) || gross <= 0) {
    return { netAmount: '0.00', vatAmount: '0.00' };
  }

  const netAmount = gross / (1 + vatRate / 100);
  const vatAmount = gross - netAmount;

  return {
    netAmount: netAmount.toFixed(2),
    vatAmount: vatAmount.toFixed(2),
  };
}

async function accountMap(tenantId: string) {
  await ensureDefaultChartOfAccounts(tenantId);

  return {
    cash: await getAccountIdByCode(tenantId, '1000'),
    receivables: await getAccountIdByCode(tenantId, '1100'),
    inventory: await getAccountIdByCode(tenantId, '1200'),
    inputVatRecoverable: await getAccountIdByCode(tenantId, '1300'),
    payables: await getAccountIdByCode(tenantId, '2000'),
    vatPayable: await getAccountIdByCode(tenantId, '2100'),
    salesRevenue: await getAccountIdByCode(tenantId, '4000'),
    cogs: await getAccountIdByCode(tenantId, '5000'),
    operatingExpenses: await getAccountIdByCode(tenantId, '6000'),
    payrollExpense: await getAccountIdByCode(tenantId, '6100'),
  };
}

export async function postIssuedInvoice(input: IssuedInvoicePostingInput) {
  const account = await accountMap(input.tenantId);
  const lines: JournalLineInput[] = [
    {
      accountId: account.receivables,
      description: `Receivable for invoice ${input.invoiceNumber}`,
      debit: toAmount(input.totalAmount),
      entityType: 'invoice',
      entityId: input.invoiceId,
    },
    {
      accountId: account.salesRevenue,
      description: `Revenue for invoice ${input.invoiceNumber}`,
      credit: toAmount(input.subtotal),
      entityType: 'invoice',
      entityId: input.invoiceId,
    },
  ];

  if (hasPositiveAmount(input.vatAmount)) {
    lines.push({
      accountId: account.vatPayable,
      description: `VAT payable for invoice ${input.invoiceNumber}`,
      credit: toAmount(input.vatAmount),
      entityType: 'invoice',
      entityId: input.invoiceId,
    });
  }

  return createJournalEntryOnce({
    tenantId: input.tenantId,
    entryDate: input.entryDate,
    memo: `Issued invoice ${input.invoiceNumber} - ${input.clientName}`,
    sourceType: 'invoice.issued',
    sourceId: input.invoiceId,
    currency: input.currency || 'SAR',
    lines,
  });
}

export async function postPosSale(input: PosSalePostingInput) {
  const account = await accountMap(input.tenantId);
  const lines: JournalLineInput[] = [
    {
      accountId: account.cash,
      description: `Cash received for POS sale ${input.invoiceNumber}`,
      debit: toAmount(input.totalAmount),
      entityType: 'invoice',
      entityId: input.invoiceId,
    },
    {
      accountId: account.salesRevenue,
      description: `Revenue for POS sale ${input.invoiceNumber}`,
      credit: toAmount(input.subtotal),
      entityType: 'invoice',
      entityId: input.invoiceId,
    },
  ];

  if (hasPositiveAmount(input.vatAmount)) {
    lines.push({
      accountId: account.vatPayable,
      description: `VAT payable for POS sale ${input.invoiceNumber}`,
      credit: toAmount(input.vatAmount),
      entityType: 'invoice',
      entityId: input.invoiceId,
    });
  }

  return createJournalEntryOnce({
    tenantId: input.tenantId,
    entryDate: input.entryDate,
    memo: `POS sale ${input.invoiceNumber}`,
    sourceType: 'pos.sale',
    sourceId: input.invoiceId,
    currency: input.currency || 'SAR',
    lines,
  });
}

export async function postApprovedExpense(input: ApprovedExpensePostingInput) {
  const account = await accountMap(input.tenantId);
  const vatSplit = splitVatInclusiveAmount(input.amount);
  const debitAccountId = input.category === 'inventory_purchase'
    ? account.inventory
    : account.operatingExpenses;
  const debitDescription = input.category === 'inventory_purchase'
    ? `Inventory purchase - ${input.description}`
    : input.description;
  const lines: JournalLineInput[] = [
    {
      accountId: debitAccountId,
      description: debitDescription,
      debit: vatSplit.netAmount,
      entityType: 'expense',
      entityId: input.expenseId,
    },
    {
      accountId: account.payables,
      description: `Payable for ${input.description}`,
      credit: toAmount(input.amount),
      entityType: 'expense',
      entityId: input.expenseId,
    },
  ];

  if (hasPositiveAmount(vatSplit.vatAmount)) {
    lines.splice(1, 0, {
      accountId: account.inputVatRecoverable,
      description: `Input VAT recoverable for ${input.description}`,
      debit: vatSplit.vatAmount,
      entityType: 'expense',
      entityId: input.expenseId,
    });
  }

  return createJournalEntryOnce({
    tenantId: input.tenantId,
    entryDate: input.entryDate || undefined,
    memo: `Approved expense - ${input.description}`,
    sourceType: 'expense.approved',
    sourceId: input.expenseId,
    currency: input.currency || 'SAR',
    lines,
  });
}

export async function postInventoryCogs(input: InventoryCogsPostingInput) {
  if (!hasPositiveAmount(input.amount)) {
    return null;
  }

  const account = await accountMap(input.tenantId);

  return createJournalEntryOnce({
    tenantId: input.tenantId,
    entryDate: input.entryDate || undefined,
    memo: `COGS for ${input.referenceNumber}`,
    sourceType: 'inventory.cogs',
    sourceId: input.sourceId,
    currency: input.currency || 'SAR',
    lines: [
      {
        accountId: account.cogs,
        description: `Cost of goods sold for ${input.referenceNumber}`,
        debit: toAmount(input.amount),
        entityType: 'invoice',
        entityId: input.sourceId,
      },
      {
        accountId: account.inventory,
        description: `Inventory relieved for ${input.referenceNumber}`,
        credit: toAmount(input.amount),
        entityType: 'invoice',
        entityId: input.sourceId,
      },
    ],
  });
}

export async function postPayrollAccrual(input: PayrollAccrualPostingInput) {
  const account = await accountMap(input.tenantId);
  const period = `${input.periodYear}-${input.periodMonth.toString().padStart(2, '0')}`;

  return createJournalEntryOnce({
    tenantId: input.tenantId,
    entryDate: input.entryDate || undefined,
    memo: `Payroll accrual for ${period}`,
    sourceType: 'payroll.accrual',
    sourceId: input.payrollRunId,
    currency: input.currency || 'SAR',
    lines: [
      {
        accountId: account.payrollExpense,
        description: `Payroll expense for ${period}`,
        debit: toAmount(input.amount),
        entityType: 'payroll_run',
        entityId: input.payrollRunId,
      },
      {
        accountId: account.payables,
        description: `Payroll payable for ${period}`,
        credit: toAmount(input.amount),
        entityType: 'payroll_run',
        entityId: input.payrollRunId,
      },
    ],
  });
}

export async function postPayrollPayment(input: PayrollPaymentPostingInput) {
  const account = await accountMap(input.tenantId);
  const period = `${input.periodYear}-${input.periodMonth.toString().padStart(2, '0')}`;

  return createJournalEntryOnce({
    tenantId: input.tenantId,
    entryDate: input.entryDate || undefined,
    memo: `Payroll payment for ${period}`,
    sourceType: 'payroll.payment',
    sourceId: input.sourceId || input.payrollRunId,
    currency: input.currency || 'SAR',
    lines: [
      {
        accountId: account.payables,
        description: `Settle payroll payable for ${period}`,
        debit: toAmount(input.amount),
        entityType: 'payroll_run',
        entityId: input.payrollRunId,
      },
      {
        accountId: account.cash,
        description: `Bank payroll payment for ${period}`,
        credit: toAmount(input.amount),
        entityType: 'payroll_run',
        entityId: input.payrollRunId,
      },
    ],
  });
}

export async function postInvoicePayment(input: InvoicePaymentPostingInput) {
  const account = await accountMap(input.tenantId);

  return createJournalEntryOnce({
    tenantId: input.tenantId,
    entryDate: input.entryDate || undefined,
    memo: `Payment received for invoice ${input.invoiceNumber} - ${input.clientName}`,
    sourceType: 'invoice.payment',
    sourceId: input.sourceId || input.invoiceId,
    currency: input.currency || 'SAR',
    lines: [
      {
        accountId: account.cash,
        description: `Payment received for invoice ${input.invoiceNumber}`,
        debit: toAmount(input.amount),
        entityType: 'invoice',
        entityId: input.invoiceId,
      },
      {
        accountId: account.receivables,
        description: `Settle receivable for invoice ${input.invoiceNumber}`,
        credit: toAmount(input.amount),
        entityType: 'invoice',
        entityId: input.invoiceId,
      },
    ],
  });
}

export async function postExpensePayment(input: ExpensePaymentPostingInput) {
  const account = await accountMap(input.tenantId);

  return createJournalEntryOnce({
    tenantId: input.tenantId,
    entryDate: input.entryDate || undefined,
    memo: `Expense payment - ${input.description}`,
    sourceType: 'expense.payment',
    sourceId: input.sourceId || input.expenseId,
    currency: input.currency || 'SAR',
    lines: [
      {
        accountId: account.payables,
        description: `Settle payable for ${input.description}`,
        debit: toAmount(input.amount),
        entityType: 'expense',
        entityId: input.expenseId,
      },
      {
        accountId: account.cash,
        description: `Bank payment for ${input.description}`,
        credit: toAmount(input.amount),
        entityType: 'expense',
        entityId: input.expenseId,
      },
    ],
  });
}
