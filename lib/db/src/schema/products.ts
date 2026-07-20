import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id:             serial("id").primaryKey(),
  name:           text("name").notNull(),
  nameAr:         text("name_ar"),
  sku:            text("sku").notNull().unique(),
  category:       text("category").notNull().$type<"petroleum"|"fertilizer"|"general">(),
  unit:           text("unit").notNull(),
  currentStock:   numeric("current_stock", { precision:14, scale:3 }).notNull().default("0"),
  unitCost:       numeric("unit_cost",     { precision:14, scale:2 }).notNull().default("0"),
  reorderLevel:   numeric("reorder_level", { precision:14, scale:3 }).notNull().default("0"),
  // petroleum
  fuelType:       text("fuel_type"),
  density:        numeric("density",      { precision:8, scale:4 }),
  flashPoint:     numeric("flash_point",  { precision:8, scale:2 }),
  adrClass:       text("adr_class"),
  sulphurPct:     numeric("sulphur_pct",  { precision:6, scale:4 }),
  octaneRating:   integer("octane_rating"),
  tankId:         integer("tank_id"),
  // fertilizer
  npkN:           numeric("npk_n", { precision:6, scale:2 }),
  npkP:           numeric("npk_p", { precision:6, scale:2 }),
  npkK:           numeric("npk_k", { precision:6, scale:2 }),
  bagWeight:      numeric("bag_weight", { precision:8, scale:2 }),
  fertilizerType: text("fertilizer_type"),
  expiryDate:     text("expiry_date"),
  halalCertified: boolean("halal_certified"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id:true, createdAt:true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
