import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const employeesTable = pgTable("employees", {
  id:          serial("id").primaryKey(),
  name:        text("name").notNull(),
  nameAr:      text("name_ar").notNull(),
  position:    text("position").notNull(),
  department:  text("department").notNull(),
  salary:      numeric("salary", { precision:12, scale:2 }).notNull(),
  currency:    text("currency").notNull().default("SAR"),
  nationality: text("nationality").notNull(),
  iqamaNumber: text("iqama_number"),
  joinDate:    text("join_date").notNull(),
  status:      text("status").notNull().default("active").$type<"active"|"inactive"|"on_leave">(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export const payrollRunsTable = pgTable("payroll_runs", {
  id:              serial("id").primaryKey(),
  month:           integer("month").notNull(),
  year:            integer("year").notNull(),
  totalGross:      numeric("total_gross",      { precision:14, scale:2 }).notNull(),
  totalDeductions: numeric("total_deductions", { precision:14, scale:2 }).notNull().default("0"),
  totalNet:        numeric("total_net",        { precision:14, scale:2 }).notNull(),
  employeeCount:   integer("employee_count").notNull(),
  status:          text("status").notNull().default("draft").$type<"draft"|"approved"|"paid">(),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employeesTable).omit({ id:true, createdAt:true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employeesTable.$inferSelect;

export const insertPayrollRunSchema = createInsertSchema(payrollRunsTable).omit({ id:true, createdAt:true });
export type InsertPayrollRun = z.infer<typeof insertPayrollRunSchema>;
export type PayrollRun = typeof payrollRunsTable.$inferSelect;
