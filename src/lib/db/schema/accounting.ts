import { index, integer, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar, boolean } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  code: varchar('code', { length: 32 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 24 }).notNull(), // asset, liability, equity, revenue, expense
  normalBalance: varchar('normal_balance', { length: 6 }).notNull(), // debit, credit
  parentAccountId: uuid('parent_account_id'),
  currency: varchar('currency', { length: 3 }).default('SAR'),
  description: text('description'),
  isSystem: boolean('is_system').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  uniqueIndex('accounts_tenant_code_unique').on(table.tenantId, table.code),
  index('accounts_tenant_type_idx').on(table.tenantId, table.type),
]);

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  entryNumber: varchar('entry_number', { length: 64 }).notNull(),
  entryDate: timestamp('entry_date').notNull(),
  memo: text('memo'),
  sourceType: varchar('source_type', { length: 64 }), // invoice, expense, pos, payment, manual
  sourceId: uuid('source_id'),
  status: varchar('status', { length: 20 }).default('posted').notNull(), // draft, posted, void
  currency: varchar('currency', { length: 3 }).default('SAR'),
  totalDebit: numeric('total_debit', { precision: 15, scale: 2 }).notNull(),
  totalCredit: numeric('total_credit', { precision: 15, scale: 2 }).notNull(),
  postedAt: timestamp('posted_at'),
  createdBy: varchar('created_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  uniqueIndex('journal_entries_tenant_number_unique').on(table.tenantId, table.entryNumber),
  index('journal_entries_tenant_date_idx').on(table.tenantId, table.entryDate),
  index('journal_entries_source_idx').on(table.tenantId, table.sourceType, table.sourceId),
]);

export const journalLines = pgTable('journal_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  journalEntryId: uuid('journal_entry_id').references(() => journalEntries.id).notNull(),
  accountId: uuid('account_id').references(() => accounts.id).notNull(),
  lineNumber: integer('line_number').notNull(),
  description: text('description'),
  debit: numeric('debit', { precision: 15, scale: 2 }).default('0').notNull(),
  credit: numeric('credit', { precision: 15, scale: 2 }).default('0').notNull(),
  currency: varchar('currency', { length: 3 }).default('SAR'),
  entityType: varchar('entity_type', { length: 64 }),
  entityId: uuid('entity_id'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('journal_lines_entry_idx').on(table.journalEntryId),
  index('journal_lines_account_idx').on(table.tenantId, table.accountId),
]);
