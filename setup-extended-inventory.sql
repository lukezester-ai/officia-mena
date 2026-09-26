-- Extended Inventory Features SQL Setup
-- This file contains the SQL schema for the new inventory features

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES product_categories(id),
  code VARCHAR(50),
  level INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Attributes
CREATE TABLE IF NOT EXISTS product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'text', 'number', 'boolean', 'select', 'multiselect'
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  is_searchable BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Attribute Values
CREATE TABLE IF NOT EXISTS product_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reorder Points and Settings
CREATE TABLE IF NOT EXISTS inventory_reorder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  reorder_point INTEGER NOT NULL,
  reorder_quantity INTEGER NOT NULL,
  lead_time_days INTEGER DEFAULT 7,
  safety_stock INTEGER DEFAULT 0,
  max_stock_level INTEGER,
  auto_order BOOLEAN DEFAULT false,
  preferred_supplier_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Valuation Methods
CREATE TABLE IF NOT EXISTS inventory_valuation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  valuation_method VARCHAR(20) NOT NULL, -- 'FIFO', 'LIFO', 'WEIGHTED_AVERAGE'
  unit_cost NUMERIC(12,2) NOT NULL,
  total_value NUMERIC(12,2) NOT NULL,
  quantity INTEGER NOT NULL,
  valuation_date TIMESTAMP NOT NULL,
  layer_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Transfers
CREATE TABLE IF NOT EXISTS inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  from_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  to_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_transit', 'completed', 'cancelled'
  transfer_date TIMESTAMP,
  expected_arrival_date TIMESTAMP,
  actual_arrival_date TIMESTAMP,
  reference_number VARCHAR(100),
  notes TEXT,
  created_by_user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Adjustments
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  adjustment_type VARCHAR(20) NOT NULL, -- 'damage', 'loss', 'theft', 'count_correction', 'return'
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  adjustment INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_document VARCHAR(100),
  approved_by_user_id UUID,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Alerts
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'low_stock', 'overstock', 'expired', 'expiring_soon', 'reorder_needed'
  severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  current_value INTEGER,
  threshold_value INTEGER,
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by_user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Analytics
CREATE TABLE IF NOT EXISTS inventory_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'annual'
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  total_products INTEGER DEFAULT 0,
  total_value NUMERIC(12,2) DEFAULT 0,
  low_stock_count INTEGER DEFAULT 0,
  out_of_stock_count INTEGER DEFAULT 0,
  overstock_count INTEGER DEFAULT 0,
  expired_count INTEGER DEFAULT 0,
  turnover_rate NUMERIC(5,2),
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Forecasting
CREATE TABLE IF NOT EXISTS inventory_forecasting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  forecast_type VARCHAR(20) NOT NULL, -- 'demand', 'stockout', 'reorder'
  forecast_period VARCHAR(20) NOT NULL, -- 'weekly', 'monthly', 'quarterly'
  forecast_date TIMESTAMP NOT NULL,
  forecast_data JSONB NOT NULL,
  confidence NUMERIC(5,2),
  last_trained_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_categories_tenant ON product_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_active ON product_categories(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_product_attributes_tenant ON product_attributes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_product_attributes_active ON product_attributes(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_product_attribute_values_product ON product_attribute_values(product_id);
CREATE INDEX IF NOT EXISTS idx_product_attribute_values_attribute ON product_attribute_values(attribute_id);
CREATE INDEX IF NOT EXISTS idx_reorder_settings_tenant ON inventory_reorder_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reorder_settings_product ON inventory_reorder_settings(product_id);
CREATE INDEX IF NOT EXISTS idx_reorder_settings_warehouse ON inventory_reorder_settings(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_reorder_settings_active ON inventory_reorder_settings(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_valuation_tenant ON inventory_valuation(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_valuation_product ON inventory_valuation(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_valuation_warehouse ON inventory_valuation(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_valuation_date ON inventory_valuation(tenant_id, valuation_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_tenant ON inventory_transfers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_product ON inventory_transfers(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_status ON inventory_transfers(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_tenant ON inventory_adjustments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_warehouse ON inventory_adjustments(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_tenant ON inventory_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_type ON inventory_alerts(tenant_id, alert_type);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_resolved ON inventory_alerts(tenant_id, is_resolved);
CREATE INDEX IF NOT EXISTS idx_inventory_analytics_tenant ON inventory_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_analytics_period ON inventory_analytics(tenant_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_inventory_forecasting_tenant ON inventory_forecasting(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_forecasting_product ON inventory_forecasting(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_forecasting_date ON inventory_forecasting(tenant_id, forecast_date);
