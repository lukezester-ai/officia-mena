import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  addCurrencySetting,
  getCurrencySettings,
  getDefaultCurrency,
  updateCurrencySetting,
  deleteCurrencySetting,
  convertInvoiceCurrency,
  getInvoiceCurrenciesInUse,
  createMultiCurrencyInvoice,
  getCurrencySummary,
  initializeDefaultCurrencies,
} from '@/lib/invoicing';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const settings = await getCurrencySettings(tenant.id);
      return NextResponse.json({ success: true, data: settings });
    }

    if (action === 'default') {
      const setting = await getDefaultCurrency(tenant.id);
      return NextResponse.json({ success: true, data: setting });
    }

    if (action === 'in-use') {
      const currencies = await getInvoiceCurrenciesInUse(tenant.id);
      return NextResponse.json({ success: true, data: currencies });
    }

    if (action === 'summary') {
      const summary = await getCurrencySummary(tenant.id);
      return NextResponse.json({ success: true, data: summary });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'add') {
      const { currency, isDefault, vatRate, exchangeRate } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const setting = await addCurrencySetting({
        tenantId: tenant.id,
        currency,
        isDefault,
        vatRate,
        exchangeRate,
        userId,
      });

      return NextResponse.json({ success: true, data: setting });
    }

    if (action === 'convert') {
      const { invoiceId, targetCurrency } = body;

      const result = await convertInvoiceCurrency(invoiceId, targetCurrency, tenant.id);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'create-multi-currency') {
      const { baseCurrency, targetCurrency, invoiceData } = body;

      const result = await createMultiCurrencyInvoice(tenant.id, baseCurrency, targetCurrency, invoiceData);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'initialize-default') {
      const userId = (await requireTenant()).id; // Would need actual user ID

      const currencies = await initializeDefaultCurrencies(tenant.id, userId);
      return NextResponse.json({ success: true, data: currencies });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'update') {
      const { settingId, updates } = body;

      const setting = await updateCurrencySetting(settingId, tenant.id, updates);
      return NextResponse.json({ success: true, data: setting });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const settingId = searchParams.get('settingId');

    if (!settingId) {
      return NextResponse.json({ success: false, error: 'Setting ID is required' }, { status: 400 });
    }

    await deleteCurrencySetting(settingId, tenant.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
