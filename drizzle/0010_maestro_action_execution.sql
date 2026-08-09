ALTER TABLE ai_approvals ADD COLUMN IF NOT EXISTS idempotency_key varchar(255);
--> statement-breakpoint
ALTER TABLE ai_approvals ADD COLUMN IF NOT EXISTS requested_by_user_id uuid;
--> statement-breakpoint
ALTER TABLE ai_approvals ADD COLUMN IF NOT EXISTS execution_status varchar(20) NOT NULL DEFAULT 'not_started';
--> statement-breakpoint
ALTER TABLE ai_approvals ADD COLUMN IF NOT EXISTS executed_at timestamp;
--> statement-breakpoint
ALTER TABLE ai_approvals ADD COLUMN IF NOT EXISTS result_entity_type varchar(50);
--> statement-breakpoint
ALTER TABLE ai_approvals ADD COLUMN IF NOT EXISTS result_entity_id uuid;
--> statement-breakpoint
ALTER TABLE ai_approvals ADD COLUMN IF NOT EXISTS execution_error text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS ai_approvals_tenant_idempotency_unique ON ai_approvals (tenant_id, idempotency_key);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS ai_approvals_tenant_status_idx ON ai_approvals (tenant_id, status, created_at);
--> statement-breakpoint
ALTER TABLE ai_approvals ADD CONSTRAINT ai_approvals_action_check CHECK (action_type IN ('draft_invoice', 'draft_expense', 'draft_purchase_order')) NOT VALID;
--> statement-breakpoint
ALTER TABLE ai_approvals ADD CONSTRAINT ai_approvals_status_check CHECK (status IN ('pending', 'approved', 'rejected')) NOT VALID;
--> statement-breakpoint
ALTER TABLE ai_approvals ADD CONSTRAINT ai_approvals_execution_check CHECK (execution_status IN ('not_started', 'executing', 'completed', 'failed')) NOT VALID;
