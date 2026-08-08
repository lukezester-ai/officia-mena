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
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'accounts', 'journal_entries', 'journal_lines', 'ai_approvals',
    'ai_inbox_items', 'approvals', 'audit_logs', 'bank_accounts',
    'bank_transactions', 'clients', 'expenses', 'employees',
    'employee_documents', 'payroll_runs', 'installments', 'warehouses',
    'products', 'inventory_levels', 'stock_movements', 'invoices',
    'purchase_orders', 'quotations', 'roles', 'subscriptions', 'users'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (tenant_id = nullif(current_setting(''app.tenant_id'', true), '''')::uuid) WITH CHECK (tenant_id = nullif(current_setting(''app.tenant_id'', true), '''')::uuid)',
      table_name
    );
  END LOOP;
END $$;
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
