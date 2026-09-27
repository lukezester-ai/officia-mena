-- Extended AI Features SQL Setup
-- This file contains the SQL schema for the new AI features

-- AI Analytics and Metrics
CREATE TABLE IF NOT EXISTS ai_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  total_runs INTEGER DEFAULT 0,
  successful_runs INTEGER DEFAULT 0,
  failed_runs INTEGER DEFAULT 0,
  average_latency NUMERIC(10,2),
  total_tokens INTEGER DEFAULT 0,
  average_tokens_per_run NUMERIC(10,2),
  tool_call_count INTEGER DEFAULT 0,
  approval_rate NUMERIC(5,2),
  evaluation_score NUMERIC(5,2),
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Document Processing Queue
CREATE TABLE IF NOT EXISTS document_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  document_id UUID NOT NULL,
  document_type VARCHAR(50) NOT NULL, -- 'invoice', 'expense', 'contract', etc.
  processing_type VARCHAR(50) NOT NULL, -- 'ocr', 'extraction', 'classification', 'validation'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  priority INTEGER DEFAULT 5, -- 1-10, higher is more important
  ocr_engine VARCHAR(50),
  confidence NUMERIC(5,2),
  extracted_data JSONB,
  validation_result JSONB,
  error_message TEXT,
  processing_started_at TIMESTAMP,
  processing_completed_at TIMESTAMP,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge Base Articles
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags JSONB, -- Array of tag strings
  embedding JSONB, -- Vector embedding for semantic search
  source VARCHAR(100), -- 'manual', 'ai_generated', 'imported'
  source_url VARCHAR(500),
  language VARCHAR(10) DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,
  created_by_user_id UUID,
  updated_by_user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge Search Logs
CREATE TABLE IF NOT EXISTS knowledge_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  search_type VARCHAR(20) NOT NULL, -- 'semantic', 'keyword', 'hybrid'
  results_count INTEGER DEFAULT 0,
  selected_article_id UUID,
  confidence NUMERIC(5,2),
  latency_ms INTEGER,
  feedback VARCHAR(20), -- 'helpful', 'not_helpful', 'neutral'
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Safety Events
CREATE TABLE IF NOT EXISTS ai_safety_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  event_type VARCHAR(50) NOT NULL, -- 'policy_violation', 'content_filter', 'rate_limit', 'error'
  severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  description TEXT NOT NULL,
  ai_run_id UUID,
  user_id UUID,
  payload JSONB,
  action_taken VARCHAR(50), -- 'blocked', 'modified', 'allowed', 'flagged'
  resolved_at TIMESTAMP,
  resolved_by_user_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Training Data
CREATE TABLE IF NOT EXISTS ai_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  data_type VARCHAR(50) NOT NULL, -- 'user_feedback', 'conversation_logs', 'document_extractions'
  version VARCHAR(20) NOT NULL,
  data JSONB NOT NULL,
  record_count INTEGER DEFAULT 0,
  processed_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Model Performance
CREATE TABLE IF NOT EXISTS ai_model_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  model_name VARCHAR(100) NOT NULL,
  model_version VARCHAR(20) NOT NULL,
  specialist VARCHAR(30) NOT NULL,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  average_latency NUMERIC(10,2),
  average_tokens NUMERIC(10,2),
  average_evaluation_score NUMERIC(5,2),
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Feature Flags
CREATE TABLE IF NOT EXISTS ai_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  feature_name VARCHAR(100) NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  description TEXT,
  rollout_percentage INTEGER DEFAULT 0, -- 0-100 for gradual rollout
  allowed_user_ids JSONB, -- Array of user IDs for targeted rollout
  configuration JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_analytics_tenant ON ai_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_period ON ai_analytics(tenant_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS doc_processing_queue_tenant ON document_processing_queue(tenant_id);
CREATE INDEX IF NOT EXISTS doc_processing_queue_status ON document_processing_queue(tenant_id, status);
CREATE INDEX IF NOT EXISTS doc_processing_queue_priority ON document_processing_queue(tenant_id, priority, created_at);
CREATE INDEX IF NOT EXISTS knowledge_articles_tenant ON knowledge_articles(tenant_id);
CREATE INDEX IF NOT EXISTS knowledge_articles_category ON knowledge_articles(tenant_id, category);
CREATE INDEX IF NOT EXISTS knowledge_articles_active ON knowledge_articles(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS knowledge_search_logs_tenant ON knowledge_search_logs(tenant_id);
CREATE INDEX IF NOT EXISTS knowledge_search_logs_user ON knowledge_search_logs(user_id);
CREATE INDEX IF NOT EXISTS ai_safety_events_tenant ON ai_safety_events(tenant_id);
CREATE INDEX IF NOT EXISTS ai_safety_events_severity ON ai_safety_events(tenant_id, severity);
CREATE INDEX IF NOT EXISTS ai_safety_events_resolved ON ai_safety_events(tenant_id, resolved_at);
CREATE INDEX IF NOT EXISTS ai_model_performance_tenant ON ai_model_performance(tenant_id);
CREATE INDEX IF NOT EXISTS ai_model_performance_model ON ai_model_performance(tenant_id, model_name, model_version);
CREATE INDEX IF NOT EXISTS ai_model_performance_specialist ON ai_model_performance(tenant_id, specialist);
CREATE INDEX IF NOT EXISTS ai_feature_flags_tenant ON ai_feature_flags(tenant_id);
CREATE INDEX IF NOT EXISTS ai_feature_flags_name ON ai_feature_flags(tenant_id, feature_name);
