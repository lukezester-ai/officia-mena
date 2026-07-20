ALTER TABLE "products" ADD COLUMN "is_halal_certified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "halal_certificate_number" varchar(100);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "halal_expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "expiry_date_hijri" varchar(20);