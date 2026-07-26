CREATE TABLE "ai_inbox_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"source_type" varchar(50),
	"source_id" varchar(255),
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"confidence" numeric(3, 2),
	"priority" varchar(20) DEFAULT 'medium',
	"meta_json" jsonb,
	"status" varchar(20) DEFAULT 'open',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'SAR',
	"expense_date" timestamp,
	"category" varchar(50),
	"receipt_url" text,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"issue_date" timestamp NOT NULL,
	"due_date" timestamp,
	"client_name" varchar(255) NOT NULL,
	"client_crn" varchar(50),
	"client_trn" varchar(50),
	"client_address" text,
	"subtotal" numeric(12, 2) NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '5.00',
	"vat_amount" numeric(12, 2) NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'SAR',
	"zatca_hash" text,
	"zatca_qr_code" text,
	"is_zatca_reported" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'draft',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	CONSTRAINT "permissions_resource_action_unique" UNIQUE("resource","action")
);

CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);

CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"name" varchar(50) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_tenant_id_name_unique" UNIQUE("tenant_id","name")
);

CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"crn" varchar(50) NOT NULL,
	"trn" varchar(50),
	"country" varchar(2) DEFAULT 'SA',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" uuid UNIQUE,
	"clerk_id" varchar(255) UNIQUE,
	"tenant_id" uuid,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"created_at" timestamp DEFAULT now()
);

ALTER TABLE "ai_inbox_items" ADD CONSTRAINT "ai_inbox_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;

CREATE TABLE "inventory_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now()
);

CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sku" varchar(100) NOT NULL,
	"barcode" varchar(100),
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"unit_price" numeric(12, 2) NOT NULL,
	"cost_price" numeric(12, 2),
	"min_stock_level" integer DEFAULT 5,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"quantity" integer NOT NULL,
	"reference_id" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "warehouses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" text,
	"manager_name" varchar(255),
	"created_at" timestamp DEFAULT now()
);

ALTER TABLE "inventory_levels" ADD CONSTRAINT "inventory_levels_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "inventory_levels" ADD CONSTRAINT "inventory_levels_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "inventory_levels" ADD CONSTRAINT "inventory_levels_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "products" ADD COLUMN "is_halal_certified" boolean DEFAULT false;
ALTER TABLE "products" ADD COLUMN "halal_certificate_number" varchar(100);
ALTER TABLE "products" ADD COLUMN "halal_expiry_date" timestamp;
ALTER TABLE "products" ADD COLUMN "expiry_date_hijri" varchar(20);

CREATE TABLE "employee_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"document_number" varchar(100),
	"expiry_date" date NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" varchar(50) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"nationality" varchar(100),
	"national_id_number" varchar(50),
	"basic_salary" numeric(12, 2) NOT NULL,
	"housing_allowance" numeric(12, 2) DEFAULT '0',
	"transport_allowance" numeric(12, 2) DEFAULT '0',
	"bank_iban" varchar(50),
	"join_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "payroll_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"period_month" numeric NOT NULL,
	"period_year" numeric NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"wps_status" varchar(50) DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now()
);

ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "employees" ADD CONSTRAINT "employees_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "products" ADD COLUMN "is_petroleum" boolean DEFAULT false;
ALTER TABLE "products" ADD COLUMN "api_gravity" numeric(5, 2);
ALTER TABLE "products" ADD COLUMN "is_fertilizer" boolean DEFAULT false;
ALTER TABLE "products" ADD COLUMN "mewa_registration" varchar(100);
ALTER TABLE "products" ADD COLUMN "security_clearance_expiry" timestamp;

CREATE TABLE "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"reference_id" varchar(100),
	"reference_number" varchar(100) NOT NULL,
	"reference_amount" numeric(12, 2) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"requested_by" varchar(100) NOT NULL,
	"approved_by" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bank_name" varchar(100) NOT NULL,
	"account_name" varchar(100) NOT NULL,
	"iban" varchar(50) NOT NULL,
	"currency" varchar(3) DEFAULT 'SAR',
	"current_balance" numeric(15, 2) DEFAULT '0',
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "bank_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"type" varchar(10) NOT NULL,
	"reference" varchar(100),
	"status" varchar(20) DEFAULT 'pending',
	"reconciled_expense_id" uuid,
	"reconciled_invoice_id" uuid,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "installments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"po_number" varchar(100) NOT NULL,
	"supplier_name" varchar(255) NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"vat_amount" numeric(12, 2) NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'draft',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "quotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"quotation_number" varchar(50) NOT NULL,
	"client_name" varchar(255) NOT NULL,
	"client_trn" varchar(50),
	"subtotal" numeric(12, 2) NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '15.00',
	"vat_amount" numeric(12, 2) NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"notes" text,
	"status" varchar(20) DEFAULT 'draft',
	"issue_date" timestamp DEFAULT now(),
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

ALTER TABLE "approvals" ADD CONSTRAINT "approvals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_account_id_bank_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "installments" ADD CONSTRAINT "installments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "installments" ADD CONSTRAINT "installments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;


/* Create a trigger */
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id uuid;
BEGIN
  /* 1. Create a new tenant (company) for this user */
  new_tenant_id := gen_random_uuid();
  INSERT INTO public.tenants (id, name, country, created_at, updated_at)
  VALUES (new_tenant_id, 'My Company', 'SA', now(), now());

  /* 2. Create the user profile and link it to the tenant */
  INSERT INTO public.users (id, auth_id, tenant_id, email, created_at)
  VALUES (gen_random_uuid(), NEW.id, new_tenant_id, NEW.email, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* Drop trigger */
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

/* Create trigger */
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- SUBSCRIPTIONS TABLE
-- ==========================================

CREATE TABLE "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES tenants(id),
  "stripe_customer_id" varchar(255),
  "stripe_subscription_id" varchar(255),
  "plan_id" varchar(50) DEFAULT 'free' NOT NULL,
  "status" varchar(50) DEFAULT 'active' NOT NULL,
  "current_period_end" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- ==========================================
-- INDEXES for multi-tenant performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_ai_inbox_items_tenant_id ON ai_inbox_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expenses_tenant_id ON expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status ON invoices(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_levels_tenant_id ON inventory_levels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_id ON stock_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_tenant_id ON warehouses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_tenant_id ON employee_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_tenant_id ON payroll_runs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_approvals_tenant_id ON approvals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_tenant_id ON bank_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_tenant_id ON bank_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_tenant_status ON bank_transactions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_installments_tenant_id ON installments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_id ON purchase_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quotations_tenant_id ON quotations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);

-- ==========================================
-- ACCOUNTING TABLES (accounts, journal_entries, journal_lines)
-- ==========================================

CREATE TABLE "accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES tenants(id),
  "code" varchar(32) NOT NULL,
  "name" varchar(255) NOT NULL,
  "type" varchar(24) NOT NULL,
  "normal_balance" varchar(6) NOT NULL,
  "parent_account_id" uuid,
  "currency" varchar(3) DEFAULT 'SAR',
  "description" text,
  "is_system" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS accounts_tenant_code_unique ON accounts(tenant_id, code);
CREATE INDEX IF NOT EXISTS accounts_tenant_type_idx ON accounts(tenant_id, type);

CREATE TABLE "journal_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES tenants(id),
  "entry_number" varchar(64) NOT NULL,
  "entry_date" timestamp NOT NULL,
  "memo" text,
  "source_type" varchar(64),
  "source_id" uuid,
  "status" varchar(20) DEFAULT 'posted' NOT NULL,
  "currency" varchar(3) DEFAULT 'SAR',
  "total_debit" numeric(15, 2) NOT NULL,
  "total_credit" numeric(15, 2) NOT NULL,
  "posted_at" timestamp,
  "created_by" varchar(255),
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS journal_entries_tenant_number_unique ON journal_entries(tenant_id, entry_number);
CREATE INDEX IF NOT EXISTS journal_entries_tenant_date_idx ON journal_entries(tenant_id, entry_date);
CREATE INDEX IF NOT EXISTS journal_entries_source_idx ON journal_entries(tenant_id, source_type, source_id);

CREATE TABLE "journal_lines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "journal_entry_id" uuid NOT NULL REFERENCES journal_entries(id),
  "account_id" uuid NOT NULL REFERENCES accounts(id),
  "line_number" integer NOT NULL,
  "description" text,
  "debit" numeric(15, 2) DEFAULT '0' NOT NULL,
  "credit" numeric(15, 2) DEFAULT '0' NOT NULL,
  "currency" varchar(3) DEFAULT 'SAR',
  "entity_type" varchar(64),
  "entity_id" uuid,
  "created_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS journal_lines_entry_idx ON journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS journal_lines_account_idx ON journal_lines(tenant_id, account_id);

-- ==========================================
-- DOCUMENT CHUNKS TABLE (for AI RAG search)
-- ==========================================

CREATE TABLE "document_chunks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid REFERENCES tenants(id),
  "doc_type" varchar(50) NOT NULL DEFAULT 'user_document',
  "file_name" varchar(255) NOT NULL,
  "content" text NOT NULL,
  "embedding" vector(768),
  "created_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_document_chunks_tenant_id ON document_chunks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_doc_type ON document_chunks(doc_type);
