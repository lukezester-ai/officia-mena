import { pgTable, uuid, numeric, timestamp, varchar } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { invoices } from './invoices';

export const installments = pgTable('installments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  invoiceId: uuid('invoice_id').references(() => invoices.id).notNull(),
  
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  
  status: varchar('status', { length: 20 }).default('pending'), // pending, paid, overdue
  
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
