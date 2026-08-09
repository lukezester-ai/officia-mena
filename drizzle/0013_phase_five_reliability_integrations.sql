ALTER TABLE maestro_ai_runs ADD COLUMN IF NOT EXISTS fallback_used varchar(100);
--> statement-breakpoint
ALTER TABLE maestro_ai_runs ADD COLUMN IF NOT EXISTS evaluation_score integer;
--> statement-breakpoint
ALTER TABLE maestro_ai_runs ADD COLUMN IF NOT EXISTS evaluation_flags jsonb;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS integration_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), provider varchar(30) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'not_configured', environment varchar(20) NOT NULL DEFAULT 'sandbox', config jsonb,
  last_checked_at timestamp, last_success_at timestamp, last_error text, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS integration_connections_tenant_provider_unique ON integration_connections (tenant_id, provider);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), provider varchar(30) NOT NULL,
  external_id varchar(255) NOT NULL, event_type varchar(100) NOT NULL, status varchar(20) NOT NULL, metadata jsonb, created_at timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS integration_events_provider_external_unique ON integration_events (provider, external_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS integration_events_tenant_created_idx ON integration_events (tenant_id, created_at);
--> statement-breakpoint
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON integration_connections USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON integration_events USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
