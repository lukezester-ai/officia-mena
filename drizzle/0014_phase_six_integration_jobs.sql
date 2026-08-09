CREATE TABLE IF NOT EXISTS integration_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), job_type varchar(30) NOT NULL,
  payload jsonb NOT NULL, status varchar(20) NOT NULL DEFAULT 'pending', attempts integer NOT NULL DEFAULT 0, max_attempts integer NOT NULL DEFAULT 5,
  next_attempt_at timestamp NOT NULL DEFAULT now(), idempotency_key varchar(64) NOT NULL, external_id varchar(255), approved_by_user_id uuid NOT NULL,
  last_error text, created_at timestamp NOT NULL DEFAULT now(), started_at timestamp, completed_at timestamp, updated_at timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS integration_jobs_tenant_idempotency_unique ON integration_jobs (tenant_id, idempotency_key);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS integration_jobs_due_idx ON integration_jobs (status, next_attempt_at);
--> statement-breakpoint
ALTER TABLE integration_jobs ADD CONSTRAINT integration_jobs_status_check CHECK (status IN ('pending', 'processing', 'retry', 'completed', 'dead_letter')) NOT VALID;
--> statement-breakpoint
ALTER TABLE integration_jobs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON integration_jobs USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
--> statement-breakpoint
DROP INDEX IF EXISTS integration_events_provider_external_unique;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS integration_events_tenant_provider_external_unique ON integration_events (tenant_id, provider, external_id);
--> statement-breakpoint
ALTER TABLE ai_approvals DROP CONSTRAINT IF EXISTS ai_approvals_action_check;
--> statement-breakpoint
ALTER TABLE ai_approvals ADD CONSTRAINT ai_approvals_action_check CHECK (action_type IN ('draft_invoice', 'draft_expense', 'draft_purchase_order', 'send_email', 'submit_zatca')) NOT VALID;
