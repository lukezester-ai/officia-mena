import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { journalEntries, journalLines } from '@/lib/db/schema/accounting';
import { CreateJournalEntryInput, moneyToCents, centsToMoney, nextEntryNumber } from '../utils';

export async function createJournalEntry(input: CreateJournalEntryInput) {
  if (input.lines.length < 2) {
    throw new Error('A journal entry requires at least two lines.');
  }

  const normalizedLines = input.lines.map((line, index) => {
    const debitCents = moneyToCents(line.debit);
    const creditCents = moneyToCents(line.credit);

    if (debitCents < 0 || creditCents < 0) {
      throw new Error('Journal line amounts cannot be negative.');
    }

    if ((debitCents === 0 && creditCents === 0) || (debitCents > 0 && creditCents > 0)) {
      throw new Error('Each journal line must have either a debit or a credit amount.');
    }

    return {
      ...line,
      lineNumber: index + 1,
      debitCents,
      creditCents,
    };
  });

  const currency = input.currency || 'SAR';
  const SUPPORTED_CURRENCIES = ['SAR', 'AED', 'BHD', 'QAR', 'OMR', 'KWD', 'USD', 'EUR'];
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw new Error(`Unsupported currency: ${currency}. Supported: ${SUPPORTED_CURRENCIES.join(', ')}.`);
  }

  const totalDebit = normalizedLines.reduce((sum, line) => sum + line.debitCents, 0);
  const totalCredit = normalizedLines.reduce((sum, line) => sum + line.creditCents, 0);

  if (totalDebit === 0 || totalCredit === 0 || totalDebit !== totalCredit) {
    throw new Error('Journal entry is not balanced: total debits must equal total credits.');
  }

  const entryNumber = nextEntryNumber();
  const status = input.status || 'posted';
  const [entry] = await db.transaction(async (tx) => {
    const insertedEntries = await tx
      .insert(journalEntries)
      .values({
        tenantId: input.tenantId,
        entryNumber,
        entryDate: input.entryDate || new Date(),
        memo: input.memo,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        status,
        currency,
        totalDebit: centsToMoney(totalDebit),
        totalCredit: centsToMoney(totalCredit),
        postedAt: status === 'posted' ? new Date() : null,
        createdBy: input.createdBy,
      })
      .returning();

    await tx.insert(journalLines).values(
      normalizedLines.map((line) => ({
        tenantId: input.tenantId,
        journalEntryId: insertedEntries[0].id,
        accountId: line.accountId,
        lineNumber: line.lineNumber,
        description: line.description,
        debit: centsToMoney(line.debitCents),
        credit: centsToMoney(line.creditCents),
        currency,
        entityType: line.entityType,
        entityId: line.entityId,
      }))
    );

    return insertedEntries;
  });

  return entry;
}

export async function findJournalEntryBySource(tenantId: string, sourceType: string, sourceId: string) {
  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.tenantId, tenantId),
        eq(journalEntries.sourceType, sourceType),
        eq(journalEntries.sourceId, sourceId)
      )
    )
    .limit(1);

  return entry || null;
}

export async function createJournalEntryOnce(input: CreateJournalEntryInput) {
  if (input.sourceType && input.sourceId) {
    const existing = await findJournalEntryBySource(input.tenantId, input.sourceType, input.sourceId);
    if (existing) {
      return existing;
    }
  }

  return createJournalEntry(input);
}
