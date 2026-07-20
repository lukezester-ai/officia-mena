import { pgTable, uuid, varchar, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const approvals = pgTable('approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  
  type: varchar('type', { length: 50 }).notNull(), // 'purchase_order', 'invoice', 'quotation', 'expense'
  referenceId: varchar('reference_id', { length: 100 }), // The UUID of the actual document
  referenceNumber: varchar('reference_number', { length: 100 }).notNull(), // e.g. "INV-20231010-1234"
  referenceAmount: numeric('reference_amount', { precision: 12, scale: 2 }).notNull(),
  
  description: text('description').notNull(),
  
  // Status: pending, approved, rejected
  status: varchar('status', { length: 20 }).default('pending'),
  
  requestedBy: varchar('requested_by', { length: 100 }).notNull(),
  approvedBy: varchar('approved_by', { length: 100 }),
  
  notes: text('notes'), // Optional rejection reason or approval comment
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
