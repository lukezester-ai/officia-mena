import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  crn: varchar('crn', { length: 50 }).notNull(), // Company Registration Number
  trn: varchar('trn', { length: 50 }), // Tax Registration Number (VAT)
  country: varchar('country', { length: 2 }).default('SA'), // SA, AE, QA, etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
