import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const maestroMemories = pgTable('maestro_memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  ownerUserId: uuid('owner_user_id'),
  scope: varchar('scope', { length: 20 }).notNull().default('user'),
  category: varchar('category', { length: 50 }).notNull().default('preference'),
  memoryKey: varchar('memory_key', { length: 120 }).notNull(),
  value: text('value').notNull(),
  fingerprint: varchar('fingerprint', { length: 64 }).notNull(),
  source: varchar('source', { length: 30 }).notNull().default('explicit_user'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdByUserId: uuid('created_by_user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('maestro_memories_tenant_fingerprint_unique').on(table.tenantId, table.fingerprint),
  index('maestro_memories_context_idx').on(table.tenantId, table.ownerUserId, table.status),
]);

export const maestroAiRuns = pgTable('maestro_ai_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  userId: uuid('user_id').notNull(),
  specialist: varchar('specialist', { length: 30 }).notNull(),
  intent: varchar('intent', { length: 50 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('running'),
  inputHash: varchar('input_hash', { length: 64 }).notNull(),
  messageCount: integer('message_count').notNull(),
  promptTokens: integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  totalTokens: integer('total_tokens'),
  latencyMs: integer('latency_ms'),
  toolCalls: jsonb('tool_calls'),
  errorCode: varchar('error_code', { length: 100 }),
  fallbackUsed: varchar('fallback_used', { length: 100 }),
  evaluationScore: integer('evaluation_score'),
  evaluationFlags: jsonb('evaluation_flags'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => [
  index('maestro_ai_runs_tenant_created_idx').on(table.tenantId, table.createdAt),
  index('maestro_ai_runs_tenant_status_idx').on(table.tenantId, table.status),
]);

export const integrationConnections = pgTable('integration_connections', {
  id: uuid('id').primaryKey().defaultRandom(), tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  provider: varchar('provider', { length: 30 }).notNull(), status: varchar('status', { length: 20 }).notNull().default('not_configured'),
  environment: varchar('environment', { length: 20 }).notNull().default('sandbox'), config: jsonb('config'),
  lastCheckedAt: timestamp('last_checked_at'), lastSuccessAt: timestamp('last_success_at'), lastError: text('last_error'),
  createdAt: timestamp('created_at').defaultNow().notNull(), updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [uniqueIndex('integration_connections_tenant_provider_unique').on(table.tenantId, table.provider)]);

export const integrationEvents = pgTable('integration_events', {
  id: uuid('id').primaryKey().defaultRandom(), tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  provider: varchar('provider', { length: 30 }).notNull(), externalId: varchar('external_id', { length: 255 }).notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(), status: varchar('status', { length: 20 }).notNull(),
  metadata: jsonb('metadata'), createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [uniqueIndex('integration_events_tenant_provider_external_unique').on(table.tenantId, table.provider, table.externalId),
  index('integration_events_tenant_created_idx').on(table.tenantId, table.createdAt)]);

export const integrationJobs = pgTable('integration_jobs', {
  id: uuid('id').primaryKey().defaultRandom(), tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  jobType: varchar('job_type', { length: 30 }).notNull(), payload: jsonb('payload').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(5), nextAttemptAt: timestamp('next_attempt_at').defaultNow().notNull(),
  idempotencyKey: varchar('idempotency_key', { length: 64 }).notNull(), externalId: varchar('external_id', { length: 255 }),
  approvedByUserId: uuid('approved_by_user_id').notNull(), lastError: text('last_error'),
  createdAt: timestamp('created_at').defaultNow().notNull(), startedAt: timestamp('started_at'), completedAt: timestamp('completed_at'), updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [uniqueIndex('integration_jobs_tenant_idempotency_unique').on(table.tenantId, table.idempotencyKey),
  index('integration_jobs_due_idx').on(table.status, table.nextAttemptAt)]);
