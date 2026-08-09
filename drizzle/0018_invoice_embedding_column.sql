-- The invoices table predates the vector-backed search schema in some
-- environments, so CREATE TABLE IF NOT EXISTS in 0009 could not add this field.
CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS embedding vector(768);
