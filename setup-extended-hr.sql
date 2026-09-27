-- Extended HR Features SQL Setup
-- This file contains the SQL schema for the new HR features

-- Employee Skills
CREATE TABLE IF NOT EXISTS employee_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  skill_name VARCHAR(255) NOT NULL,
  skill_level VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'expert'
  years_of_experience INTEGER DEFAULT 0,
  last_used DATE,
  is_certified BOOLEAN DEFAULT false,
  certification_name VARCHAR(255),
  certification_expiry DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Employee Education
CREATE TABLE IF NOT EXISTS employee_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255) NOT NULL,
  field_of_study VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  gpa NUMERIC(3,2),
  is_highest BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Employee Work History
CREATE TABLE IF NOT EXISTS employee_work_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  current BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leave Types
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(20) NOT NULL,
  days_per_year INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  requires_document BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leave Balances
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_days INTEGER NOT NULL,
  used_days INTEGER DEFAULT 0,
  pending_days INTEGER DEFAULT 0,
  carry_over_days INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
  approved_by_user_id UUID,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  attachment_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Performance Reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  review_period VARCHAR(50) NOT NULL, -- 'Q1-2024', 'Q2-2024', etc.
  review_date DATE NOT NULL,
  overall_rating NUMERIC(2,1) NOT NULL, -- 1.0 to 5.0
  strengths TEXT,
  areas_for_improvement TEXT,
  goals TEXT,
  comments TEXT,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'reviewed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Performance Goals
CREATE TABLE IF NOT EXISTS performance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'professional', 'personal', 'team'
  target_date DATE NOT NULL,
  progress INTEGER DEFAULT 0, -- 0 to 100
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
  weight NUMERIC(3,2) DEFAULT 1.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Timesheets
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hours NUMERIC(5,2) NOT NULL,
  regular_hours NUMERIC(5,2) NOT NULL,
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected'
  submitted_by_user_id UUID,
  submitted_at TIMESTAMP,
  approved_by_user_id UUID,
  approved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Time Entries
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  project VARCHAR(255),
  task VARCHAR(255),
  hours NUMERIC(5,2) NOT NULL,
  is_overtime BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  work_hours NUMERIC(5,2),
  status VARCHAR(20) DEFAULT 'present', -- 'present', 'absent', 'late', 'half_day', 'leave'
  notes TEXT,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Benefit Plans
CREATE TABLE IF NOT EXISTS benefit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'health', 'dental', 'vision', 'life', 'retirement', 'other'
  employer_contribution NUMERIC(5,2) NOT NULL,
  employee_contribution NUMERIC(5,2) NOT NULL,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Employee Benefit Enrollments
CREATE TABLE IF NOT EXISTS employee_benefit_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  benefit_plan_id UUID NOT NULL REFERENCES benefit_plans(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'terminated'
  coverage_level VARCHAR(50), -- 'employee_only', 'employee_spouse', 'employee_family'
  dependents JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- HR Analytics
CREATE TABLE IF NOT EXISTS hr_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  period_type VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'annual'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_employees INTEGER DEFAULT 0,
  new_hires INTEGER DEFAULT 0,
  terminations INTEGER DEFAULT 0,
  turnover_rate NUMERIC(5,2),
  average_tenure NUMERIC(5,2),
  total_payroll NUMERIC(15,2) DEFAULT 0,
  average_salary NUMERIC(12,2),
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_skills_tenant ON employee_skills(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_employee ON employee_skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_education_tenant ON employee_education(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_education_employee ON employee_education(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_work_history_tenant ON employee_work_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_work_history_employee ON employee_work_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_types_tenant ON leave_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leave_types_active ON leave_types(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_leave_balances_tenant ON leave_balances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee ON leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_year ON leave_balances(tenant_id, year);
CREATE INDEX IF NOT EXISTS idx_leave_requests_tenant ON leave_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_tenant ON performance_reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_goals_tenant ON performance_goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_performance_goals_employee ON performance_goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_goals_status ON performance_goals(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_timesheets_tenant ON timesheets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_employee ON timesheets(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_time_entries_tenant ON time_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_timesheet ON time_entries(timesheet_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_tenant ON attendance_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_benefit_plans_tenant ON benefit_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_benefit_plans_active ON benefit_plans(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_benefit_enrollments_tenant ON employee_benefit_enrollments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_benefit_enrollments_employee ON employee_benefit_enrollments(employee_id);
CREATE INDEX IF NOT EXISTS idx_benefit_enrollments_plan ON employee_benefit_enrollments(benefit_plan_id);
CREATE INDEX IF NOT EXISTS idx_hr_analytics_tenant ON hr_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hr_analytics_period ON hr_analytics(tenant_id, period_start, period_end);
