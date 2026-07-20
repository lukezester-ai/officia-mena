import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stockMovementsTable = pgTable("stock_movements", {
  id:         serial("id").primaryKey(),
  productId:  integer("product_id").notNull(),
  type:       text("type").notNull().$type<"in"|"out"|"adjustment">(),
  quantity:   numeric("quantity", { precision:14, scale:3 }).notNull(),
  unit:       text("unit").notNull(),
  unitCost:   numeric("unit_cost", { precision:14, scale:2 }),
  reference:  text("reference").notNull(),
  notes:      text("notes"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

export const insertStockMovementSchema = createInsertSchema(stockMovementsTable).omit({ id:true, createdAt:true });
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = typeof stockMovementsTable.$inferSelect;
