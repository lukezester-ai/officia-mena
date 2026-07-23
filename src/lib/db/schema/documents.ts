import { pgTable, uuid, text, timestamp, varchar } from 'drizzle-orm/pg-core';
// Drizzle supports vector type for pgvector
import { vector } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id), // Nullable for global docs
  docType: varchar('doc_type', { length: 50 }).notNull().default('user_document'), // 'user_document' | 'zatca_regulation'
  fileName: varchar('file_name', { length: 255 }).notNull(),
  content: text('content').notNull(),
  // text-embedding-004 outputs 768 dimensions by default
  embedding: vector('embedding', { dimensions: 768 }),
  createdAt: timestamp('created_at').defaultNow(),
});
