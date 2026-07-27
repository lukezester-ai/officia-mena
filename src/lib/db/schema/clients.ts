import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  
  // Company Details
  companyName: varchar('company_name', { length: 255 }).notNull(),
  crn: varchar('crn', { length: 100 }), // Commercial Registration Number
  trn: varchar('trn', { length: 100 }), // Tax Registration Number (VAT)
  
  // Contact Person
  contactPerson: varchar('contact_person', { length: 255 }),
  
  // Contact Info
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
