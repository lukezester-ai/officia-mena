CREATE TABLE "ai_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"payload" jsonb NOT NULL,
	"confidence_score" numeric(5, 2),
	"ai_reasoning" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"human_reviewer_id" varchar(255),
	"reviewed_at" timestamp,
	"reviewer_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "zatca_previous_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "zatca_cryptographic_stamp" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "zatca_xml" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "zatca_status" varchar(20) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "ai_approvals" ADD CONSTRAINT "ai_approvals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;