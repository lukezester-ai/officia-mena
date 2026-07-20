import { pgTable, uuid, varchar, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('SAR'),
  expenseDate: timestamp('expense_date'),
  category: varchar('category', { length: 50 }), // meals, travel, office, software
  receiptUrl: text('receipt_url'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, approved, rejected, reimbursed
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
