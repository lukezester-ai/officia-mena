import { pgTable, uuid, varchar, text, timestamp, date, numeric, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { employees } from './hr';

// Employee Skills
export const employeeSkills = pgTable('employee_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  skillName: varchar('skill_name', { length: 255 }).notNull(),
  skillLevel: varchar('skill_level', { length: 20 }).notNull(), // 'beginner', 'intermediate', 'advanced', 'expert'
  yearsOfExperience: integer('years_of_experience').default(0),
  lastUsed: date('last_used'),
  isCertified: boolean('is_certified').default(false),
  certificationName: varchar('certification_name', { length: 255 }),
  certificationExpiry: date('certification_expiry'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Employee Education
export const employeeEducation = pgTable('employee_education', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  institution: varchar('institution', { length: 255 }).notNull(),
  degree: varchar('degree', { length: 255 }).notNull(),
  fieldOfStudy: varchar('field_of_study', { length: 255 }),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  gpa: numeric('gpa', { precision: 3, scale: 2 }),
  isHighest: boolean('is_highest').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Employee Work History
export const employeeWorkHistory = pgTable('employee_work_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  company: varchar('company', { length: 255 }).notNull(),
  position: varchar('position', { length: 255 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  description: text('description'),
  current: boolean('current').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Leave Types
export const leaveTypes = pgTable('leave_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  code: varchar('code', { length: 20 }).notNull(),
  daysPerYear: integer('days_per_year').notNull(),
  isPaid: boolean('is_paid').default(true),
  requiresApproval: boolean('requires_approval').default(true),
  requiresDocument: boolean('requires_document').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Leave Balances
export const leaveBalances = pgTable('leave_balances', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  leaveTypeId: uuid('leave_type_id').notNull().references(() => leaveTypes.id),
  year: integer('year').notNull(),
  totalDays: integer('total_days').notNull(),
  usedDays: integer('used_days').default(0),
  pendingDays: integer('pending_days').default(0),
  carryOverDays: integer('carry_over_days').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Leave Requests
export const leaveRequests = pgTable('leave_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  leaveTypeId: uuid('leave_type_id').notNull().references(() => leaveTypes.id),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  totalDays: integer('total_days').notNull(),
  reason: text('reason'),
  status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'approved', 'rejected', 'cancelled'
  approvedByUserId: uuid('approved_by_user_id'),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  attachmentUrl: varchar('attachment_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Performance Reviews
export const performanceReviews = pgTable('performance_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  reviewerId: uuid('reviewer_id').notNull(),
  reviewPeriod: varchar('review_period', { length: 50 }).notNull(), // 'Q1-2024', 'Q2-2024', etc.
  reviewDate: date('review_date').notNull(),
  overallRating: numeric('overall_rating', { precision: 2, scale: 1 }).notNull(), // 1.0 to 5.0
  strengths: text('strengths'),
  areasForImprovement: text('areas_for_improvement'),
  goals: text('goals'),
  comments: text('comments'),
  status: varchar('status', { length: 20 }).default('draft'), // 'draft', 'submitted', 'reviewed'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Performance Goals
export const performanceGoals = pgTable('performance_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(), // 'professional', 'personal', 'team'
  targetDate: date('target_date').notNull(),
  progress: integer('progress').default(0), // 0 to 100
  status: varchar('status', { length: 20 }).default('active'), // 'active', 'completed', 'cancelled'
  priority: varchar('priority', { length: 20 }).default('medium'), // 'low', 'medium', 'high'
  weight: numeric('weight', { precision: 3, scale: 2 }).default('1.00'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Timesheets
export const timesheets = pgTable('timesheets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  totalHours: numeric('total_hours', { precision: 5, scale: 2 }).notNull(),
  regularHours: numeric('regular_hours', { precision: 5, scale: 2 }).notNull(),
  overtimeHours: numeric('overtime_hours', { precision: 5, scale: 2 }).default('0'),
  status: varchar('status', { length: 20 }).default('draft'), // 'draft', 'submitted', 'approved', 'rejected'
  submittedByUserId: uuid('submitted_by_user_id'),
  submittedAt: timestamp('submitted_at'),
  approvedByUserId: uuid('approved_by_user_id'),
  approvedAt: timestamp('approved_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Time Entries
export const timeEntries = pgTable('time_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  timesheetId: uuid('timesheet_id').notNull().references(() => timesheets.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  date: date('date').notNull(),
  project: varchar('project', { length: 255 }),
  task: varchar('task', { length: 255 }),
  hours: numeric('hours', { precision: 5, scale: 2 }).notNull(),
  isOvertime: boolean('is_overtime').default(false),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Attendance Records
export const attendanceRecords = pgTable('attendance_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  date: date('date').notNull(),
  checkInTime: timestamp('check_in_time'),
  checkOutTime: timestamp('check_out_time'),
  workHours: numeric('work_hours', { precision: 5, scale: 2 }),
  status: varchar('status', { length: 20 }).default('present'), // 'present', 'absent', 'late', 'half_day', 'leave'
  notes: text('notes'),
  location: varchar('location', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Benefit Plans
export const benefitPlans = pgTable('benefit_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'health', 'dental', 'vision', 'life', 'retirement', 'other'
  employerContribution: numeric('employer_contribution', { precision: 5, scale: 2 }).notNull(),
  employeeContribution: numeric('employee_contribution', { precision: 5, scale: 2 }).notNull(),
  effectiveDate: date('effective_date').notNull(),
  expiryDate: date('expiry_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Employee Benefit Enrollments
export const employeeBenefitEnrollments = pgTable('employee_benefit_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  benefitPlanId: uuid('benefit_plan_id').notNull().references(() => benefitPlans.id),
  enrollmentDate: date('enrollment_date').notNull(),
  status: varchar('status', { length: 20 }).default('active'), // 'active', 'suspended', 'terminated'
  coverageLevel: varchar('coverage_level', { length: 50 }), // 'employee_only', 'employee_spouse', 'employee_family'
  dependents: jsonb('dependents'), // Array of dependent information
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// HR Analytics
export const hrAnalytics = pgTable('hr_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  periodType: varchar('period_type', { length: 20 }).notNull(), // 'monthly', 'quarterly', 'annual'
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  totalEmployees: integer('total_employees').default(0),
  newHires: integer('new_hires').default(0),
  terminations: integer('terminations').default(0),
  turnoverRate: numeric('turnover_rate', { precision: 5, scale: 2 }),
  averageTenure: numeric('average_tenure', { precision: 5, scale: 2 }),
  totalPayroll: numeric('total_payroll', { precision: 15, scale: 2 }).default('0'),
  averageSalary: numeric('average_salary', { precision: 12, scale: 2 }),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
