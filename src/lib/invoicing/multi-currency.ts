import { db } from '@/lib/db/db';
import { invoiceCurrencySettings, invoices } from '@/lib/db/schema/invoice_extensions';
import { eq, and, desc } from 'drizzle-orm';

export interface CurrencySettingsInput {
  tenantId: string;
  currency: string;
  isDefault: boolean;
  vatRate?: number;
  exchangeRate?: number;
  userId: string;
}

export async function addCurrencySetting(input: CurrencySettingsInput) {
  // If setting as default, remove default from other currencies
  if (input.isDefault) {
    await db
      .update(invoiceCurrencySettings)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(invoiceCurrencySettings.tenantId, input.tenantId));
  }

  const [setting] = await db
    .insert(invoiceCurrencySettings)
    .values({
      tenantId: input.tenantId,
      currency: input.currency.toUpperCase(),
      isDefault: input.isDefault,
      vatRate: input.vatRate?.toFixed(2) || '15.00',
      exchangeRate: input.exchangeRate?.toFixed(6) || '1.000000',
      lastUpdated: new Date(),
      createdByUserId: input.userId,
    })
    .returning();

  return setting;
}

export async function getCurrencySettings(tenantId: string) {
  return db
    .select()
    .from(invoiceCurrencySettings)
    .where(eq(invoiceCurrencySettings.tenantId, tenantId))
    .orderBy(desc(invoiceCurrencySettings.isDefault), invoiceCurrencySettings.currency);
}

export async function getDefaultCurrency(tenantId: string) {
  const [setting] = await db
    .select()
    .from(invoiceCurrencySettings)
    .where(and(eq(invoiceCurrencySettings.tenantId, tenantId), eq(invoiceCurrencySettings.isDefault, true)))
    .limit(1);

  return setting;
}

export async function updateCurrencySetting(
  settingId: string,
  tenantId: string,
  updates: Partial<{
    isDefault: boolean;
    vatRate: number;
    exchangeRate: number;
  }>
) {
  // If setting as default, remove default from other currencies
  if (updates.isDefault) {
    await db
      .update(invoiceCurrencySettings)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(invoiceCurrencySettings.tenantId, tenantId));
  }

  const [setting] = await db
    .update(invoiceCurrencySettings)
    .set({
      ...updates,
      vatRate: updates.vatRate?.toFixed(2),
      exchangeRate: updates.exchangeRate?.toFixed(6),
      lastUpdated: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(invoiceCurrencySettings.id, settingId), eq(invoiceCurrencySettings.tenantId, tenantId)))
    .returning();

  return setting;
}

export async function deleteCurrencySetting(settingId: string, tenantId: string) {
  const setting = await getCurrencySettings(tenantId);
  const toDelete = setting.find(s => s.id === settingId);

  if (toDelete?.isDefault) {
    throw new Error('Cannot delete default currency setting');
  }

  await db
    .delete(invoiceCurrencySettings)
    .where(and(eq(invoiceCurrencySettings.id, settingId), eq(invoiceCurrencySettings.tenantId, tenantId)));
}

export async function convertInvoiceCurrency(
  invoiceId: string,
  targetCurrency: string,
  tenantId: string
) {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)))
    .limit(1);

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const sourceCurrency = invoice.currency;
  if (sourceCurrency === targetCurrency) {
    return { invoice, converted: false };
  }

  // Get exchange rate
  const [sourceSetting] = await db
    .select()
    .from(invoiceCurrencySettings)
    .where(and(
      eq(invoiceCurrencySettings.tenantId, tenantId),
      eq(invoiceCurrencySettings.currency, sourceCurrency)
    ))
    .limit(1);

  const [targetSetting] = await db
    .select()
    .from(invoiceCurrencySettings)
    .where(and(
      eq(invoiceCurrencySettings.tenantId, tenantId),
      eq(invoiceCurrencySettings.currency, targetCurrency)
    ))
    .limit(1);

  if (!sourceSetting || !targetSetting) {
    throw new Error('Currency settings not found for conversion');
  }

  // Calculate exchange rate (cross-rate via base currency)
  const baseRate = Number(sourceSetting.exchangeRate);
  const targetRate = Number(targetSetting.exchangeRate);
  const exchangeRate = targetRate / baseRate;

  // Convert amounts
  const convertedSubtotal = (Number(invoice.subtotal) * exchangeRate).toFixed(2);
  const convertedVatAmount = (Number(invoice.vatAmount) * exchangeRate).toFixed(2);
  const convertedTotalAmount = (Number(invoice.totalAmount) * exchangeRate).toFixed(2);

  // Update invoice
  const [updated] = await db
    .update(invoices)
    .set({
      currency: targetCurrency,
      subtotal: convertedSubtotal,
      vatAmount: convertedVatAmount,
      totalAmount: convertedTotalAmount,
      vatRate: targetSetting.vatRate,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId))
    .returning();

  return { invoice: updated, converted: true, exchangeRate };
}

export async function getInvoiceCurrenciesInUse(tenantId: string) {
  const invoices = await db
    .select({ currency: invoices.currency })
    .from(invoices)
    .where(eq(invoices.tenantId, tenantId));

  const currencyCount = new Map<string, number>();
  for (const invoice of invoices) {
    currencyCount.set(invoice.currency, (currencyCount.get(invoice.currency) || 0) + 1);
  }

  return Array.from(currencyCount.entries()).map(([currency, count]) => ({
    currency,
    count,
  }));
}

export async function createMultiCurrencyInvoice(
  tenantId: string,
  baseCurrency: string,
  targetCurrency: string,
  invoiceData: any
) {
  // Create invoice in base currency first
  const [invoice] = await db
    .insert(invoices)
    .values({
      tenantId,
      invoiceNumber: invoiceData.invoiceNumber,
      issueDate: new Date(invoiceData.issueDate),
      dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null,
      clientName: invoiceData.clientName,
      clientCrn: invoiceData.clientCrn,
      clientTrn: invoiceData.clientTrn,
      clientAddress: invoiceData.clientAddress,
      subtotal: invoiceData.subtotal,
      vatRate: invoiceData.vatRate,
      vatAmount: invoiceData.vatAmount,
      totalAmount: invoiceData.totalAmount,
      currency: baseCurrency,
      status: 'draft',
      items: JSON.stringify(invoiceData.items || []),
    })
    .returning();

  // If target currency is different, convert
  if (baseCurrency !== targetCurrency) {
    const converted = await convertInvoiceCurrency(invoice.id, targetCurrency, tenantId);
    return { invoice: converted.invoice, converted: true };
  }

  return { invoice, converted: false };
}

export async function getCurrencySummary(tenantId: string) {
  const settings = await getCurrencySettings(tenantId);
  const inUse = await getInvoiceCurrenciesInUse(tenantId);

  const summary = {
    totalCurrencies: settings.length,
    defaultCurrency: settings.find(s => s.isDefault)?.currency || 'SAR',
    inUse: inUse.map(c => c.currency),
    settings: settings.map(s => ({
      currency: s.currency,
      isDefault: s.isDefault,
      vatRate: s.vatRate,
      exchangeRate: s.exchangeRate,
      lastUpdated: s.lastUpdated,
    })),
  };

  return summary;
}

export async function initializeDefaultCurrencies(tenantId: string, userId: string) {
  const defaultCurrencies = [
    { currency: 'SAR', isDefault: true, vatRate: 15.00, exchangeRate: 1.000000 },
    { currency: 'AED', isDefault: false, vatRate: 5.00, exchangeRate: 0.980000 },
    { currency: 'USD', isDefault: false, vatRate: 0.00, exchangeRate: 0.270000 },
    { currency: 'EUR', isDefault: false, vatRate: 0.00, exchangeRate: 0.250000 },
  ];

  const created = [];

  for (const currencyData of defaultCurrencies) {
    try {
      const setting = await addCurrencySetting({
        tenantId,
        ...currencyData,
        userId,
      });
      created.push(setting);
    } catch (error) {
      // Skip if already exists
    }
  }

  return created;
}
