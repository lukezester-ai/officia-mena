'use client';

import { useState } from 'react';
import { Globe, RefreshCw, DollarSign } from 'lucide-react';

export default function MultiCurrencyPage() {
  const [rates, setRates] = useState([
    { currency: 'USD', rate: '3.75', lastUpdated: '2024-01-15' },
    { currency: 'EUR', rate: '4.08', lastUpdated: '2024-01-15' },
    { currency: 'GBP', rate: '4.78', lastUpdated: '2024-01-15' },
    { currency: 'AED', rate: '1.02', lastUpdated: '2024-01-15' },
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-white">
            <Globe className="text-primary" size={32} />
            العملات المتعددة
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            إدارة أسعار الصرف والتحويل بين العملات المختلفة
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-background shadow-[0_14px_34px_rgba(245,197,24,0.22)] transition hover:bg-amber-300">
          <RefreshCw size={18} />
          تحديث الأسعار
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">العملة الأساسية</div>
          <div className="mt-3 text-3xl font-black text-white">SAR</div>
          <div className="mt-2 text-xs text-muted-foreground">الريال السعودي</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">عدد العملات المدعومة</div>
          <div className="mt-3 text-3xl font-black text-white">4</div>
          <div className="mt-2 text-xs text-muted-foreground">USD, EUR, GBP, AED</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">آخر تحديث</div>
          <div className="mt-3 text-3xl font-black text-white">2024-01-15</div>
          <div className="mt-2 text-xs text-muted-foreground">يومين مضت</div>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-black text-white">أسعار الصرف الحالية</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-white/[0.03] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-bold">العملة</th>
                <th className="px-5 py-3 font-bold">سعر الصرف</th>
                <th className="px-5 py-3 font-bold">مقابل 1 SAR</th>
                <th className="px-5 py-3 font-bold">آخر تحديث</th>
                <th className="px-5 py-3 font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rates.map((rate, index) => (
                <tr key={index} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-bold text-white">{rate.currency}</td>
                  <td className="px-5 py-4 font-mono text-white">{rate.rate}</td>
                  <td className="px-5 py-4 font-mono text-emerald-300">{(1 / Number(rate.rate)).toFixed(4)}</td>
                  <td className="px-5 py-4 text-white">{rate.lastUpdated}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">
                      محدث
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-black text-white">تحويل العملات</h2>
        </div>
        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <label className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">من</label>
              <select className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-bold text-white outline-none focus:border-primary">
                <option>SAR</option>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <label className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">إلى</label>
              <select className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-bold text-white outline-none focus:border-primary">
                <option>USD</option>
                <option>SAR</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">المبلغ</label>
            <input
              type="number"
              placeholder="أدخل المبلغ"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-white outline-none focus:border-primary"
            />
          </div>
          <button className="mt-4 rounded-lg bg-primary px-6 py-3 text-sm font-black text-background transition hover:bg-amber-300">
            تحويل
          </button>
        </div>
      </section>
    </div>
  );
}
