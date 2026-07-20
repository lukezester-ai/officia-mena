import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tanksTable = pgTable("tanks", {
  id:             serial("id").primaryKey(),
  name:           text("name").notNull(),
  fuelType:       text("fuel_type").notNull(),
  capacityLiters: numeric("capacity_liters", { precision:14, scale:2 }).notNull(),
  currentLiters:  numeric("current_liters",  { precision:14, scale:2 }).notNull().default("0"),
  location:       text("location").notNull(),
  status:         text("status").notNull().default("active").$type<"active"|"maintenance"|"inactive">(),
  lastInspection: text("last_inspection"),
  nextInspection: text("next_inspection"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});

export const insertTankSchema = createInsertSchema(tanksTable).omit({ id:true, createdAt:true });
export type InsertTank = z.infer<typeof insertTankSchema>;
export type Tank = typeof tanksTable.$inferSelect;
