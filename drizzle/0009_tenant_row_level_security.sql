-- Bootstrap tables that existed in the Drizzle schema but were missing from the
-- historical SQL migration chain. Keep these definitions idempotent so both
-- fresh databases and already-provisioned environments can run this migration.
CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  stripe_customer_id varchar(255),
  stripe_subscription_id varchar(255),
  plan_id varchar(50) NOT NULL DEFAULT 'free',
  status varchar(50) NOT NULL DEFAULT 'active',
  current_period_end timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  doc_type varchar(50) NOT NULL DEFAULT 'user_document',
  file_name varchar(255) NOT NULL,
  content text NOT NULL,
  embedding vector(768),
  created_at timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(20) NOT NULL DEFAULT 'member';
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (lower(email));
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS invoices_tenant_number_unique ON invoices (tenant_id, invoice_number);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_tenant_unique ON subscriptions (tenant_id);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_customer_unique ON subscriptions (stripe_customer_id);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_id_unique ON subscriptions (stripe_subscription_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS stripe_events (
  event_id varchar(255) PRIMARY KEY,
  event_type varchar(100) NOT NULL,
  processed_at timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'finance', 'manager', 'member')) NOT VALID;
--> statement-breakpoint
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('draft', 'issued', 'paid', 'overdue', 'cancelled')) NOT VALID;
--> statement-breakpoint
ALTER TABLE invoices ADD CONSTRAINT invoices_zatca_status_check CHECK (zatca_status IN ('pending', 'cleared', 'reported', 'rejected')) NOT VALID;
--> statement-breakpoint
ALTER TABLE invoices ADD CONSTRAINT invoices_amounts_check CHECK (subtotal >= 0 AND vat_amount >= 0 AND total_amount >= 0 AND vat_rate BETWEEN 0 AND 100) NOT VALID;
--> statement-breakpoint
ALTER TABLE expenses ADD CONSTRAINT expenses_amount_check CHECK (amount > 0) NOT VALID;
--> statement-breakpoint
ALTER TABLE expenses ADD CONSTRAINT expenses_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed', 'reconciled')) NOT VALID;
--> statement-breakpoint
-- Defense-in-depth tenant isolation. The application DB role must set
-- `SET LOCAL app.tenant_id = '<uuid>'` inside each tenant transaction.
-- These statements are intentionally explicit so migration runners can parse,
-- audit and report each protected table without dynamic SQL.
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON accounts USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON journal_entries USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON journal_lines USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE ai_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ai_approvals USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE ai_inbox_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ai_inbox_items USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON approvals USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON audit_logs USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON bank_accounts USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON bank_transactions USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON clients USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON expenses USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON employees USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON employee_documents USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON payroll_runs USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON installments USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON warehouses USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON products USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON inventory_levels USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON stock_movements USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON invoices USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON purchase_orders USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON quotations USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON roles USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON subscriptions USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON users USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY document_tenant_read ON document_chunks
  FOR SELECT USING (
    tenant_id IS NULL OR tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid
  );
--> statement-breakpoint
CREATE POLICY document_tenant_write ON document_chunks
  FOR ALL USING (
    tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid
  ) WITH CHECK (
    tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid
  );
