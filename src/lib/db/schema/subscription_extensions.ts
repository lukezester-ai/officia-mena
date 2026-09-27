import { pgTable, uuid, varchar, text, timestamp, numeric, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { subscriptions } from './subscriptions';

// Subscription Plans
export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  interval: varchar('interval', { length: 20 }).notNull(), // 'month', 'year'
  intervalCount: integer('interval_count').default(1),
  trialPeriodDays: integer('trial_period_days').default(0),
  features: jsonb('features'), // Array of feature strings
  limits: jsonb('limits'), // Usage limits per feature
  isActive: boolean('is_active').default(true),
  isPublic: boolean('is_public').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Subscription Add-ons
export const subscriptionAddOns = pgTable('subscription_add_ons', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  interval: varchar('interval', { length: 20 }).notNull(), // 'month', 'year'
  features: jsonb('features'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Subscription Add-on Enrollments
export const subscriptionAddOnEnrollments = pgTable('subscription_add_on_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id),
  addOnId: uuid('add_on_id').notNull().references(() => subscriptionAddOns.id),
  stripeSubscriptionItemId: varchar('stripe_subscription_item_id', { length: 255 }),
  isActive: boolean('is_active').default(true),
  enrolledAt: timestamp('enrolled_at').defaultNow(),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Usage Metrics
export const subscriptionUsage = pgTable('subscription_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id),
  metricName: varchar('metric_name', { length: 100 }).notNull(), // 'api_calls', 'storage_gb', 'users', 'invoices'
  metricValue: numeric('metric_value', { precision: 15, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 20 }).notNull(), // 'count', 'gb', 'hours'
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Payment Methods
export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: uuid('user_id').notNull(),
  stripePaymentMethodId: varchar('stripe_payment_method_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'card', 'bank_account'
  last4: varchar('last4', { length: 4 }),
  brand: varchar('brand', { length: 20 }),
  expiryMonth: integer('expiry_month'),
  expiryYear: integer('expiry_year'),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Subscription Invoices
export const subscriptionInvoices = pgTable('subscription_invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id),
  stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }),
  stripeInvoiceNumber: varchar('stripe_invoice_number', { length: 255 }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  status: varchar('status', { length: 20 }).notNull(), // 'draft', 'open', 'paid', 'void', 'uncollectible'
  dueDate: timestamp('due_date'),
  paidAt: timestamp('paid_at'),
  description: text('description'),
  pdfUrl: varchar('pdf_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Subscription Payments
export const subscriptionPayments = pgTable('subscription_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id),
  invoiceId: uuid('invoice_id').references(() => subscriptionInvoices.id),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  stripePaymentId: varchar('stripe_payment_id', { length: 255 }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  status: varchar('status', { length: 20 }).notNull(), // 'pending', 'succeeded', 'failed', 'refunded'
  paymentMethodId: uuid('payment_method_id').references(() => paymentMethods.id),
  failureReason: text('failure_reason'),
  refundedAmount: numeric('refunded_amount', { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Subscription Events
export const subscriptionEvents = pgTable('subscription_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id),
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'created', 'updated', 'cancelled', 'payment_failed', 'payment_succeeded'
  eventData: jsonb('event_data').notNull(),
  stripeEventId: varchar('stripe_event_id', { length: 255 }),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Discount Codes
export const discountCodes = pgTable('discount_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),
  discountType: varchar('discount_type', { length: 20 }).notNull(), // 'percentage', 'fixed_amount'
  discountValue: numeric('discount_value', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  appliesTo: jsonb('applies_to'), // Array of plan IDs or 'all'
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0),
  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Discount Redemptions
export const discountRedemptions = pgTable('discount_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  discountCodeId: uuid('discount_code_id').notNull().references(() => discountCodes.id),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Subscription Analytics
export const subscriptionAnalytics = pgTable('subscription_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  periodType: varchar('period_type', { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly', 'quarterly', 'annual'
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  totalSubscriptions: integer('total_subscriptions').default(0),
  activeSubscriptions: integer('active_subscriptions').default(0),
  cancelledSubscriptions: integer('cancelled_subscriptions').default(0),
  totalRevenue: numeric('total_revenue', { precision: 15, scale: 2 }).default('0'),
  mrr: numeric('mrr', { precision: 15, scale: 2 }).default('0'), // Monthly Recurring Revenue
  arr: numeric('arr', { precision: 15, 2 }).default('0), // Annual Recurring Revenue
  churnRate: numeric('churn_rate', { precision: 5, scale: 2 }),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
