import { pgTable, uuid, varchar, text, timestamp, numeric, boolean } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  issueDate: timestamp('issue_date').notNull(),
  dueDate: timestamp('due_date'),
  
  // Client Info
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientCrn: varchar('client_crn', { length: 50 }),
  clientTrn: varchar('client_trn', { length: 50 }), // Tax Registration Number (MENA)
  clientAddress: text('client_address'),
  
  // Amounts
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  vatRate: numeric('vat_rate', { precision: 5, scale: 2 }).default('5.00'), // Typical VAT in UAE/KSA is 5% or 15%
  vatAmount: numeric('vat_amount', { precision: 12, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('SAR'), // SAR, AED, BHD etc.
  
  // ZATCA specific fields (e-invoicing Phase 2)
  zatcaHash: text('zatca_hash'), // Cryptographic hash of the invoice
  zatcaQrCode: text('zatca_qr_code'), // Base64 encoded TLV QR code for ZATCA
  isZatcaReported: boolean('is_zatca_reported').default(false),
  
  status: varchar('status', { length: 20 }).default('draft'), // draft, issued, paid, overdue, cancelled
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
