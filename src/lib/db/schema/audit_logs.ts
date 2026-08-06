import { pgTable, uuid, varchar, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  userId: uuid('user_id'), // Can be null if system/webhook action
  entityType: varchar('entity_type', { length: 64 }).notNull(), // e.g., 'invoice', 'journal_entry'
  entityId: uuid('entity_id').notNull(),
  action: varchar('action', { length: 32 }).notNull(), // CREATE, UPDATE, DELETE, POST
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  ipAddress: varchar('ip_address', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('audit_logs_tenant_entity_idx').on(table.tenantId, table.entityType, table.entityId),
  index('audit_logs_tenant_created_idx').on(table.tenantId, table.createdAt),
]);
