import { pgTable, uuid, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  planId: varchar('plan_id', { length: 50 }).notNull().default('free'), // free, pro, enterprise
  status: varchar('status', { length: 50 }).notNull().default('active'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  uniqueIndex('subscriptions_tenant_unique').on(table.tenantId),
  uniqueIndex('subscriptions_customer_unique').on(table.stripeCustomerId),
  uniqueIndex('subscriptions_stripe_id_unique').on(table.stripeSubscriptionId),
]);
