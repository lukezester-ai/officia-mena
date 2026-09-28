import { db } from '@/lib/db/db';
import { hrAnalytics } from '@/lib/db/schema/hr_extensions';
import { employees } from '@/lib/db/schema/hr';
import { eq, and, desc } from 'drizzle-orm';

export interface AnalyticsInput {
  tenantId: string;
  periodType: 'monthly' | 'quarterly' | 'annual';
  periodStart: Date;
  periodEnd: Date;
}

export async function generateHRAnalytics(input: AnalyticsInput) {
  const employeeData = await db
    .select({
      id: employees.id,
      joinDate: employees.joinDate,
      basicSalary: employees.basicSalary,
      status: employees.status,
    })
    .from(employees)
    .where(eq(employees.tenantId, input.tenantId));

  const totalEmployees = employeeData.length;
  const activeEmployees = employeeData.filter(e => e.status === 'ACTIVE').length;

  // Calculate new hires (employees who joined in the period)
  const newHires = employeeData.filter(e => {
    const joinDate = new Date(e.joinDate);
    return joinDate >= input.periodStart && joinDate <= input.periodEnd;
  }).length;

  // Calculate terminations (simplified - would need termination date field)
  const terminations = 0;

  // Calculate turnover rate
  const turnoverRate = activeEmployees > 0 ? (terminations / activeEmployees * 100) : 0;

  // Calculate average tenure (in years)
  const now = new Date();
  const tenures = employeeData.map(e => {
    const joinDate = new Date(e.joinDate);
    const years = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return years;
  });
  const averageTenure = tenures.length > 0 ? tenures.reduce((sum, t) => sum + t, 0) / tenures.length : 0;

  // Calculate total payroll and average salary
  const totalPayroll = employeeData.reduce((sum, e) => sum + Number(e.basicSalary), 0);
  const averageSalary = activeEmployees > 0 ? totalPayroll / activeEmployees : 0;

  const analyticsData = {
    totalEmployees,
    activeEmployees,
    newHires,
    terminations,
    turnoverRate: turnoverRate.toFixed(2),
    averageTenure: averageTenure.toFixed(2),
    totalPayroll: totalPayroll.toFixed(2),
    averageSalary: averageSalary.toFixed(2),
    byStatus: {} as Record<string, number>,
    byDepartment: {} as Record<string, number>, // Would need department field
    salaryDistribution: {
      min: 0,
      max: 0,
      median: 0,
      average: averageSalary.toFixed(2),
    },
  };

  // Group by status
  for (const employee of employeeData) {
    analyticsData.byStatus[employee.status] = (analyticsData.byStatus[employee.status] || 0) + 1;
  }

  // Calculate salary distribution
  const salaries = employeeData.map(e => Number(e.basicSalary)).sort((a, b) => a - b);
  if (salaries.length > 0) {
    analyticsData.salaryDistribution.min = salaries[0];
    analyticsData.salaryDistribution.max = salaries[salaries.length - 1];
    analyticsData.salaryDistribution.median = salaries[Math.floor(salaries.length / 2)];
  }

  const [analytics] = await db
    .insert(hrAnalytics)
    .values({
      tenantId: input.tenantId,
      periodType: input.periodType,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      totalEmployees,
      newHires,
      terminations,
      turnoverRate: turnoverRate.toFixed(2),
      averageTenure: averageTenure.toFixed(2),
      totalPayroll: totalPayroll.toFixed(2),
      averageSalary: averageSalary.toFixed(2),
      data: analyticsData as any,
    })
    .returning();

  return analytics;
}

export async function getHRAnalytics(tenantId: string, limit = 12) {
  return db
    .select()
    .from(hrAnalytics)
    .where(eq(hrAnalytics.tenantId, tenantId))
    .orderBy(desc(hrAnalytics.periodStart))
    .limit(limit);
}

export async function getAnalyticsSnapshot(tenantId: string, snapshotId: string) {
  const [analytics] = await db
    .select()
    .from(hrAnalytics)
    .where(and(eq(hrAnalytics.id, snapshotId), eq(hrAnalytics.tenantId, tenantId)))
    .limit(1);

  return analytics;
}

export async function comparePeriods(tenantId: string, period1Id: string, period2Id: string) {
  const [period1] = await getAnalyticsSnapshot(tenantId, period1Id);
  const [period2] = await getAnalyticsSnapshot(tenantId, period2Id);

  if (!period1 || !period2) {
    throw new Error('One or both analytics snapshots not found');
  }

  const p1Data = period1.data as any;
  const p2Data = period2.data as any;

  const comparison = {
    totalEmployees: {
      period1: p1Data.totalEmployees,
      period2: p2Data.totalEmployees,
      variance: p2Data.totalEmployees - p1Data.totalEmployees,
      percentage: p1Data.totalEmployees > 0
        ? ((p2Data.totalEmployees - p1Data.totalEmployees) / p1Data.totalEmployees * 100).toFixed(2)
        : '0.00',
    },
    totalPayroll: {
      period1: p1Data.totalPayroll,
      period2: p2Data.totalPayroll,
      variance: (Number(p2Data.totalPayroll) - Number(p1Data.totalPayroll)).toFixed(2),
      percentage: Number(p1Data.totalPayroll) > 0
        ? ((Number(p2Data.totalPayroll) - Number(p1Data.totalPayroll)) / Number(p1Data.totalPayroll) * 100).toFixed(2)
        : '0.00',
    },
    turnoverRate: {
      period1: p1Data.turnoverRate,
      period2: p2Data.turnoverRate,
      variance: (Number(p2Data.turnoverRate) - Number(p1Data.turnoverRate)).toFixed(2),
    },
    averageTenure: {
      period1: p1Data.averageTenure,
      period2: p2Data.averageTenure,
      variance: (Number(p2Data.averageTenure) - Number(p1Data.averageTenure)).toFixed(2),
    },
  };

  return { period1, period2, comparison };
}

export async function getEmployeeRetentionRate(tenantId: string, months = 12) {
  const analytics = await getHRAnalytics(tenantId, months);

  const retentionRates = analytics.map(a => {
    const data = a.data as any;
    const retentionRate = data.totalEmployees > 0
      ? ((data.totalEmployees - data.terminations) / data.totalEmployees * 100)
      : 100;

    return {
      period: a.periodStart.toISOString().split('T')[0],
      retentionRate: retentionRate.toFixed(2),
      totalEmployees: data.totalEmployees,
      terminations: data.terminations,
    };
  });

  return retentionRates;
}

export async function getPayrollTrend(tenantId: string, months = 12) {
  const analytics = await getHRAnalytics(tenantId, months);

  const trend = analytics.map(a => {
    const data = a.data as any;

    return {
      period: a.periodStart.toISOString().split('T')[0],
      totalPayroll: data.totalPayroll,
      averageSalary: data.averageSalary,
      totalEmployees: data.totalEmployees,
    };
  });

  return trend;
}

export async function getDepartmentBreakdown(tenantId: string) {
  // This would require department field in employees table
  // For now, return mock data
  return [
    { department: 'Engineering', count: 25, averageSalary: '15000.00' },
    { department: 'Sales', count: 18, averageSalary: '12000.00' },
    { department: 'Marketing', count: 12, averageSalary: '11000.00' },
    { department: 'HR', count: 8, averageSalary: '9000.00' },
    { department: 'Finance', count: 10, averageSalary: '13000.00' },
  ];
}

export async function getHeadcountForecast(tenantId: string, months = 6) {
  const currentAnalytics = await getHRAnalytics(tenantId, 1);
  const currentData = currentAnalytics[0]?.data as any || { totalEmployees: 0 };

  const forecast = [];

  for (let i = 1; i <= months; i++) {
    const forecastDate = new Date();
    forecastDate.setMonth(forecastDate.getMonth() + i);

    // Simple forecasting based on current trends
    const growthRate = 0.02; // 2% monthly growth
    const forecastedHeadcount = Math.round(currentData.totalEmployees * Math.pow(1 + growthRate, i));

    forecast.push({
      month: forecastDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      headcount: forecastedHeadcount,
      growth: (growthRate * 100).toFixed(2),
    });
  }

  return forecast;
}

export async function deleteAnalyticsSnapshot(snapshotId: string, tenantId: string) {
  await db
    .delete(hrAnalytics)
    .where(and(eq(hrAnalytics.id, snapshotId), eq(hrAnalytics.tenantId, tenantId)));
}
