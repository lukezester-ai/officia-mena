import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  addExchangeRate,
  getExchangeRates,
  getLatestExchangeRate,
  convertCurrency,
  convertAccountingData,
  deleteExchangeRate,
  getSupportedCurrencies,
} from '@/lib/accounting';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const fromCurrency = searchParams.get('fromCurrency') || undefined;
      const toCurrency = searchParams.get('toCurrency') || undefined;
      const limit = Number(searchParams.get('limit')) || 50;

      const rates = await getExchangeRates(tenant.id, fromCurrency, toCurrency, limit);
      return NextResponse.json({ success: true, data: rates });
    }

    if (action === 'latest') {
      const fromCurrency = searchParams.get('fromCurrency');
      const toCurrency = searchParams.get('toCurrency');

      if (!fromCurrency || !toCurrency) {
        return NextResponse.json({ success: false, error: 'From and to currencies are required' }, { status: 400 });
      }

      const rate = await getLatestExchangeRate(tenant.id, fromCurrency, toCurrency);
      return NextResponse.json({ success: true, data: rate });
    }

    if (action === 'convert') {
      const fromCurrency = searchParams.get('fromCurrency');
      const toCurrency = searchParams.get('toCurrency');
      const amount = Number(searchParams.get('amount'));
      const date = searchParams.get('date') ? new Date(searchParams.get('date')) : undefined;

      if (!fromCurrency || !toCurrency || isNaN(amount)) {
        return NextResponse.json({ success: false, error: 'Invalid conversion parameters' }, { status: 400 });
      }

      const conversion = await convertCurrency(tenant.id, fromCurrency, toCurrency, amount, date);
      return NextResponse.json({ success: true, data: conversion });
    }

    if (action === 'supported-currencies') {
      const currencies = await getSupportedCurrencies(tenant.id);
      return NextResponse.json({ success: true, data: currencies });
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

    if (action === 'add-rate') {
      const { fromCurrency, toCurrency, rate, effectiveDate, source } = body;

      const exchangeRate = await addExchangeRate({
        tenantId: tenant.id,
        fromCurrency,
        toCurrency,
        rate,
        effectiveDate: new Date(effectiveDate),
        source,
      });

      return NextResponse.json({ success: true, data: exchangeRate });
    }

    if (action === 'convert-data') {
      const { data, targetCurrency, date } = body;

      const convertedData = await convertAccountingData(
        tenant.id,
        data,
        targetCurrency,
        date ? new Date(date) : undefined
      );

      return NextResponse.json({ success: true, data: convertedData });
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
    const rateId = searchParams.get('rateId');

    if (!rateId) {
      return NextResponse.json({ success: false, error: 'Rate ID is required' }, { status: 400 });
    }

    await deleteExchangeRate(rateId, tenant.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
