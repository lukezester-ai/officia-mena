export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type NormalBalance = 'debit' | 'credit';

export type DefaultAccount = {
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;
  description: string;
};

export const DEFAULT_CHART_OF_ACCOUNTS: DefaultAccount[] = [
  { code: '1000', name: 'Cash and Bank', type: 'asset', normalBalance: 'debit', description: 'Main cash and bank clearing account' },
  { code: '1100', name: 'Accounts Receivable', type: 'asset', normalBalance: 'debit', description: 'Customer balances from issued invoices' },
  { code: '1200', name: 'Inventory', type: 'asset', normalBalance: 'debit', description: 'Inventory value on hand' },
  { code: '1300', name: 'Input VAT Recoverable', type: 'asset', normalBalance: 'debit', description: 'VAT paid on purchases that can be recovered' },
  { code: '2000', name: 'Accounts Payable', type: 'liability', normalBalance: 'credit', description: 'Supplier balances and unpaid bills' },
  { code: '2100', name: 'VAT Payable', type: 'liability', normalBalance: 'credit', description: 'VAT collected on sales payable to the authority' },
  { code: '3000', name: 'Owner Equity', type: 'equity', normalBalance: 'credit', description: 'Owner capital and retained equity' },
  { code: '4000', name: 'Sales Revenue', type: 'revenue', normalBalance: 'credit', description: 'Revenue from invoices and POS sales' },
  { code: '4100', name: 'Service Revenue', type: 'revenue', normalBalance: 'credit', description: 'Revenue from services and subscriptions' },
  { code: '5000', name: 'Cost of Goods Sold', type: 'expense', normalBalance: 'debit', description: 'Cost of inventory sold' },
  { code: '6000', name: 'Operating Expenses', type: 'expense', normalBalance: 'debit', description: 'General business operating expenses' },
  { code: '6100', name: 'Payroll Expense', type: 'expense', normalBalance: 'debit', description: 'Salaries, allowances, and payroll costs' },
];
