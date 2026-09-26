import { NextRequest, NextResponse } from 'next/server';
import { requireTenant } from '@/lib/auth';
import {
  generateForecast,
  getSeasonalPatterns,
  generateBudgetRecommendations,
  getCashFlowForecast,
} from '@/lib/accounting';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'forecast') {
      const periods = Number(searchParams.get('periods')) || 3;

      const forecast = await generateForecast(tenant.id, periods);
      return NextResponse.json({ success: true, data: forecast });
    }

    if (action === 'seasonal-patterns') {
      const patterns = await getSeasonalPatterns(tenant.id);
      return NextResponse.json({ success: true, data: patterns });
    }

    if (action === 'budget-recommendations') {
      const fiscalYear = Number(searchParams.get('fiscalYear')) || new Date().getFullYear();

      const recommendations = await generateBudgetRecommendations(tenant.id, fiscalYear);
      return NextResponse.json({ success: true, data: recommendations });
    }

    if (action === 'cash-flow-forecast') {
      const weeks = Number(searchParams.get('weeks')) || 12;

      const forecast = await getCashFlowForecast(tenant.id, weeks);
      return NextResponse.json({ success: true, data: forecast });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
