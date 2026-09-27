import { pgTable, uuid, varchar, text, timestamp, numeric, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

// AI Analytics and Metrics
export const aiAnalytics = pgTable('ai_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  periodType: varchar('period_type', { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly'
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  totalRuns: integer('total_runs').default(0),
  successfulRuns: integer('successful_runs').default(0),
  failedRuns: integer('failed_runs').default(0),
  averageLatency: numeric('average_latency', { precision: 10, scale: 2 }),
  totalTokens: integer('total_tokens').default(0),
  averageTokensPerRun: numeric('average_tokens_per_run', { precision: 10, scale: 2 }),
  toolCallCount: integer('tool_call_count').default(0),
  approvalRate: numeric('approval_rate', { precision: 5, scale: 2 }),
  evaluationScore: numeric('evaluation_score', { precision: 5, scale: 2 }),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Document Processing Queue
export const documentProcessingQueue = pgTable('document_processing_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  documentId: uuid('document_id').notNull(),
  documentType: varchar('document_type', { length: 50 }).notNull(), // 'invoice', 'expense', 'contract', etc.
  processingType: varchar('processing_type', { length: 50 }).notNull(), // 'ocr', 'extraction', 'classification', 'validation'
  status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'processing', 'completed', 'failed'
  priority: integer('priority').default(5), // 1-10, higher is more important
  ocrEngine: varchar('ocr_engine', { length: 50 }),
  confidence: numeric('confidence', { precision: 5, scale: 2 }),
  extractedData: jsonb('extracted_data'),
  validationResult: jsonb('validation_result'),
  errorMessage: text('error_message'),
  processingStartedAt: timestamp('processing_started_at'),
  processingCompletedAt: timestamp('processing_completed_at'),
  retryCount: integer('retry_count').default(0),
  maxRetries: integer('max_retries').default(3),
  nextRetryAt: timestamp('next_retry_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Knowledge Base Articles
export const knowledgeArticles = pgTable('knowledge_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  tags: jsonb('tags'), // Array of tag strings
  embedding: jsonb('embedding'), // Vector embedding for semantic search
  source: varchar('source', { length: 100 }), // 'manual', 'ai_generated', 'imported'
  sourceUrl: varchar('source_url', { length: 500 }),
  language: varchar('language', { length: 10 }).default('en'),
  isActive: boolean('is_active').default(true),
  viewCount: integer('view_count').default(0),
  lastViewedAt: timestamp('last_viewed_at'),
  createdByUserId: uuid('created_by_user_id'),
  updatedByUserId: uuid('updated_by_user_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Knowledge Search Logs
export const knowledgeSearchLogs = pgTable('knowledge_search_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: uuid('user_id').notNull(),
  query: text('query').notNull(),
  searchType: varchar('search_type', { length: 20 }).notNull(), // 'semantic', 'keyword', 'hybrid'
  resultsCount: integer('results_count').default(0),
  selectedArticleId: uuid('selected_article_id'),
  confidence: numeric('confidence', { precision: 5, scale: 2 }),
  latencyMs: integer('latency_ms'),
  feedback: varchar('feedback', { length: 20 }), // 'helpful', 'not_helpful', 'neutral'
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// AI Safety Events
export const aiSafetyEvents = pgTable('ai_safety_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'policy_violation', 'content_filter', 'rate_limit', 'error'
  severity: varchar('severity', { length: 20 }).notNull(), // 'low', 'medium', 'high', 'critical'
  description: text('description').notNull(),
  aiRunId: uuid('ai_run_id'),
  userId: uuid('user_id'),
  payload: jsonb('payload'),
  actionTaken: varchar('action_taken', { length: 50 }), // 'blocked', 'modified', 'allowed', 'flagged'
  resolvedAt: timestamp('resolved_at'),
  resolvedByUserId: uuid('resolved_by_user_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// AI Training Data
export const aiTrainingData = pgTable('ai_training_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  dataType: varchar('data_type', { length: 50 }).notNull(), // 'user_feedback', 'conversation_logs', 'document_extractions'
  version: varchar('version', { length: 20 }).notNull(),
  data: jsonb('data').notNull(),
  recordCount: integer('record_count').default(0),
  processedAt: timestamp('processed_at'),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// AI Model Performance
export const aiModelPerformance = pgTable('ai_model_performance', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  modelName: varchar('model_name', { length: 100 }).notNull(),
  modelVersion: varchar('model_version', { length: 20 }).notNull(),
  specialist: varchar('specialist', { length: 30 }).notNull(),
  totalRequests: integer('total_requests').default(0),
  successfulRequests: integer('successful_requests').default(0),
  failedRequests: integer('failed_requests').default(0),
  averageLatency: numeric('average_latency', { precision: 10, scale: 2 }),
  averageTokens: numeric('average_tokens', { precision: 10, scale: 2 }),
  averageEvaluationScore: numeric('average_evaluation_score', { precision: 5, scale: 2 }),
  lastUsedAt: timestamp('last_used_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// AI Feature Flags
export const aiFeatureFlags = pgTable('ai_feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  featureName: varchar('feature_name', { length: 100 }).notNull().unique(),
  isEnabled: boolean('is_enabled').default(false),
  description: text('description'),
  rolloutPercentage: integer('rollout_percentage').default(0), // 0-100 for gradual rollout
  allowedUserIds: jsonb('allowed_user_ids'), // Array of user IDs for targeted rollout
  configuration: jsonb('configuration'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
