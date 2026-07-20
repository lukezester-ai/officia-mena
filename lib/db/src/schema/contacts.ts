import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contactsTable = pgTable("contacts", {
  id:         serial("id").primaryKey(),
  name:       text("name").notNull(),
  nameAr:     text("name_ar"),
  type:       text("type").notNull().$type<"client"|"supplier"|"both">(),
  email:      text("email"),
  phone:      text("phone"),
  country:    text("country").notNull(),
  city:       text("city"),
  vatNumber:  text("vat_number"),
  crNumber:   text("cr_number"),
  balance:    numeric("balance", { precision:14, scale:2 }).notNull().default("0"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contactsTable).omit({ id:true, createdAt:true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contactsTable.$inferSelect;
