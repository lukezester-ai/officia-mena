-- Extended Invoicing Features SQL Setup
-- This file contains the SQL schema for the new invoicing features

-- Invoice Templates
CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_type VARCHAR(50) NOT NULL, -- 'standard', 'custom', 'recurring'
  layout JSONB NOT NULL,
  default_vat_rate NUMERIC(5,2) DEFAULT 15.00,
  payment_terms INTEGER DEFAULT 30,
  currency VARCHAR(3) DEFAULT 'SAR',
  is_default BOOLEAN DEFAULT false,
  created_by_user_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoice Workflows
CREATE TABLE IF NOT EXISTS invoice_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stages JSONB NOT NULL,
  auto_transition BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  approval_threshold NUMERIC(12,2) DEFAULT 0.00,
  created_by_user_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoice Workflow History
CREATE TABLE IF NOT EXISTS invoice_workflow_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL,
  stage VARCHAR(50) NOT NULL,
  previous_stage VARCHAR(50),
  action VARCHAR(50) NOT NULL,
  actor_id UUID NOT NULL,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoice Reminders
CREATE TABLE IF NOT EXISTS invoice_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL, -- 'due_date', 'overdue', 'custom'
  days_before_due INTEGER,
  days_after_due INTEGER,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_automated BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP,
  send_count INTEGER DEFAULT 0,
  created_by_user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recurring Invoices
CREATE TABLE IF NOT EXISTS recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID NOT NULL,
  template_id UUID REFERENCES invoice_templates(id),
  frequency VARCHAR(20) NOT NULL, -- 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'
  interval INTEGER DEFAULT 1,
  day_of_month INTEGER,
  day_of_week INTEGER,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  next_invoice_date TIMESTAMP NOT NULL,
  invoice_amount NUMERIC(12,2) NOT NULL,
  vat_rate NUMERIC(5,2) DEFAULT 15.00,
  currency VARCHAR(3) DEFAULT 'SAR',
  payment_terms INTEGER DEFAULT 30,
  auto_generate BOOLEAN DEFAULT true,
  auto_send BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_generated_at TIMESTAMP,
  total_generated INTEGER DEFAULT 0,
  created_by_user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recurring Invoice History
CREATE TABLE IF NOT EXISTS recurring_invoice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_invoice_id UUID NOT NULL,
  generated_invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP NOT NULL,
  generated_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'generated', -- 'generated', 'sent', 'paid', 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoice Collections
CREATE TABLE IF NOT EXISTS invoice_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  collection_stage VARCHAR(50) NOT NULL, -- 'friendly', 'formal', 'escalated', 'legal'
  action_taken VARCHAR(50),
  notes TEXT,
  assigned_to_user_id UUID,
  next_action_date TIMESTAMP,
  resolved_at TIMESTAMP,
  created_by_user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoice Analytics
CREATE TABLE IF NOT EXISTS invoice_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'annual'
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  total_invoices INTEGER DEFAULT 0,
  total_amount NUMERIC(12,2) DEFAULT 0,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  overdue_amount NUMERIC(12,2) DEFAULT 0,
  average_payment_days NUMERIC(5,2),
  collection_rate NUMERIC(5,2),
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoice Currency Settings
CREATE TABLE IF NOT EXISTS invoice_currency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  currency VARCHAR(3) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  vat_rate NUMERIC(5,2),
  exchange_rate NUMERIC(12,6),
  last_updated TIMESTAMP,
  created_by_user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoice_templates_tenant ON invoice_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_active ON invoice_templates(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_invoice_workflows_tenant ON invoice_workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_workflows_active ON invoice_workflows(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_invoice_workflow_history_invoice ON invoice_workflow_history(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_workflow_history_workflow ON invoice_workflow_history(workflow_id);
CREATE INDEX IF NOT EXISTS idx_invoice_reminders_tenant ON invoice_reminders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_reminders_invoice ON invoice_reminders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_reminders_active ON invoice_reminders(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_tenant ON recurring_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_active ON recurring_invoices(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_date ON recurring_invoices(tenant_id, next_invoice_date);
CREATE INDEX IF NOT EXISTS idx_recurring_history_recurring ON recurring_invoice_history(recurring_invoice_id);
CREATE INDEX IF NOT EXISTS idx_recurring_history_invoice ON recurring_invoice_history(generated_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_collections_tenant ON invoice_collections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_collections_invoice ON invoice_collections(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_collections_stage ON invoice_collections(tenant_id, collection_stage);
CREATE INDEX IF NOT EXISTS idx_invoice_analytics_tenant ON invoice_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_analytics_period ON invoice_analytics(tenant_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_invoice_currency_settings_tenant ON invoice_currency_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_currency_settings_currency ON invoice_currency_settings(tenant_id, currency);
CREATE INDEX IF NOT EXISTS idx_invoice_currency_settings_default ON invoice_currency_settings(tenant_id, is_default);
