import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  calculateInventoryValuation,
  getInventoryValuation,
  getValuationHistory,
  getTotalInventoryValue,
  compareValuationMethods,
} from '@/lib/inventory';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'valuation') {
      const productId = searchParams.get('productId');
      const warehouseId = searchParams.get('warehouseId');
      const method = searchParams.get('method') as 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE';

      if (!productId || !warehouseId || !method) {
        return NextResponse.json({ success: false, error: 'Product ID, Warehouse ID, and Method are required' }, { status: 400 });
      }

      const valuation = await calculateInventoryValuation({
        tenantId: tenant.id,
        productId,
        warehouseId,
        valuationMethod: method,
        userId: 'system',
      });

      return NextResponse.json({ success: true, data: valuation });
    }

    if (action === 'valuation-history') {
      const productId = searchParams.get('productId');
      const warehouseId = searchParams.get('warehouseId');
      const limit = Number(searchParams.get('limit')) || 12;

      if (!productId || !warehouseId) {
        return NextResponse.json({ success: false, error: 'Product ID and Warehouse ID are required' }, { status: 400 });
      }

      const history = await getValuationHistory(productId, warehouseId, tenant.id, limit);
      return NextResponse.json({ success: true, data: history });
    }

    if (action === 'total-value') {
      const totalValue = await getTotalInventoryValue(tenant.id);
      return NextResponse.json({ success: true, data: totalValue });
    }

    if (action === 'compare-methods') {
      const productId = searchParams.get('productId');
      const warehouseId = searchParams.get('warehouseId');

      if (!productId || !warehouseId) {
        return NextResponse.json({ success: false, error: 'Product ID and Warehouse ID are required' }, { status: 400 });
      }

      const comparison = await compareValuationMethods(productId, warehouseId, tenant.id);
      return NextResponse.json({ success: true, data: comparison });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
