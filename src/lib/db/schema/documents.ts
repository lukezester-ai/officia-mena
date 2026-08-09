import { index, integer, jsonb, pgTable, uuid, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
// Drizzle supports vector type for pgvector
import { vector } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const documentSources = pgTable('document_sources', {
  id: uuid('id').primaryKey().defaultRandom(), tenantId: uuid('tenant_id').references(() => tenants.id),
  docType: varchar('doc_type', { length: 50 }).notNull().default('user_document'), fileName: varchar('file_name', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(), checksum: varchar('checksum', { length: 64 }).notNull(), version: integer('version').notNull().default(1),
  status: varchar('status', { length: 20 }).notNull().default('active'), visibility: varchar('visibility', { length: 20 }).notNull().default('company'),
  allowedRoles: jsonb('allowed_roles'), pageCount: integer('page_count'), effectiveAt: timestamp('effective_at'), expiresAt: timestamp('expires_at'),
  supersedesId: uuid('supersedes_id'), uploadedByUserId: uuid('uploaded_by_user_id'), createdAt: timestamp('created_at').defaultNow().notNull(), updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [uniqueIndex('document_sources_tenant_checksum_unique').on(table.tenantId, table.checksum),
  index('document_sources_tenant_status_idx').on(table.tenantId, table.status, table.docType)]);

export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id), // Nullable for global docs
  docType: varchar('doc_type', { length: 50 }).notNull().default('user_document'), // 'user_document' | 'zatca_regulation'
  fileName: varchar('file_name', { length: 255 }).notNull(),
  documentId: uuid('document_id').references(() => documentSources.id),
  chunkIndex: integer('chunk_index'), pageNumber: integer('page_number'), sectionTitle: varchar('section_title', { length: 255 }),
  content: text('content').notNull(),
  // text-embedding-004 outputs 768 dimensions by default
  embedding: vector('embedding', { dimensions: 768 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const knowledgeRetrievalEvents = pgTable('knowledge_retrieval_events', {
  id: uuid('id').primaryKey().defaultRandom(), tenantId: uuid('tenant_id').references(() => tenants.id).notNull(), userId: uuid('user_id').notNull(),
  queryHash: varchar('query_hash', { length: 64 }).notNull(), scope: varchar('scope', { length: 30 }).notNull(), resultCount: integer('result_count').notNull(),
  topScore: integer('top_score'), latencyMs: integer('latency_ms').notNull(), citations: jsonb('citations'), createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [index('knowledge_retrieval_tenant_created_idx').on(table.tenantId, table.createdAt)]);
