import { asc, eq } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { csvDownloadResponse } from '@/lib/accounting/csv';
import { db } from '@/lib/db/db';
import { accounts, journalEntries, journalLines } from '@/lib/db/schema/accounting';
import { getErrorMessage } from '@/lib/errors';

export async function GET() {
  try {
    const tenant = await requireTenant();
    const lines = await db
      .select({
        entryDate: journalEntries.entryDate,
        entryNumber: journalEntries.entryNumber,
        memo: journalEntries.memo,
        sourceType: journalEntries.sourceType,
        status: journalEntries.status,
        lineNumber: journalLines.lineNumber,
        accountCode: accounts.code,
        accountName: accounts.name,
        description: journalLines.description,
        debit: journalLines.debit,
        credit: journalLines.credit,
        currency: journalLines.currency,
        entityType: journalLines.entityType,
        entityId: journalLines.entityId,
      })
      .from(journalLines)
      .innerJoin(journalEntries, eq(journalLines.journalEntryId, journalEntries.id))
      .innerJoin(accounts, eq(journalLines.accountId, accounts.id))
      .where(eq(journalLines.tenantId, tenant.id))
      .orderBy(asc(journalEntries.entryDate), asc(journalEntries.entryNumber), asc(journalLines.lineNumber));

    const rows: unknown[][] = [
      [
        'Entry Date',
        'Entry Number',
        'Memo',
        'Source Type',
        'Status',
        'Line',
        'Account Code',
        'Account Name',
        'Description',
        'Debit',
        'Credit',
        'Currency',
        'Entity Type',
        'Entity ID',
      ],
      ...lines.map((line) => [
        line.entryDate,
        line.entryNumber,
        line.memo,
        line.sourceType,
        line.status,
        line.lineNumber,
        line.accountCode,
        line.accountName,
        line.description,
        line.debit,
        line.credit,
        line.currency,
        line.entityType,
        line.entityId,
      ]),
    ];

    return csvDownloadResponse('officia-journal-lines.csv', rows);
  } catch (error: unknown) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
