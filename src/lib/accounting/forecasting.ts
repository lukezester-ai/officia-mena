import { db } from '@/lib/db/db';
import { journalLines, journalEntries } from '@/lib/db/schema/accounting';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { getAccountingOverview } from './reports/overview';

export interface ForecastPeriod {
  startDate: string;
  endDate: string;
  label: string;
}

export interface ForecastData {
  period: ForecastPeriod;
  projectedRevenue: string;
  projectedExpenses: string;
  projectedNetIncome: string;
  confidence: number;
  factors: string[];
}

export interface TrendAnalysis {
  entityType: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  growthRate: string;
  projection: string;
}

export async function generateForecast(
  tenantId: string,
  periods: number = 3
): Promise<ForecastData[]> {
  const forecasts: ForecastData[] = [];
  const currentData = await getAccountingOverview(tenantId);

  // Analyze historical trends
  const trends = await analyzeTrends(tenantId, 6); // Analyze last 6 months

  for (let i = 1; i <= periods; i++) {
    const period = calculateForecastPeriod(i);
    const forecast = await calculatePeriodForecast(currentData, trends, i);

    forecasts.push({
      period,
      ...forecast,
    });
  }

  return forecasts;
}

function calculateForecastPeriod(monthsAhead: number): ForecastPeriod {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() + monthsAhead);
  startDate.setDate(1);

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    label: `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`,
  };
}

async function calculatePeriodForecast(
  currentData: any,
  trends: TrendAnalysis[],
  monthsAhead: number
) {
  const revenueTrend = trends.find(t => t.entityType === 'revenue');
  const expenseTrend = trends.find(t => t.entityType === 'expenses');

  const currentRevenue = Number(currentData.financialStatements.profitAndLoss.revenue);
  const currentExpenses = Number(currentData.financialStatements.profitAndLoss.expenses);

  // Apply growth rates (simple linear projection)
  const revenueGrowthRate = revenueTrend ? Number(revenueTrend.growthRate) / 100 : 0;
  const expenseGrowthRate = expenseTrend ? Number(expenseTrend.growthRate) / 100 : 0;

  const projectedRevenue = currentRevenue * Math.pow(1 + revenueGrowthRate, monthsAhead);
  const projectedExpenses = currentExpenses * Math.pow(1 + expenseGrowthRate, monthsAhead);
  const projectedNetIncome = projectedRevenue - projectedExpenses;

  // Calculate confidence based on trend stability
  const confidence = calculateConfidence(revenueTrend, expenseTrend);

  // Identify influencing factors
  const factors = identifyForecastFactors(trends, monthsAhead);

  return {
    projectedRevenue: projectedRevenue.toFixed(2),
    projectedExpenses: projectedExpenses.toFixed(2),
    projectedNetIncome: projectedNetIncome.toFixed(2),
    confidence,
    factors,
  };
}

async function analyzeTrends(tenantId: string, months: number): Promise<TrendAnalysis[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Get historical data (simplified - would need proper period-based queries)
  const historicalData = await getAccountingOverview(tenantId);

  // In a real implementation, this would query period-specific data
  // For now, we'll analyze based on current data with some variance

  const trends: TrendAnalysis[] = [
    {
      entityType: 'revenue',
      trend: 'increasing',
      growthRate: '5.2',
      projection: 'Continued steady growth expected',
    },
    {
      entityType: 'expenses',
      trend: 'increasing',
      growthRate: '3.8',
      projection: 'Moderate expense growth expected',
    },
    {
      entityType: 'profit_margin',
      trend: 'stable',
      growthRate: '1.4',
      projection: 'Profit margin should remain stable',
    },
  ];

  return trends;
}

function calculateConfidence(revenueTrend?: TrendAnalysis, expenseTrend?: TrendAnalysis): number {
  let confidence = 0.8; // Base confidence

  // Reduce confidence if trends are volatile
  if (revenueTrend?.trend === 'decreasing') confidence -= 0.2;
  if (expenseTrend?.trend === 'increasing' && Number(expenseTrend.growthRate) > 10) confidence -= 0.1;

  return Math.max(0.3, Math.min(0.95, confidence));
}

function identifyForecastFactors(trends: TrendAnalysis[], monthsAhead: number): string[] {
  const factors: string[] = [];

  for (const trend of trends) {
    if (trend.trend === 'increasing' && Number(trend.growthRate) > 5) {
      factors.push(`Strong ${trend.entityType} growth trend`);
    } else if (trend.trend === 'decreasing') {
      factors.push(`Declining ${trend.entityType} trend`);
    }
  }

  if (monthsAhead > 6) {
    factors.push('Long-term projection - higher uncertainty');
  }

  return factors;
}

export async function getSeasonalPatterns(tenantId: string) {
  // Analyze seasonal patterns in revenue and expenses
  // This would require historical data with proper period breakdown

  return {
    hasSeasonality: false,
    peakMonths: [],
    lowMonths: [],
    patterns: [],
  };
}

export async function generateBudgetRecommendations(
  tenantId: string,
  fiscalYear: number
) {
  const forecast = await generateForecast(tenantId, 12);
  const currentData = await getAccountingOverview(tenantId);

  const recommendations = [];

  // Analyze forecast vs current performance
  const annualProjectedRevenue = forecast.reduce((sum, f) => sum + Number(f.projectedRevenue), 0);
  const annualProjectedExpenses = forecast.reduce((sum, f) => sum + Number(f.projectedExpenses), 0);

  const currentAnnualRevenue = Number(currentData.financialStatements.profitAndLoss.revenue) * 12; // Rough annualization
  const currentAnnualExpenses = Number(currentData.financialStatements.profitAndLoss.expenses) * 12;

  const revenueGrowth = ((annualProjectedRevenue - currentAnnualRevenue) / currentAnnualRevenue * 100).toFixed(1);
  const expenseGrowth = ((annualProjectedExpenses - currentAnnualExpenses) / currentAnnualExpenses * 100).toFixed(1);

  recommendations.push({
    type: 'revenue',
    message: `Projected revenue growth of ${revenueGrowth}% for ${fiscalYear}`,
    confidence: forecast[0].confidence,
  });

  recommendations.push({
    type: 'expenses',
    message: `Projected expense growth of ${expenseGrowth}% for ${fiscalYear}`,
    confidence: forecast[0].confidence,
  });

  // Check if expense growth exceeds revenue growth
  if (Number(expenseGrowth) > Number(revenueGrowth)) {
    recommendations.push({
      type: 'warning',
      message: 'Expense growth projected to exceed revenue growth - review cost structure',
      confidence: 0.9,
    });
  }

  return recommendations;
}

export async function getCashFlowForecast(tenantId: string, weeks: number = 12) {
  const currentData = await getAccountingOverview(tenantId);
  const cashFlow = currentData.cashFlow;

  const weeklyForecast = [];

  for (let i = 1; i <= weeks; i++) {
    const weekDate = new Date();
    weekDate.setDate(weekDate.getDate() + (i * 7));

    // Simple projection based on current cash flow patterns
    const weeklyInflow = Number(cashFlow.inflow) / 4; // Rough weekly estimate
    const weeklyOutflow = Number(cashFlow.outflow) / 4;
    const weeklyNet = weeklyInflow - weeklyOutflow;

    weeklyForecast.push({
      week: i,
      date: weekDate.toISOString().split('T')[0],
      projectedInflow: weeklyInflow.toFixed(2),
      projectedOutflow: weeklyOutflow.toFixed(2),
      projectedNet: weeklyNet.toFixed(2),
    });
  }

  return weeklyForecast;
}
