'use server';

import { db } from '@/lib/db/db';
import { accounts, journalEntries, journalLines } from '@/lib/db/schema/accounting';
import { and, eq, gte, inArray, lt } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';

type MoneyInput = string | number | null | undefined;

function moneyToCents(value: MoneyInput) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  return Math.round(Number(value) * 100);
}

function centsToNumber(cents: number) {
  return Number((cents / 100).toFixed(2));
}

function monthRange(month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

export async function generateVatReturn(month: number, year: number) {
  try {
    const tenant = await requireTenant();
    const { start, end } = monthRange(month, year);

    const vatLines = await db
      .select({
        accountCode: accounts.code,
        debit: journalLines.debit,
        credit: journalLines.credit,
      })
      .from(journalLines)
      .innerJoin(accounts, eq(journalLines.accountId, accounts.id))
      .innerJoin(journalEntries, eq(journalLines.journalEntryId, journalEntries.id))
      .where(
        and(
          eq(journalLines.tenantId, tenant.id),
          eq(journalEntries.status, 'posted'),
          inArray(accounts.code, ['1300', '2100']),
          gte(journalEntries.entryDate, start),
          lt(journalEntries.entryDate, end)
        )
      );

    let outputVatCents = 0;
    let inputVatCents = 0;

    for (const line of vatLines) {
      const debitCents = moneyToCents(line.debit);
      const creditCents = moneyToCents(line.credit);

      if (line.accountCode === '2100') {
        outputVatCents += creditCents - debitCents;
      }

      if (line.accountCode === '1300') {
        inputVatCents += debitCents - creditCents;
      }
    }

    const netVatCents = outputVatCents - inputVatCents;
    const standardRate = 0.15;
    const position = netVatCents >= 0 ? 'payable' : 'recoverable';

    return {
      success: true,
      data: {
        tenant: {
          name: tenant.name,
          crn: tenant.crn,
          trn: tenant.trn || '',
          country: tenant.country || 'SA',
        },
        period: `${year}-${month.toString().padStart(2, '0')}`,
        periodLabel: start.toLocaleDateString('ar-SA-u-ca-gregory', { month: 'long', year: 'numeric' }),
        sales: {
          taxableAmount: centsToNumber(Math.round(outputVatCents / standardRate)),
          vat: centsToNumber(outputVatCents),
        },
        purchases: {
          taxableAmount: centsToNumber(Math.round(inputVatCents / standardRate)),
          vat: centsToNumber(inputVatCents),
        },
        netVatDue: centsToNumber(netVatCents),
        position,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate VAT return.';
    console.error('VAT Return Error:', error);
    return { success: false, error: message };
  }
}
