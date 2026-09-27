-- Extended Subscriptions SQL Setup
-- This file contains the SQL schema for the new subscription features

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stripe_price_id VARCHAR(255),
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  interval VARCHAR(20) NOT NULL, -- 'month', 'year'
  interval_count INTEGER DEFAULT 1,
  trial_period_days INTEGER DEFAULT 0,
  features JSONB, -- Array of feature strings
  limits JSONB, -- Usage limits per feature
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Add-ons
CREATE TABLE IF NOT EXISTS subscription_add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stripe_price_id VARCHAR(255),
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  interval VARCHAR(20) NOT NULL, -- 'month', 'year'
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Add-on Enrollments
CREATE TABLE IF NOT EXISTS subscription_add_on_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  add_on_id UUID NOT NULL REFERENCES subscription_add_ons(id) ON DELETE CASCADE,
  stripe_subscription_item_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage Metrics
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL, -- 'api_calls', 'storage_gb', 'users', 'invoices'
  metric_value NUMERIC(15,2) NOT NULL,
  unit VARCHAR(20) NOT NULL, -- 'count', 'gb', 'hours'
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL,
  stripe_payment_method_id VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'card', 'bank_account'
  last4 VARCHAR(4),
  brand VARCHAR(20),
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Invoices
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255),
  stripe_invoice_number VARCHAR(255),
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL, -- 'draft', 'open', 'paid', 'void', 'uncollectible'
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  description TEXT,
  pdf_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Payments
CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES subscription_invoices(id),
  stripe_payment_intent_id VARCHAR(255),
  stripe_payment_id VARCHAR(255),
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL, -- 'pending', 'succeeded', 'failed', 'refunded'
  payment_method_id UUID REFERENCES payment_methods(id),
  failure_reason TEXT,
  refunded_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Events
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'cancelled', 'payment_failed', 'payment_succeeded'
  event_data JSONB NOT NULL,
  stripe_event_id VARCHAR(255),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Discount Codes
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount'
  discount_value NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  applies_to JSONB, -- Array of plan IDs or 'all'
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Discount Redemptions
CREATE TABLE IF NOT EXISTS discount_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  discount_amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Analytics
CREATE TABLE IF NOT EXISTS subscription_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'annual'
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  total_subscriptions INTEGER DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  cancelled_subscriptions INTEGER DEFAULT 0,
  total_revenue NUMERIC(15,2) DEFAULT 0,
  mrr NUMERIC(15,2) DEFAULT 0, -- Monthly Recurring Revenue
  arr NUMERIC(15,2) DEFAULT 0, -- Annual Recurring Revenue
  churn_rate NUMERIC(5,2),
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_tenant ON subscription_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_public ON subscription_plans(tenant_id, is_public);
CREATE INDEX IF NOT EXISTS idx_subscription_add_ons_tenant ON subscription_add_ons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_add_on_enrollments_tenant ON subscription_add_on_enrollments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_add_on_enrollments_subscription ON subscription_add_on_enrollments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_tenant ON subscription_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription ON subscription_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_period ON subscription_usage(tenant_id, subscription_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant ON payment_methods(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_tenant ON subscription_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_subscription ON subscription_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_status ON subscription_invoices(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_tenant ON subscription_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_subscription_events_tenant ON subscription_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription ON subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(tenant_id, event_type);
CREATE INDEX IF NOT EXISTS idx_discount_codes_tenant ON discount_codes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_tenant ON discount_redemptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_code ON discount_redemptions(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_tenant ON subscription_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_period ON subscription_analytics(tenant_id, period_start, period_end);
