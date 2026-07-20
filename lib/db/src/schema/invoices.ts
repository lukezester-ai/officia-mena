import { pgTable, serial, text, numeric, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const invoicesTable = pgTable("invoices", {
  id:          serial("id").primaryKey(),
  number:      text("number").notNull().unique(),
  type:        text("type").notNull().$type<"sales"|"purchase">(),
  status:      text("status").notNull().default("draft").$type<"draft"|"issued"|"paid"|"overdue"|"cancelled">(),
  contactId:   integer("contact_id").notNull(),
  contactName: text("contact_name").notNull(),
  issueDate:   text("issue_date").notNull(),
  dueDate:     text("due_date").notNull(),
  subtotal:    numeric("subtotal",   { precision:14, scale:2 }).notNull().default("0"),
  vatAmount:   numeric("vat_amount", { precision:14, scale:2 }).notNull().default("0"),
  total:       numeric("total",      { precision:14, scale:2 }).notNull().default("0"),
  currency:    text("currency").notNull().default("SAR"),
  notes:       text("notes"),
  lineItems:   jsonb("line_items").notNull().default("[]"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({ id:true, createdAt:true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;
