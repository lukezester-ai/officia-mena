import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vatTransactionsTable = pgTable("vat_transactions", {
  id:          serial("id").primaryKey(),
  date:        text("date").notNull(),
  description: text("description").notNull(),
  vatAmount:   numeric("vat_amount", { precision:14, scale:2 }).notNull(),
  vatRate:     numeric("vat_rate",   { precision:5, scale:2 }).notNull().default("15"),
  type:        text("type").notNull().$type<"output"|"input">(),
  invoiceId:   integer("invoice_id"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export const vatDeclarationsTable = pgTable("vat_declarations", {
  id:        serial("id").primaryKey(),
  period:    text("period").notNull(),
  outputVat: numeric("output_vat", { precision:14, scale:2 }).notNull(),
  inputVat:  numeric("input_vat",  { precision:14, scale:2 }).notNull(),
  netVat:    numeric("net_vat",    { precision:14, scale:2 }).notNull(),
  status:    text("status").notNull().default("draft").$type<"draft"|"submitted"|"paid">(),
  dueDate:   text("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVatTransactionSchema = createInsertSchema(vatTransactionsTable).omit({ id:true, createdAt:true });
export type InsertVatTransaction = z.infer<typeof insertVatTransactionSchema>;
export type VatTransaction = typeof vatTransactionsTable.$inferSelect;

export const insertVatDeclarationSchema = createInsertSchema(vatDeclarationsTable).omit({ id:true, createdAt:true });
export type InsertVatDeclaration = z.infer<typeof insertVatDeclarationSchema>;
export type VatDeclaration = typeof vatDeclarationsTable.$inferSelect;
