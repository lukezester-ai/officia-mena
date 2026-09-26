-- Extended Accounting Features SQL Setup
-- This file contains the SQL schema for the new accounting features

-- Custom Reports
CREATE TABLE IF NOT EXISTS custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) NOT NULL, -- 'profit_loss', 'balance_sheet', 'cash_flow', 'custom'
  configuration JSONB NOT NULL,
  created_by_user_id UUID,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  fiscal_year INTEGER NOT NULL,
  fiscal_month INTEGER, -- null for annual budgets
  currency VARCHAR(3) DEFAULT 'SAR',
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'archived'
  created_by_user_id UUID,
  approved_by_user_id UUID,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Budget Lines
CREATE TABLE IF NOT EXISTS budget_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id),
  account_id UUID NOT NULL,
  budgeted_amount NUMERIC(12,2) NOT NULL,
  variance_threshold NUMERIC(5,2) DEFAULT 10.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Report Snapshots
CREATE TABLE IF NOT EXISTS report_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  report_type VARCHAR(50) NOT NULL,
  period_type VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'annual'
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Currency Exchange Rates
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate NUMERIC(12,6) NOT NULL,
  effective_date TIMESTAMP NOT NULL,
  source VARCHAR(50), -- 'manual', 'api', etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reconciliation Rules
CREATE TABLE IF NOT EXISTS reconciliation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'amount_match', 'date_range', 'description_match'
  configuration JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by_user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log Entries
CREATE TABLE IF NOT EXISTS audit_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reverse'
  old_value JSONB,
  new_value JSONB,
  user_id UUID NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_reports_tenant ON custom_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_active ON custom_reports(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_budgets_tenant ON budgets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_budgets_fiscal ON budgets(tenant_id, fiscal_year, fiscal_month);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_budget_lines_budget ON budget_lines(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_lines_account ON budget_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_report_snapshots_tenant ON report_snapshots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_report_snapshots_type ON report_snapshots(tenant_id, report_type);
CREATE INDEX IF NOT EXISTS idx_report_snapshots_period ON report_snapshots(tenant_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_tenant ON exchange_rates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(tenant_id, from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(tenant_id, effective_date);
CREATE INDEX IF NOT EXISTS idx_reconciliation_rules_tenant ON reconciliation_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_rules_active ON reconciliation_rules(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant ON audit_log_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log_entries(tenant_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log_entries(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log_entries(tenant_id, created_at);
