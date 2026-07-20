ALTER TABLE "products" ADD COLUMN "is_petroleum" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "api_gravity" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_fertilizer" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "mewa_registration" varchar(100);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "security_clearance_expiry" timestamp;