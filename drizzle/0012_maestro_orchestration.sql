CREATE TABLE IF NOT EXISTS maestro_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), owner_user_id uuid,
  scope varchar(20) NOT NULL DEFAULT 'user', category varchar(50) NOT NULL DEFAULT 'preference', memory_key varchar(120) NOT NULL,
  value text NOT NULL, fingerprint varchar(64) NOT NULL, source varchar(30) NOT NULL DEFAULT 'explicit_user',
  status varchar(20) NOT NULL DEFAULT 'active', created_by_user_id uuid NOT NULL, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS maestro_memories_tenant_fingerprint_unique ON maestro_memories (tenant_id, fingerprint);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS maestro_memories_context_idx ON maestro_memories (tenant_id, owner_user_id, status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS maestro_ai_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), user_id uuid NOT NULL,
  specialist varchar(30) NOT NULL, intent varchar(50) NOT NULL, model varchar(100) NOT NULL, status varchar(20) NOT NULL DEFAULT 'running',
  input_hash varchar(64) NOT NULL, message_count integer NOT NULL, prompt_tokens integer, completion_tokens integer, total_tokens integer,
  latency_ms integer, tool_calls jsonb, error_code varchar(100), created_at timestamp NOT NULL DEFAULT now(), completed_at timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS maestro_ai_runs_tenant_created_idx ON maestro_ai_runs (tenant_id, created_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS maestro_ai_runs_tenant_status_idx ON maestro_ai_runs (tenant_id, status);
--> statement-breakpoint
ALTER TABLE maestro_memories ADD CONSTRAINT maestro_memories_scope_check CHECK (scope IN ('user', 'company')) NOT VALID;
--> statement-breakpoint
ALTER TABLE maestro_memories ADD CONSTRAINT maestro_memories_status_check CHECK (status IN ('active', 'deleted')) NOT VALID;
--> statement-breakpoint
ALTER TABLE maestro_ai_runs ADD CONSTRAINT maestro_ai_runs_status_check CHECK (status IN ('running', 'completed', 'failed')) NOT VALID;
--> statement-breakpoint
ALTER TABLE maestro_memories ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON maestro_memories USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE maestro_ai_runs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON maestro_ai_runs USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
