import { db } from '@/lib/db/db';
import { exchangeRates } from '@/lib/db/schema/accounting_reports';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export interface ExchangeRateInput {
  tenantId: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: Date;
  source?: string;
}

export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  effectiveDate: Date;
}

export async function addExchangeRate(input: ExchangeRateInput) {
  const [rate] = await db
    .insert(exchangeRates)
    .values({
      tenantId: input.tenantId,
      fromCurrency: input.fromCurrency.toUpperCase(),
      toCurrency: input.toCurrency.toUpperCase(),
      rate: input.rate.toFixed(6),
      effectiveDate: input.effectiveDate,
      source: input.source || 'manual',
    })
    .returning();

  return rate;
}

export async function getExchangeRates(
  tenantId: string,
  fromCurrency?: string,
  toCurrency?: string,
  limit = 50
) {
  const query = db
    .select()
    .from(exchangeRates)
    .where(eq(exchangeRates.tenantId, tenantId));

  if (fromCurrency) {
    query.where(and(eq(exchangeRates.tenantId, tenantId), eq(exchangeRates.fromCurrency, fromCurrency.toUpperCase())));
  }

  if (toCurrency) {
    query.where(and(
      eq(exchangeRates.tenantId, tenantId),
      toCurrency ? eq(exchangeRates.toCurrency, toCurrency.toUpperCase()) : undefined
    ));
  }

  return query.orderBy(desc(exchangeRates.effectiveDate)).limit(limit);
}

export async function getLatestExchangeRate(
  tenantId: string,
  fromCurrency: string,
  toCurrency: string
) {
  const [rate] = await db
    .select()
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.tenantId, tenantId),
        eq(exchangeRates.fromCurrency, fromCurrency.toUpperCase()),
        eq(exchangeRates.toCurrency, toCurrency.toUpperCase())
      )
    )
    .orderBy(desc(exchangeRates.effectiveDate))
    .limit(1);

  return rate;
}

export async function convertCurrency(
  tenantId: string,
  fromCurrency: string,
  toCurrency: string,
  amount: number,
  date?: Date
): Promise<CurrencyConversion> {
  // Same currency - no conversion needed
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return {
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      fromAmount: amount,
      toAmount: amount,
      rate: 1,
      effectiveDate: date || new Date(),
    };
  }

  // Get exchange rate
  const effectiveDate = date || new Date();
  const rate = await getLatestExchangeRate(tenantId, fromCurrency, toCurrency);

  if (!rate) {
    throw new Error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
  }

  const toAmount = amount * Number(rate.rate);

  return {
    fromCurrency: fromCurrency.toUpperCase(),
    toCurrency: toCurrency.toUpperCase(),
    fromAmount: amount,
    toAmount,
    rate: Number(rate.rate),
    effectiveDate: rate.effectiveDate,
  };
}

export async function convertAccountingData(
  tenantId: string,
  data: any,
  targetCurrency: string,
  date?: Date
) {
  const convertedData = { ...data };

  // Convert monetary values
  if (convertedData.financialStatements) {
    const { profitAndLoss, balanceSheet } = convertedData.financialStatements;

    if (profitAndLoss) {
      profitAndLoss.revenue = await convertValue(
        tenantId,
        profitAndLoss.revenue,
        'SAR',
        targetCurrency,
        date
      );
      profitAndLoss.expenses = await convertValue(
        tenantId,
        profitAndLoss.expenses,
        'SAR',
        targetCurrency,
        date
      );
      profitAndLoss.netIncome = await convertValue(
        tenantId,
        profitAndLoss.netIncome,
        'SAR',
        targetCurrency,
        date
      );
    }

    if (balanceSheet) {
      balanceSheet.assets = await convertValue(
        tenantId,
        balanceSheet.assets,
        'SAR',
        targetCurrency,
        date
      );
      balanceSheet.liabilities = await convertValue(
        tenantId,
        balanceSheet.liabilities,
        'SAR',
        targetCurrency,
        date
      );
      balanceSheet.equity = await convertValue(
        tenantId,
        balanceSheet.equity,
        'SAR',
        targetCurrency,
        date
      );
    }
  }

  if (convertedData.trialBalance) {
    for (const account of convertedData.trialBalance) {
      account.debit = await convertValue(
        tenantId,
        account.debit,
        'SAR',
        targetCurrency,
        date
      );
      account.credit = await convertValue(
        tenantId,
        account.credit,
        'SAR',
        targetCurrency,
        date
      );
      account.balance = await convertValue(
        tenantId,
        account.balance,
        'SAR',
        targetCurrency,
        date
      );
    }
  }

  return convertedData;
}

async function convertValue(
  tenantId: string,
  value: string,
  fromCurrency: string,
  toCurrency: string,
  date?: Date
): Promise<string> {
  const amount = Number(value);
  if (amount === 0) return '0.00';

  const conversion = await convertCurrency(
    tenantId,
    fromCurrency,
    toCurrency,
    amount,
    date
  );

  return conversion.toAmount.toFixed(2);
}

export async function deleteExchangeRate(rateId: string, tenantId: string) {
  await db
    .delete(exchangeRates)
    .where(and(eq(exchangeRates.id, rateId), eq(exchangeRates.tenantId, tenantId)));
}

export async function getSupportedCurrencies(tenantId: string) {
  const rates = await getExchangeRates(tenantId);
  const currencies = new Set<string>();

  for (const rate of rates) {
    currencies.add(rate.fromCurrency);
    currencies.add(rate.toCurrency);
  }

  return Array.from(currencies).sort();
}
