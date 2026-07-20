import { pgTable, uuid, varchar, text, timestamp, jsonb, numeric } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const aiInboxItems = pgTable('ai_inbox_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // anomaly, fraud_alert, vat_warning, missing_data
  sourceType: varchar('source_type', { length: 50 }), // invoice, expense, bank_transaction
  sourceId: varchar('source_id', { length: 255 }), // external reference ID
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  confidence: numeric('confidence', { precision: 3, scale: 2 }), // 0.00 to 1.00
  priority: varchar('priority', { length: 20 }).default('medium'), // low, medium, high, critical
  metaJson: jsonb('meta_json'), // additional structured data
  status: varchar('status', { length: 20 }).default('open'), // open, resolved, snoozed
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
