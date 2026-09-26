import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, numeric, integer } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { accounts } from './accounting';

// Custom Reports
export const customReports = pgTable('custom_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  reportType: varchar('report_type', { length: 50 }).notNull(), // 'profit_loss', 'balance_sheet', 'cash_flow', 'custom'
  configuration: jsonb('configuration').notNull(), // Report configuration (filters, groupings, etc.)
  createdByUserId: uuid('created_by_user_id'),
  isSystem: boolean('is_system').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Budgets
export const budgets = pgTable('budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  fiscalYear: integer('fiscal_year').notNull(),
  fiscalMonth: integer('fiscal_month'), // null for annual budgets
  currency: varchar('currency', { length: 3 }).default('SAR'),
  status: varchar('status', { length: 20 }).default('draft'), // draft, active, archived
  createdByUserId: uuid('created_by_user_id'),
  approvedByUserId: uuid('approved_by_user_id'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Budget Lines (per account)
export const budgetLines = pgTable('budget_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  budgetId: uuid('budget_id').notNull().references(() => budgets.id),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  budgetedAmount: numeric('budgeted_amount', { precision: 12, scale: 2 }).notNull(),
  varianceThreshold: numeric('variance_threshold', { precision: 5, scale: 2 }).default('10.00'), // Percentage threshold for alerts
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Report Snapshots (for historical comparison)
export const reportSnapshots = pgTable('report_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  reportType: varchar('report_type', { length: 50 }).notNull(),
  periodType: varchar('period_type', { length: 20 }).notNull(), // 'monthly', 'quarterly', 'annual'
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  data: jsonb('data').notNull(), // Serialized report data
  createdAt: timestamp('created_at').defaultNow(),
});

// Currency Exchange Rates
export const exchangeRates = pgTable('exchange_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  fromCurrency: varchar('from_currency', { length: 3 }).notNull(),
  toCurrency: varchar('to_currency', { length: 3 }).notNull(),
  rate: numeric('rate', { precision: 12, scale: 6 }).notNull(),
  effectiveDate: timestamp('effective_date').notNull(),
  source: varchar('source', { length: 50 }), // 'manual', 'api', etc.
  createdAt: timestamp('created_at').defaultNow(),
});

// Reconciliation Rules
export const reconciliationRules = pgTable('reconciliation_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  ruleType: varchar('rule_type', { length: 50 }).notNull(), // 'amount_match', 'date_range', 'description_match'
  configuration: jsonb('configuration').notNull(),
  isActive: boolean('is_active').default(true),
  createdByUserId: uuid('created_by_user_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Audit Log Entries
export const auditLogEntries = pgTable('audit_log_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // 'create', 'update', 'delete', 'approve', 'reverse'
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  userId: uuid('user_id').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});
