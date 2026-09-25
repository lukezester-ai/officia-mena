import { pgTable, uuid, varchar, text, boolean, timestamp, unique, primaryKey } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (t: any) => ({
  unq: unique().on(t.tenantId, t.name),
}));

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  resource: varchar('resource', { length: 50 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
}, (t: any) => ({
  unq: unique().on(t.resource, t.action),
}));

export const rolePermissions = pgTable('role_permissions', {
  roleId: uuid('role_id').references(() => roles.id).notNull(),
  permissionId: uuid('permission_id').references(() => permissions.id).notNull(),
}, (t: any) => ({
  pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));
