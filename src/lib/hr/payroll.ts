import { db } from '@/lib/db/db';
import { employees, payrollRuns } from '@/lib/db/schema/hr';
import { eq, and, desc } from 'drizzle-orm';

export interface PayrollItem {
  employeeId: string;
  employeeName: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  grossSalary: number;
  socialInsurance: number;
  pension: number;
  taxableIncome: number;
  incomeTax: number;
  netSalary: number;
  deductions: {
    socialInsurance: number;
    pension: number;
    incomeTax: number;
    other: number;
  };
}

export interface PayrollRunInput {
  tenantId: string;
  periodMonth: number;
  periodYear: number;
  userId: string;
}

export async function calculatePayroll(tenantId: string, periodMonth: number, periodYear: number) {
  const employeeData = await db
    .select({
      id: employees.id,
      employeeId: employees.employeeId,
      firstName: employees.firstName,
      lastName: employees.lastName,
      basicSalary: employees.basicSalary,
      housingAllowance: employees.housingAllowance,
      transportAllowance: employees.transportAllowance,
      status: employees.status,
    })
    .from(employees)
    .where(and(eq(employees.tenantId, tenantId), eq(employees.status, 'ACTIVE')));

  const payrollItems: PayrollItem[] = [];

  for (const employee of employeeData) {
    const basicSalary = Number(employee.basicSalary);
    const housingAllowance = Number(employee.housingAllowance || 0);
    const transportAllowance = Number(employee.transportAllowance || 0);
    const otherAllowances = 0; // Would include other allowances

    const grossSalary = basicSalary + housingAllowance + transportAllowance + otherAllowances;

    // Saudi Arabia-specific calculations
    const socialInsurance = grossSalary * 0.11; // 11% for social insurance
    const pension = grossSalary * 0.09; // 9% for pension
    const taxableIncome = grossSalary - socialInsurance - pension;

    // Progressive income tax (Saudi Arabia doesn't have personal income tax, but other MENA countries do)
    const incomeTax = calculateIncomeTax(taxableIncome);

    const netSalary = grossSalary - socialInsurance - pension - incomeTax;

    payrollItems.push({
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      basicSalary,
      housingAllowance,
      transportAllowance,
      otherAllowances,
      grossSalary,
      socialInsurance,
      pension,
      taxableIncome,
      incomeTax,
      netSalary,
      deductions: {
        socialInsurance,
        pension,
        incomeTax,
        other: 0,
      },
    });
  }

  return payrollItems;
}

function calculateIncomeTax(taxableIncome: number): number {
  // Progressive tax brackets (example for MENA region)
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 3000) return 0;
  if (taxableIncome <= 5000) return (taxableIncome - 3000) * 0.05;
  if (taxableIncome <= 10000) return 100 + (taxableIncome - 5000) * 0.10;
  if (taxableIncome <= 20000) return 600 + (taxableIncome - 10000) * 0.15;
  if (taxableIncome <= 50000) return 2100 + (taxableIncome - 20000) * 0.20;
  return 8100 + (taxableIncome - 50000) * 0.25;
}

export async function createPayrollRun(input: PayrollRunInput) {
  const payrollItems = await calculatePayroll(input.tenantId, input.periodMonth, input.periodYear);

  const totalAmount = payrollItems.reduce((sum, item) => sum + item.netSalary, 0);

  const [payrollRun] = await db
    .insert(payrollRuns)
    .values({
      tenantId: input.tenantId,
      periodMonth: input.periodMonth,
      periodYear: input.periodYear,
      totalAmount: totalAmount.toFixed(2),
      wpsStatus: 'PENDING',
    })
    .returning();

  return {
    payrollRun,
    payrollItems,
    summary: {
      totalEmployees: payrollItems.length,
      totalGrossSalary: payrollItems.reduce((sum, item) => sum + item.grossSalary, 0),
      totalDeductions: payrollItems.reduce((sum, item) => sum + item.deductions.socialInsurance + item.deductions.pension + item.deductions.incomeTax, 0),
      totalNetSalary: totalAmount,
      averageNetSalary: payrollItems.length > 0 ? totalAmount / payrollItems.length : 0,
    },
  };
}

export async function getPayrollRuns(tenantId: string, limit = 12) {
  return db
    .select()
    .from(payrollRuns)
    .where(eq(payrollRuns.tenantId, tenantId))
    .orderBy(desc(payrollRuns.createdAt))
    .limit(limit);
}

export async function getPayrollRun(runId: string, tenantId: string) {
  const [run] = await db
    .select()
    .from(payrollRuns)
    .where(and(eq(payrollRuns.id, runId), eq(payrollRuns.tenantId, tenantId)))
    .limit(1);

  if (!run) {
    throw new Error('Payroll run not found');
  }

  const payrollItems = await calculatePayroll(tenantId, Number(run.periodMonth), Number(run.periodYear));

  return {
    run,
    payrollItems,
  };
}

export async function updatePayrollRunStatus(runId: string, tenantId: string, status: 'PENDING' | 'GENERATED' | 'SUBMITTED') {
  const [run] = await db
    .update(payrollRuns)
    .set({ wpsStatus: status })
    .where(and(eq(payrollRuns.id, runId), eq(payrollRuns.tenantId, tenantId)))
    .returning();

  return run;
}

export async function generatePayrollReport(tenantId: string, periodMonth: number, periodYear: number) {
  const payrollItems = await calculatePayroll(tenantId, periodMonth, periodYear);

  const report = {
    period: { month: periodMonth, year: periodYear },
    generatedAt: new Date(),
    summary: {
      totalEmployees: payrollItems.length,
      totalGrossSalary: payrollItems.reduce((sum, item) => sum + item.grossSalary, 0),
      totalDeductions: payrollItems.reduce((sum, item) => sum + item.deductions.socialInsurance + item.deductions.pension + item.deductions.incomeTax, 0),
      totalNetSalary: payrollItems.reduce((sum, item) => sum + item.netSalary, 0),
      averageGrossSalary: payrollItems.length > 0 ? payrollItems.reduce((sum, item) => sum + item.grossSalary, 0) / payrollItems.length : 0,
      averageNetSalary: payrollItems.length > 0 ? payrollItems.reduce((sum, item) => sum + item.netSalary, 0) / payrollItems.length : 0,
    },
    deductionsBreakdown: {
      totalSocialInsurance: payrollItems.reduce((sum, item) => sum + item.deductions.socialInsurance, 0),
      totalPension: payrollItems.reduce((sum, item) => sum + item.deductions.pension, 0),
      totalIncomeTax: payrollItems.reduce((sum, item) => sum + item.deductions.incomeTax, 0),
    },
    salaryRanges: {
      below5000: payrollItems.filter(item => item.netSalary < 5000).length,
      between5000And10000: payrollItems.filter(item => item.netSalary >= 5000 && item.netSalary < 10000).length,
      between10000And20000: payrollItems.filter(item => item.netSalary >= 10000 && item.netSalary < 20000).length,
      between20000And30000: payrollItems.filter(item => item.netSalary >= 20000 && item.netSalary < 30000).length,
      above30000: payrollItems.filter(item => item.netSalary >= 30000).length,
    },
    employees: payrollItems,
  };

  return report;
}

export async function getPayrollStatistics(tenantId: string, months = 12) {
  const runs = await getPayrollRuns(tenantId, months);

  const stats = {
    totalRuns: runs.length,
    totalPayroll: runs.reduce((sum, run) => sum + Number(run.totalAmount), 0),
    averagePayroll: runs.length > 0 ? runs.reduce((sum, run) => sum + Number(run.totalAmount), 0) / runs.length : 0,
    wpsStatusBreakdown: {
      pending: runs.filter(r => r.wpsStatus === 'PENDING').length,
      generated: runs.filter(r => r.wpsStatus === 'GENERATED').length,
      submitted: runs.filter(r => r.wpsStatus === 'SUBMITTED').length,
    },
    monthlyTrend: runs.map(run => ({
      month: run.periodMonth,
      year: run.periodYear,
      totalAmount: Number(run.totalAmount),
      status: run.wpsStatus,
    })),
  };

  return stats;
}

export async function calculateYearEndBonus(employeeId: string, tenantId: string, year: number) {
  const [employee] = await db
    .select({
      basicSalary: employees.basicSalary,
      joinDate: employees.joinDate,
    })
    .from(employees)
    .where(and(eq(employees.id, employeeId), eq(employees.tenantId, tenantId)))
    .limit(1);

  if (!employee) {
    throw new Error('Employee not found');
  }

  const basicSalary = Number(employee.basicSalary);
  const joinDate = new Date(employee.joinDate);
  const yearEnd = new Date(year, 11, 31);

  // Calculate pro-rated bonus based on months worked in the year
  const monthsWorked = Math.min(12, Math.max(0, (yearEnd.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const bonus = basicSalary * 0.5 * (monthsWorked / 12); // 50% of monthly salary pro-rated

  return {
    employeeId,
    year,
    basicSalary,
    monthsWorked: Math.round(monthsWorked),
    bonus: bonus.toFixed(2),
  };
}

export async function calculateGOSIContributions(tenantId: string, periodMonth: number, periodYear: number) {
  const payrollItems = await calculatePayroll(tenantId, periodMonth, periodYear);

  const gosiContributions = {
    employeeContributions: payrollItems.reduce((sum, item) => sum + item.deductions.socialInsurance, 0),
    employerContributions: payrollItems.reduce((sum, item) => sum + item.deductions.socialInsurance * 2, 0), // Employer pays 2x employee rate
    totalContributions: 0,
  };

  gosiContributions.totalContributions = gosiContributions.employeeContributions + gosiContributions.employerContributions;

  return gosiContributions;
}
