import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { journalEntries, journalLines } from '@/lib/db/schema/accounting';
import { createJournalEntryOnce } from './create-journal';

export async function reverseJournalEntry(tenantId: string, journalEntryId: string) {
  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.tenantId, tenantId), eq(journalEntries.id, journalEntryId)))
    .limit(1);

  if (!entry) {
    throw new Error('Journal entry not found.');
  }

  if (entry.sourceType === 'journal.reversal') {
    throw new Error('Reversal entries cannot be reversed from this action.');
  }

  const lines = await db
    .select()
    .from(journalLines)
    .where(and(eq(journalLines.tenantId, tenantId), eq(journalLines.journalEntryId, journalEntryId)))
    .orderBy(journalLines.lineNumber);

  if (lines.length < 2) {
    throw new Error('Journal entry has no reversible lines.');
  }

  return createJournalEntryOnce({
    tenantId,
    entryDate: new Date(),
    memo: `Reversal of ${entry.entryNumber}${entry.memo ? ` - ${entry.memo}` : ''}`,
    sourceType: 'journal.reversal',
    sourceId: entry.id,
    currency: entry.currency || 'SAR',
    lines: lines.map((line) => ({
      accountId: line.accountId,
      description: `Reversal: ${line.description || entry.entryNumber}`,
      debit: line.credit,
      credit: line.debit,
      entityType: line.entityType || undefined,
      entityId: line.entityId || undefined,
    })),
  });
}
