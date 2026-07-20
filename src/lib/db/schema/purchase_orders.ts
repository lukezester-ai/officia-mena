import { pgTable, uuid, varchar, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  
  poNumber: varchar('po_number', { length: 100 }).notNull(), // e.g. "PO-20231010-1234"
  supplierName: varchar('supplier_name', { length: 255 }).notNull(),
  
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  vatRate: numeric('vat_rate', { precision: 5, scale: 2 }).notNull().default('15.00'),
  vatAmount: numeric('vat_amount', { precision: 12, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  
  // Status: draft, sent, approved, received
  status: varchar('status', { length: 20 }).default('draft'),
  
  notes: text('notes'), // Will store stringified line items for simplicity
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
