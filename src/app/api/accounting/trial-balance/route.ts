import { requireTenant } from '@/lib/auth/get-tenant';
import { csvDownloadResponse } from '@/lib/accounting/csv';
import { getAccountingOverview } from '@/lib/accounting/ledger';
import { getErrorMessage } from '@/lib/errors';

export async function GET() {
  try {
    const tenant = await requireTenant();
    const data = await getAccountingOverview(tenant.id);
    const rows: unknown[][] = [
      ['Code', 'Account', 'Type', 'Normal Balance', 'Debit', 'Credit', 'Balance'],
      ...data.trialBalance.map((row) => [
        row.code,
        row.name,
        row.type,
        row.normalBalance,
        row.debit,
        row.credit,
        row.balance,
      ]),
      [],
      ['Total', '', '', '', data.totals.debit, data.totals.credit, data.totals.isBalanced ? 'Balanced' : 'Out of balance'],
    ];

    return csvDownloadResponse('officia-trial-balance.csv', rows);
  } catch (error: unknown) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
