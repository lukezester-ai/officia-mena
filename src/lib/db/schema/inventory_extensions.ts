import { pgTable, uuid, varchar, text, timestamp, numeric, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { products, warehouses } from './inventory';

// Product Categories
export const productCategories = pgTable('product_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  parentId: uuid('parent_id').references(() => productCategories.id),
  code: varchar('code', { length: 50 }),
  level: integer('level').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Product Attributes
export const productAttributes = pgTable('product_attributes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'text', 'number', 'boolean', 'select', 'multiselect'
  options: jsonb('options'), // For select/multiselect types
  isRequired: boolean('is_required').default(false),
  isSearchable: boolean('is_searchable').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Product Attribute Values
export const productAttributeValues = pgTable('product_attribute_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id),
  attributeId: uuid('attribute_id').notNull().references(() => productAttributes.id),
  value: text('value').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Reorder Points and Settings
export const inventoryReorderSettings = pgTable('inventory_reorder_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id),
  reorderPoint: integer('reorder_point').notNull(),
  reorderQuantity: integer('reorder_quantity').notNull(),
  leadTimeDays: integer('lead_time_days').default(7),
  safetyStock: integer('safety_stock').default(0),
  maxStockLevel: integer('max_stock_level'),
  autoOrder: boolean('auto_order').default(false),
  preferredSupplierId: uuid('preferred_supplier_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Inventory Valuation Methods
export const inventoryValuation = pgTable('inventory_valuation', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id),
  valuationMethod: varchar('valuation_method', { length: 20 }).notNull(), // 'FIFO', 'LIFO', 'WEIGHTED_AVERAGE'
  unitCost: numeric('unit_cost', { precision: 12, scale: 2 }).notNull(),
  totalValue: numeric('total_value', { precision: 12, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  valuationDate: timestamp('valuation_date').notNull(),
  layerData: jsonb('layer_data'), // For FIFO/LIFO tracking
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Inventory Transfers
export const inventoryTransfers = pgTable('inventory_transfers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  fromWarehouseId: uuid('from_warehouse_id').notNull().references(() => warehouses.id),
  toWarehouseId: uuid('to_warehouse_id').notNull().references(() => warehouses.id),
  quantity: integer('quantity').notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'in_transit', 'completed', 'cancelled'
  transferDate: timestamp('transfer_date'),
  expectedArrivalDate: timestamp('expected_arrival_date'),
  actualArrivalDate: timestamp('actual_arrival_date'),
  referenceNumber: varchar('reference_number', { length: 100 }),
  notes: text('notes'),
  createdByUserId: uuid('created_by_user_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Inventory Adjustments
export const inventoryAdjustments = pgTable('inventory_adjustments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id),
  adjustmentType: varchar('adjustment_type', { length: 20 }).notNull(), // 'damage', 'loss', 'theft', 'count_correction', 'return'
  previousQuantity: integer('previous_quantity').notNull(),
  newQuantity: integer('new_quantity').notNull(),
  adjustment: integer('adjustment').notNull(),
  reason: text('reason').notNull(),
  referenceDocument: varchar('reference_document', { length: 100 }),
  approvedByUserId: uuid('approved_by_user_id'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Inventory Alerts
export const inventoryAlerts = pgTable('inventory_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id),
  alertType: varchar('alert_type', { length: 50 }).notNull(), // 'low_stock', 'overstock', 'expired', 'expiring_soon', 'reorder_needed'
  severity: varchar('severity', { length: 20 }).default('medium'), // 'low', 'medium', 'high', 'critical'
  currentValue: integer('current_value'),
  thresholdValue: integer('threshold_value'),
  message: text('message').notNull(),
  isResolved: boolean('is_resolved').default(false),
  resolvedAt: timestamp('resolved_at'),
  resolvedByUserId: uuid('resolved_by_user_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Inventory Analytics
export const inventoryAnalytics = pgTable('inventory_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  periodType: varchar('period_type', { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly', 'quarterly', 'annual'
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  totalProducts: integer('total_products').default(0),
  totalValue: numeric('total_value', { precision: 12, scale: 2 }).default('0'),
  lowStockCount: integer('low_stock_count').default(0),
  outOfStockCount: integer('out_of_stock_count').default(0),
  overstockCount: integer('overstock_count').default(0),
  expiredCount: integer('expired_count').default(0),
  turnoverRate: numeric('turnover_rate', { precision: 5, scale: 2 }),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Inventory Forecasting
export const inventoryForecasting = pgTable('inventory_forecasting', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id),
  forecastType: varchar('forecast_type', { length: 20 }).notNull(), // 'demand', 'stockout', 'reorder'
  forecastPeriod: varchar('forecast_period', { length: 20 }).notNull(), // 'weekly', 'monthly', 'quarterly'
  forecastDate: timestamp('forecast_date').notNull(),
  forecastData: jsonb('forecast_data').notNull(),
  confidence: numeric('confidence', { precision: 5, scale: 2 }),
  lastTrainedAt: timestamp('last_trained_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
