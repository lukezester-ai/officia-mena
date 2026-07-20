import { pgTable, uuid, varchar, text, numeric, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const warehouses = pgTable('warehouses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  location: text('location'),
  managerName: varchar('manager_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  sku: varchar('sku', { length: 100 }).notNull(),
  barcode: varchar('barcode', { length: 100 }), // Barcode field
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }),
  minStockLevel: integer('min_stock_level').default(5),
  
  // Halal & Hijri Compliance (MENA Specific)
  isHalalCertified: boolean('is_halal_certified').default(false),
  halalCertificateNumber: varchar('halal_certificate_number', { length: 100 }),
  halalExpiryDate: timestamp('halal_expiry_date'),
  expiryDateHijri: varchar('expiry_date_hijri', { length: 20 }), // e.g. "1448-09-01"
  // Petroleum Sector
  isPetroleum: boolean('is_petroleum').default(false),
  apiGravity: numeric('api_gravity', { precision: 5, scale: 2 }), // For volumetric conversion
  
  // Fertilizers & Hazardous Goods
  isFertilizer: boolean('is_fertilizer').default(false),
  mewaRegistration: varchar('mewa_registration', { length: 100 }), // Ministry of Agriculture
  securityClearanceExpiry: timestamp('security_clearance_expiry'), // MOI clearance

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const inventoryLevels = pgTable('inventory_levels', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
  quantity: integer('quantity').notNull().default(0),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'IN', 'OUT', 'ADJUSTMENT'
  quantity: integer('quantity').notNull(),
  referenceId: varchar('reference_id', { length: 100 }), // e.g. Invoice ID
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});
