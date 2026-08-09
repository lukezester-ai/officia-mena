CREATE TABLE IF NOT EXISTS document_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid REFERENCES tenants(id), doc_type varchar(50) NOT NULL DEFAULT 'user_document',
  file_name varchar(255) NOT NULL, title varchar(255) NOT NULL, checksum varchar(64) NOT NULL, version integer NOT NULL DEFAULT 1,
  status varchar(20) NOT NULL DEFAULT 'active', visibility varchar(20) NOT NULL DEFAULT 'company', allowed_roles jsonb, page_count integer,
  effective_at timestamp, expires_at timestamp, supersedes_id uuid, uploaded_by_user_id uuid, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS document_sources_tenant_checksum_unique ON document_sources (tenant_id, checksum);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS document_sources_tenant_status_idx ON document_sources (tenant_id, status, doc_type);
--> statement-breakpoint
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS document_id uuid REFERENCES document_sources(id);
--> statement-breakpoint
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS chunk_index integer;
--> statement-breakpoint
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS page_number integer;
--> statement-breakpoint
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS section_title varchar(255);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS document_chunks_search_gin ON document_chunks USING gin (to_tsvector('simple', content));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS document_chunks_document_idx ON document_chunks (document_id, chunk_index);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS knowledge_retrieval_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), user_id uuid NOT NULL,
  query_hash varchar(64) NOT NULL, scope varchar(30) NOT NULL, result_count integer NOT NULL, top_score integer,
  latency_ms integer NOT NULL, citations jsonb, created_at timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS knowledge_retrieval_tenant_created_idx ON knowledge_retrieval_events (tenant_id, created_at);
--> statement-breakpoint
ALTER TABLE document_sources ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY document_source_read ON document_sources FOR SELECT USING (tenant_id IS NULL OR tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
--> statement-breakpoint
CREATE POLICY document_source_write ON document_sources FOR ALL USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE knowledge_retrieval_events ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON knowledge_retrieval_events USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
