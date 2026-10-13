'use client';

import { useState, useTransition } from 'react';
import { repairMissingAccountingPostings } from './actions';

const WrenchIcon = ({ className, size = 18 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

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
            <WrenchIcon className="text-primary" size={18} />
            إصلاح الترحيلات المفقودة
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">
            تعبئة قيود اليومية للفواتير الصادرة ومبيعات نقاط البيع والمصروفات المعتمدة ودفعات الرواتب المنشأة.
          </p>
        </div>
        <button
          type="button"
          onClick={repair}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-background transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <WrenchIcon size={16} />
          {isPending ? 'جاري الإصلاح...' : 'تشغيل الإصلاح'}
        </button>
      </div>

      {result && (
        <div className={`mt-4 rounded-lg border p-3 text-sm font-bold ${result.success ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/20 bg-rose-400/10 text-rose-300'}`}>
          {result.success && result.summary ? (
            <span>
              تم إصلاح {repairedTotal} ترحيلات: فواتير {result.summary.issuedInvoices}، نقاط بيع {result.summary.posSales}، مصروفات {result.summary.approvedExpenses}، رواتب {result.summary.payrollAccruals}.
            </span>
          ) : (
            result.error
          )}
        </div>
      )}
    </section>
  );
}
