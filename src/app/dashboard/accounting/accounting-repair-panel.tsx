'use client';

import { useState, useTransition } from 'react';
import { Wrench } from 'lucide-react';
import { repairMissingAccountingPostings } from './actions';

type RepairSummary = {
  issuedInvoices: number;
  posSales: number;
  approvedExpenses: number;
  payrollAccruals: number;
};

type RepairResult = {
  success: boolean;
  summary?: RepairSummary;
  error?: string;
};

export function AccountingRepairPanel() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<RepairResult | null>(null);

  const repair = () => {
    setResult(null);
    startTransition(async () => {
      setResult(await repairMissingAccountingPostings());
    });
  };

  const repairedTotal = result?.summary
    ? result.summary.issuedInvoices + result.summary.posSales + result.summary.approvedExpenses + result.summary.payrollAccruals
    : 0;

  return (
    <section className="rounded-xl border border-white/10 bg-card/70 p-5 shadow-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-white">
            <Wrench className="text-primary" size={18} />
            Repair Missing Postings
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">
            Backfill journal entries for existing issued invoices, POS sales, approved expenses, and generated payroll runs.
          </p>
        </div>
        <button
          type="button"
          onClick={repair}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-background transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Wrench size={16} />
          {isPending ? 'Repairing...' : 'Run repair'}
        </button>
      </div>

      {result && (
        <div className={`mt-4 rounded-lg border p-3 text-sm font-bold ${result.success ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/20 bg-rose-400/10 text-rose-300'}`}>
          {result.success && result.summary ? (
            <span>
              Repaired {repairedTotal} postings: invoices {result.summary.issuedInvoices}, POS {result.summary.posSales}, expenses {result.summary.approvedExpenses}, payroll {result.summary.payrollAccruals}.
            </span>
          ) : (
            result.error
          )}
        </div>
      )}
    </section>
  );
}
