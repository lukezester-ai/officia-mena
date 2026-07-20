import { pgTable, serial, text, numeric, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const accountsTable = pgTable("accounts", {
  id:       serial("id").primaryKey(),
  code:     text("code").notNull().unique(),
  name:     text("name").notNull(),
  nameAr:   text("name_ar"),
  type:     text("type").notNull().$type<"asset"|"liability"|"equity"|"revenue"|"expense">(),
  balance:  numeric("balance", { precision:14, scale:2 }).notNull().default("0"),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalEntriesTable = pgTable("journal_entries", {
  id:          serial("id").primaryKey(),
  date:        text("date").notNull(),
  description: text("description").notNull(),
  reference:   text("reference"),
  lines:       jsonb("lines").notNull().default("[]"),
  status:      text("status").notNull().default("draft").$type<"draft"|"posted">(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export const insertAccountSchema = createInsertSchema(accountsTable).omit({ id:true, createdAt:true });
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accountsTable.$inferSelect;

export const insertJournalEntrySchema = createInsertSchema(journalEntriesTable).omit({ id:true, createdAt:true });
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntriesTable.$inferSelect;
