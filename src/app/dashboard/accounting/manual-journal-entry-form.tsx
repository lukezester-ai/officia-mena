'use client';

import { useMemo, useState, useTransition } from 'react';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { createManualJournalEntry } from './actions';

type AccountOption = {
  id: string;
  code: string;
  name: string;
  type: string;
};

type JournalLineState = {
  accountId: string;
  description: string;
  debit: string;
  credit: string;
};

type ActionResult = {
  success: boolean;
  error?: string;
  entryNumber?: string;
};

const emptyLine = (accountId = ''): JournalLineState => ({
  accountId,
  description: '',
  debit: '',
  credit: '',
});

function numericAmount(value: string) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

export function ManualJournalEntryForm({ accounts }: { accounts: AccountOption[] }) {
  const firstAccountId = accounts[0]?.id || '';
  const [memo, setMemo] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<JournalLineState[]>([
    emptyLine(firstAccountId),
    emptyLine(accounts[1]?.id || firstAccountId),
  ]);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const debit = lines.reduce((sum, line) => sum + numericAmount(line.debit), 0);
    const credit = lines.reduce((sum, line) => sum + numericAmount(line.credit), 0);
    return {
      debit,
      credit,
      isBalanced: debit > 0 && credit > 0 && Math.round(debit * 100) === Math.round(credit * 100),
    };
  }, [lines]);

  const updateLine = (index: number, field: keyof JournalLineState, value: string) => {
    setLines((current) => current.map((line, lineIndex) => {
      if (lineIndex !== index) return line;

      if (field === 'debit' && value) {
        return { ...line, debit: value, credit: '' };
      }

      if (field === 'credit' && value) {
        return { ...line, credit: value, debit: '' };
      }

      return { ...line, [field]: value };
    }));
  };

  const addLine = () => {
    setLines((current) => [...current, emptyLine(firstAccountId)]);
  };

  const removeLine = (index: number) => {
    setLines((current) => current.length <= 2 ? current : current.filter((_, lineIndex) => lineIndex !== index));
  };

  const submit = () => {
    setResult(null);
    startTransition(async () => {
      const response = await createManualJournalEntry({ entryDate, memo, lines });
      setResult(response);

      if (response.success) {
        setMemo('');
        setLines([emptyLine(firstAccountId), emptyLine(accounts[1]?.id || firstAccountId)]);
      }
    });
  };

  return (
    <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
      <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Manual Journal Entry</h2>
          <p className="mt-1 text-xs text-muted-foreground">Post adjustments, opening balances, and accounting corrections.</p>
        </div>
        <div className={`rounded-full border px-3 py-1 font-mono text-xs font-bold ${totals.isBalanced ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-amber-400/20 bg-amber-400/10 text-amber-300'}`}>
          Dr {totals.debit.toFixed(2)} / Cr {totals.credit.toFixed(2)}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid gap-3 md:grid-cols-[180px_1fr]">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Date</span>
            <input
              type="date"
              value={entryDate}
              onChange={(event) => setEntryDate(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Memo</span>
            <input
              type="text"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="Adjustment memo"
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-2 py-2 font-bold">Account</th>
                <th className="px-2 py-2 font-bold">Description</th>
                <th className="px-2 py-2 font-bold">Debit</th>
                <th className="px-2 py-2 font-bold">Credit</th>
                <th className="w-10 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={`${index}-${line.accountId}`}>
                  <td className="px-2 py-2">
                    <select
                      value={line.accountId}
                      onChange={(event) => updateLine(index, 'accountId', event.target.value)}
                      disabled={accounts.length === 0}
                      className="min-w-56 rounded-lg border border-white/10 bg-[#17120b] px-3 py-2 text-sm text-white outline-none focus:border-primary"
                    >
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name} ({account.type})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(event) => updateLine(index, 'description', event.target.value)}
                      className="min-w-56 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-primary"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.debit}
                      onChange={(event) => updateLine(index, 'debit', event.target.value)}
                      className="w-32 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left font-mono text-sm text-white outline-none focus:border-primary"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.credit}
                      onChange={(event) => updateLine(index, 'credit', event.target.value)}
                      className="w-32 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left font-mono text-sm text-white outline-none focus:border-primary"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      disabled={lines.length <= 2}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition hover:border-rose-400/30 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Remove line"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition hover:border-primary/40"
          >
            <PlusCircle size={16} />
            Add line
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isPending || accounts.length === 0 || !totals.isBalanced}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-black text-background transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            {isPending ? 'Posting...' : 'Post journal entry'}
          </button>
        </div>

        {result && (
          <div className={`rounded-lg border p-3 text-sm font-bold ${result.success ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/20 bg-rose-400/10 text-rose-300'}`}>
            {result.success ? `Posted ${result.entryNumber}` : result.error}
          </div>
        )}
      </div>
    </section>
  );
}
