ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "provider" varchar(50);
--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "external_account_id" varchar(255);
--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "last_synced_at" timestamp;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "bank_accounts_tenant_provider_external_unique" ON "bank_accounts" USING btree ("tenant_id", "provider", "external_account_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "banking_consents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "provider" varchar(50) NOT NULL,
  "external_consent_id" varchar(255) NOT NULL,
  "status" varchar(30) DEFAULT 'awaiting_authorization' NOT NULL,
  "scopes" jsonb NOT NULL,
  "expires_at" timestamp,
  "last_synced_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "banking_consents_tenant_provider_external_unique" ON "banking_consents" USING btree ("tenant_id", "provider", "external_consent_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "banking_consents_tenant_status_idx" ON "banking_consents" USING btree ("tenant_id", "status");
