'use client';

import { useEffect, useState, useTransition } from 'react';
import { Building2, Calculator, Download, FileCheck2, RefreshCw } from 'lucide-react';
import { generateVatReturn } from './actions';

type VatReturn = {
  tenant: {
    name: string;
    crn: string;
    trn: string;
    country: string;
  };
  period: string;
  periodLabel: string;
  sales: {
    taxableAmount: number;
    vat: number;
  };
  purchases: {
    taxableAmount: number;
    vat: number;
  };
  netVatDue: number;
  position: 'payable' | 'recoverable';
  generatedAt: string;
};

const months = [
  { value: 1, label: 'يناير' },
  { value: 2, label: 'فبراير' },
  { value: 3, label: 'مارس' },
  { value: 4, label: 'أبريل' },
  { value: 5, label: 'مايو' },
  { value: 6, label: 'يونيو' },
  { value: 7, label: 'يوليو' },
  { value: 8, label: 'أغسطس' },
  { value: 9, label: 'سبتمبر' },
  { value: 10, label: 'أكتوبر' },
  { value: 11, label: 'نوفمبر' },
  { value: 12, label: 'ديسمبر' },
];

function money(value: number) {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(value);
}

function currentYearOptions() {
  const year = new Date().getFullYear();
  return [year - 1, year, year + 1];
}

export default function TaxesPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState<VatReturn | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadVatReturn = () => {
    startTransition(async () => {
      setError(null);
      const result = await generateVatReturn(month, year);

      if (result.success && result.data) {
        setData(result.data as VatReturn);
      } else {
        setData(null);
        setError(result.error || 'تعذر إنشاء الإقرار الضريبي.');
      }
    });
  };

  useEffect(() => {
    loadVatReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const outputVat = data?.sales.vat || 0;
  const inputVat = data?.purchases.vat || 0;
  const generatedAt = data
    ? new Date(data.generatedAt).toLocaleString('ar-SA-u-ca-gregory')
    : '';

  return (
    <div className="mx-auto max-w-6xl space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3 text-[var(--color-gold-600)]">
            <Calculator size={28} />
            <span className="text-sm font-black uppercase tracking-[0.18em]">ZATCA VAT</span>
          </div>
          <h1 className="mt-2 text-3xl font-black text-[var(--color-desert-900)]">
            الإقرار الضريبي لضريبة القيمة المضافة
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-desert-600)]">
            ملخص ضريبي مبني على قيود دفتر الأستاذ: ضريبة المخرجات، ضريبة المدخلات، وصافي الضريبة المستحقة أو القابلة للاسترداد.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            className="h-11 rounded-lg border border-[var(--color-desert-200)] bg-white px-4 text-sm font-bold text-[var(--color-desert-900)]"
          >
            {months.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="h-11 rounded-lg border border-[var(--color-desert-200)] bg-white px-4 text-sm font-bold text-[var(--color-desert-900)]"
          >
            {currentYearOptions().map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            onClick={loadVatReturn}
            disabled={isPending}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--color-desert-900)] px-5 text-sm font-black text-white transition-colors hover:bg-black disabled:opacity-60"
          >
            <RefreshCw size={18} className={isPending ? 'animate-spin' : ''} />
            تحديث
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-[var(--color-desert-200)] bg-white px-5 text-sm font-black text-[var(--color-desert-800)] transition-colors hover:bg-[var(--color-desert-50)]"
          >
            <Download size={18} />
            تصدير PDF
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--color-desert-200)] bg-white p-5 shadow-sm">
          <div className="text-sm font-bold text-[var(--color-desert-500)]">ضريبة المخرجات</div>
          <div className="mt-3 font-mono text-2xl font-black text-amber-600">{money(outputVat)}</div>
        </div>
        <div className="rounded-lg border border-[var(--color-desert-200)] bg-white p-5 shadow-sm">
          <div className="text-sm font-bold text-[var(--color-desert-500)]">ضريبة المدخلات</div>
          <div className="mt-3 font-mono text-2xl font-black text-emerald-600">{money(inputVat)}</div>
        </div>
        <div className="rounded-lg border border-[var(--color-desert-200)] bg-[var(--color-desert-950)] p-5 shadow-sm">
          <div className="text-sm font-bold text-white/60">
            {data?.position === 'recoverable' ? 'ضريبة قابلة للاسترداد' : 'ضريبة مستحقة الدفع'}
          </div>
          <div className="mt-3 font-mono text-2xl font-black text-[var(--color-gold-400)]">
            {money(data?.netVatDue || 0)}
          </div>
        </div>
      </section>

      {data ? (
        <section id="vat-return" className="overflow-hidden rounded-lg border border-[var(--color-desert-200)] bg-white shadow-sm">
          <div className="grid gap-6 border-b border-[var(--color-desert-200)] bg-[var(--color-desert-50)] p-6 lg:grid-cols-[1fr_auto]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--color-desert-900)]">
                <Building2 className="text-[var(--color-gold-500)]" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[var(--color-desert-900)]">{data.tenant.name}</h2>
                <div className="mt-2 grid gap-1 text-sm text-[var(--color-desert-600)]">
                  <span>الرقم الضريبي: <bdi className="font-mono font-bold">{data.tenant.trn || 'غير مسجل'}</bdi></span>
                  <span>السجل التجاري: <bdi className="font-mono font-bold">{data.tenant.crn}</bdi></span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--color-desert-200)] bg-white p-4 text-sm">
              <div className="text-[var(--color-desert-500)]">الفترة الضريبية</div>
              <div className="mt-1 font-black text-[var(--color-desert-900)]">{data.periodLabel}</div>
              <div className="mt-2 font-mono text-xs text-[var(--color-desert-500)]">{data.period}</div>
            </div>
          </div>

          <div className="divide-y divide-[var(--color-desert-100)]">
            <div className="grid grid-cols-[1fr_180px_180px] gap-4 p-5 text-sm font-black text-[var(--color-desert-500)]">
              <div>البند</div>
              <div className="text-left">المبلغ الخاضع</div>
              <div className="text-left">الضريبة</div>
            </div>

            <div className="grid grid-cols-[1fr_180px_180px] gap-4 p-5 text-sm">
              <div>
                <div className="font-black text-[var(--color-desert-900)]">المبيعات المحلية الخاضعة للنسبة الأساسية 15%</div>
                <div className="mt-1 text-xs text-[var(--color-desert-500)]">من حساب VAT Payable - 2100</div>
              </div>
              <div className="text-left font-mono font-bold">{money(data.sales.taxableAmount)}</div>
              <div className="text-left font-mono font-black text-amber-600">{money(data.sales.vat)}</div>
            </div>

            <div className="grid grid-cols-[1fr_180px_180px] gap-4 p-5 text-sm">
              <div>
                <div className="font-black text-[var(--color-desert-900)]">المشتريات المحلية الخاضعة للنسبة الأساسية 15%</div>
                <div className="mt-1 text-xs text-[var(--color-desert-500)]">من حساب Input VAT Recoverable - 1300</div>
              </div>
              <div className="text-left font-mono font-bold">{money(data.purchases.taxableAmount)}</div>
              <div className="text-left font-mono font-black text-emerald-600">{money(data.purchases.vat)}</div>
            </div>
          </div>

          <div className="bg-[var(--color-desert-950)] p-6 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <FileCheck2 className="text-[var(--color-gold-400)]" size={24} />
                <div>
                  <div className="font-black">صافي ضريبة القيمة المضافة</div>
                  <div className="mt-1 text-xs text-white/50">تاريخ الإنشاء: {generatedAt}</div>
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white/60">
                  {data.position === 'recoverable' ? 'رصيد دائن لصالح المنشأة' : 'مبلغ مستحق للهيئة'}
                </div>
                <div className="mt-1 font-mono text-3xl font-black text-[var(--color-gold-400)]">
                  {money(data.netVatDue)}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="rounded-lg border border-[var(--color-desert-200)] bg-white p-10 text-center text-sm font-bold text-[var(--color-desert-500)]">
          {isPending ? 'جاري إنشاء الإقرار الضريبي...' : 'لا توجد بيانات ضريبية للفترة المحددة.'}
        </div>
      )}
    </div>
  );
}
