CREATE TABLE IF NOT EXISTS "email_delivery_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "provider_event_id" varchar(255) NOT NULL,
  "email_id" varchar(255) NOT NULL,
  "event_type" varchar(80) NOT NULL,
  "metadata" jsonb,
  "occurred_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_delivery_events_provider_event_unique" ON "email_delivery_events" USING btree ("provider_event_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_delivery_events_email_idx" ON "email_delivery_events" USING btree ("email_id", "occurred_at");
