import { index, jsonb, pgTable, uniqueIndex, uuid, varchar, text, numeric, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const bankAccounts = pgTable('bank_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  bankName: varchar('bank_name', { length: 100 }).notNull(),
  accountName: varchar('account_name', { length: 100 }).notNull(),
  iban: varchar('iban', { length: 50 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('SAR'),
  currentBalance: numeric('current_balance', { precision: 15, scale: 2 }).default('0'),
  status: varchar('status', { length: 20 }).default('active'),
  provider: varchar('provider', { length: 50 }),
  externalAccountId: varchar('external_account_id', { length: 255 }),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('bank_accounts_tenant_provider_external_unique').on(table.tenantId, table.provider, table.externalAccountId),
]);

export const bankTransactions = pgTable('bank_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  accountId: uuid('account_id').references(() => bankAccounts.id).notNull(),
  transactionDate: timestamp('transaction_date').notNull(),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  type: varchar('type', { length: 10 }).notNull(), // 'IN' or 'OUT'
  reference: varchar('reference', { length: 100 }),
  status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'reconciled'
  reconciledExpenseId: uuid('reconciled_expense_id'), // Link to expenses if OUT
  reconciledInvoiceId: uuid('reconciled_invoice_id'), // Link to invoices if IN
  createdAt: timestamp('created_at').defaultNow(),
});

export const bankingConsents = pgTable('banking_consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  externalConsentId: varchar('external_consent_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('awaiting_authorization'),
  scopes: jsonb('scopes').notNull(),
  expiresAt: timestamp('expires_at'),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('banking_consents_tenant_provider_external_unique').on(table.tenantId, table.provider, table.externalConsentId),
  index('banking_consents_tenant_status_idx').on(table.tenantId, table.status),
]);
