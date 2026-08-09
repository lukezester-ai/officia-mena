ALTER TABLE ai_inbox_items ADD COLUMN IF NOT EXISTS fingerprint varchar(255);
--> statement-breakpoint
ALTER TABLE ai_inbox_items ADD COLUMN IF NOT EXISTS detected_at timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE ai_inbox_items ADD COLUMN IF NOT EXISTS snoozed_until timestamp;
--> statement-breakpoint
ALTER TABLE ai_inbox_items ADD COLUMN IF NOT EXISTS resolved_at timestamp;
--> statement-breakpoint
ALTER TABLE ai_inbox_items ADD COLUMN IF NOT EXISTS resolved_by_user_id uuid;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS ai_inbox_tenant_fingerprint_unique ON ai_inbox_items (tenant_id, fingerprint);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS ai_inbox_tenant_status_priority_idx ON ai_inbox_items (tenant_id, status, priority);
--> statement-breakpoint
ALTER TABLE ai_inbox_items ADD CONSTRAINT ai_inbox_status_check CHECK (status IN ('open', 'resolved', 'snoozed')) NOT VALID;
--> statement-breakpoint
ALTER TABLE ai_inbox_items ADD CONSTRAINT ai_inbox_priority_check CHECK (priority IN ('low', 'medium', 'high', 'critical')) NOT VALID;
