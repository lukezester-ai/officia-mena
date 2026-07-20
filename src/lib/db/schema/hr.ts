import { pgTable, uuid, varchar, numeric, timestamp, date } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const employees = pgTable('employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  employeeId: varchar('employee_id', { length: 50 }).notNull(), // Company's internal ID
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  nationality: varchar('nationality', { length: 100 }),
  nationalIdNumber: varchar('national_id_number', { length: 50 }), // Iqama or Saudi ID
  basicSalary: numeric('basic_salary', { precision: 12, scale: 2 }).notNull(),
  housingAllowance: numeric('housing_allowance', { precision: 12, scale: 2 }).default('0'),
  transportAllowance: numeric('transport_allowance', { precision: 12, scale: 2 }).default('0'),
  bankIban: varchar('bank_iban', { length: 50 }),
  joinDate: date('join_date').notNull(),
  status: varchar('status', { length: 50 }).default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const employeeDocuments = pgTable('employee_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  employeeId: uuid('employee_id').references(() => employees.id).notNull(),
  documentType: varchar('document_type', { length: 50 }).notNull(), // 'IQAMA', 'PASSPORT', 'HEALTH_INSURANCE'
  documentNumber: varchar('document_number', { length: 100 }),
  expiryDate: date('expiry_date').notNull(), // Critical for alerts
  createdAt: timestamp('created_at').defaultNow(),
});

export const payrollRuns = pgTable('payroll_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  periodMonth: numeric('period_month').notNull(),
  periodYear: numeric('period_year').notNull(),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  wpsStatus: varchar('wps_status', { length: 50 }).default('PENDING'), // PENDING, GENERATED, SUBMITTED
  createdAt: timestamp('created_at').defaultNow(),
});
