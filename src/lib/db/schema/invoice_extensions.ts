import { pgTable, uuid, varchar, text, timestamp, numeric, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { invoices } from './invoices';

// Invoice Templates
export const invoiceTemplates = pgTable('invoice_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  templateType: varchar('template_type', { length: 50 }).notNull(), // 'standard', 'custom', ' recurring'
  layout: jsonb('layout').notNull(), // Template layout configuration
  defaultVatRate: numeric('default_vat_rate', { precision: 5, scale: 2 }).default('15.00'),
  paymentTerms: integer('payment_terms').default(30), // Days
  currency: varchar('currency', { length: 3 }).default('SAR'),
  isDefault: boolean('is_default').default(false),
  createdByUserId: uuid('created_by_user_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Invoice Workflows
export const invoiceWorkflows = pgTable('invoice_workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  stages: jsonb('stages').notNull(), // Workflow stages configuration
  autoTransition: boolean('auto_transition').default(false),
  requiresApproval: boolean('requires_approval').default(false),
  approvalThreshold: numeric('approval_threshold', { precision: 12, scale: 2 }).default('0.00'),
  createdByUserId: uuid('created_by_user_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Invoice Workflow History
export const invoiceWorkflowHistory = pgTable('invoice_workflow_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  workflowId: uuid('workflow_id').notNull(),
  stage: varchar('stage', { length: 50 }).notNull(),
  previousStage: varchar('previous_stage', { length: 50 }),
  action: varchar('action', { length: 50 }).notNull(), // 'created', 'approved', 'rejected', 'sent', 'paid'
  actorId: uuid('actor_id').notNull(),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Invoice Reminders
export const invoiceReminders = pgTable('invoice_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  reminderType: varchar('reminder_type', { length: 50 }).notNull(), // 'due_date', 'overdue', 'custom'
  daysBeforeDue: integer('days_before_due'),
  daysAfterDue: integer('days_after_due'),
  subject: varchar('subject', { length: 255 }),
  message: text('message').notNull(),
  isAutomated: boolean('is_automated').default(true),
  isActive: boolean('is_active').default(true),
  lastSentAt: timestamp('last_sent_at'),
  sendCount: integer('send_count').default(0),
  createdByUserId: uuid('created_by_user_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Recurring Invoices
export const recurringInvoices = pgTable('recurring_invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  clientId: uuid('client_id').notNull(), // Would reference clients table
  templateId: uuid('template_id').references(() => invoiceTemplates.id),
  frequency: varchar('frequency', { length: 20 }).notNull(), // 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'
  interval: integer('interval').default(1), // Every X periods
  dayOfMonth: integer('day_of_month'), // For monthly frequency
  dayOfWeek: integer('day_of_week'), // For weekly frequency
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  nextInvoiceDate: timestamp('next_invoice_date').notNull(),
  invoiceAmount: numeric('invoice_amount', { precision: 12, scale: 2 }).notNull(),
  vatRate: numeric('vat_rate', { precision: 5, scale: 2 }).default('15.00'),
  currency: varchar('currency', { length: 3 }).default('SAR'),
  paymentTerms: integer('payment_terms').default(30),
  autoGenerate: boolean('auto_generate').default(true),
  autoSend: boolean('auto_send').default(false),
  isActive: boolean('is_active').default(true),
  lastGeneratedAt: timestamp('last_generated_at'),
  totalGenerated: integer('total_generated').default(0),
  createdByUserId: uuid('created_by_user_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Recurring Invoice History
export const recurringInvoiceHistory = pgTable('recurring_invoice_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  recurringInvoiceId: uuid('recurring_invoice_id').notNull(),
  generatedInvoiceId: uuid('generated_invoice_id').notNull().references(() => invoices.id),
  scheduledDate: timestamp('scheduled_date').notNull(),
  generatedDate: timestamp('generated_date').notNull(),
  status: varchar('status', { length: 20 }).default('generated'), // 'generated', 'sent', 'paid', 'failed'
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Invoice Collections
export const invoiceCollections = pgTable('invoice_collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  collectionStage: varchar('collection_stage', { length: 50 }).notNull(), // 'friendly', 'formal', 'escalated', 'legal'
  actionTaken: varchar('action_taken', { length: 50 }), // 'email_sent', 'phone_call', 'formal_letter', etc.
  notes: text('notes'),
  assignedToUserId: uuid('assigned_to_user_id'),
  nextActionDate: timestamp('next_action_date'),
  resolvedAt: timestamp('resolved_at'),
  createdByUserId: uuid('created_by_user_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Invoice Analytics
export const invoiceAnalytics = pgTable('invoice_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  periodType: varchar('period_type', { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly', 'quarterly', 'annual'
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  totalInvoices: integer('total_invoices').default(0),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).default('0'),
  paidAmount: numeric('paid_amount', { precision: 12, scale: 2 }).default('0'),
  overdueAmount: numeric('overdue_amount', { precision: 12, scale: 2 }).default('0'),
  averagePaymentDays: numeric('average_payment_days', { precision: 5, scale: 2 }),
  collectionRate: numeric('collection_rate', { precision: 5, scale: 2 }), // Percentage
  data: jsonb('data').notNull(), // Detailed analytics data
  createdAt: timestamp('created_at').defaultNow(),
});

// Invoice Currency Settings
export const invoiceCurrencySettings = pgTable('invoice_currency_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  currency: varchar('currency', { length: 3 }).notNull(),
  isDefault: boolean('is_default').default(false),
  vatRate: numeric('vat_rate', { precision: 5, scale: 2 }),
  exchangeRate: numeric('exchange_rate', { precision: 12, scale: 6 }),
  lastUpdated: timestamp('last_updated'),
  createdByUserId: uuid('created_by_user_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
