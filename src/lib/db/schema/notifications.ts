import { pgTable, uuid, text, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull().default('info'), // info, success, warning, error
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  actionUrl: text('action_url'),
  actionLabel: text('action_label'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
