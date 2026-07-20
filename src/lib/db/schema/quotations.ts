import { pgTable, uuid, varchar, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const quotations = pgTable('quotations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  quotationNumber: varchar('quotation_number', { length: 50 }).notNull(),
  
  // Client Info
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientTrn: varchar('client_trn', { length: 50 }), 
  
  // Amounts
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  vatRate: numeric('vat_rate', { precision: 5, scale: 2 }).default('15.00'), 
  vatAmount: numeric('vat_amount', { precision: 12, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  
  // Items as a string for now (AI generated text)
  notes: text('notes'),
  
  // Status: draft, sent, accepted, rejected, converted
  status: varchar('status', { length: 20 }).default('draft'),
  
  issueDate: timestamp('issue_date').defaultNow(),
  validUntil: timestamp('valid_until'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
