'use client';

import { useState } from 'react';
import { TrendingUp, RefreshCw, DollarSign } from 'lucide-react';

export default function ForecastingPage() {
  const [forecasts, setForecasts] = useState([
    { id: '1', period: 'Q1 2024', revenue: '150000', expenses: '120000', netIncome: '30000', confidence: 85 },
    { id: '2', period: 'Q2 2024', revenue: '165000', expenses: '125000', netIncome: '40000', confidence: 80 },
    { id: '3', period: 'Q3 2024', revenue: '180000', expenses: '130000', netIncome: '50000', confidence: 75 },
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-white">
            <TrendingUp className="text-primary" size={32} />
            التخطيط المالي والتوقعات
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            التخطيط المالي وتوقعات الأداء المستقبلي بناءً على البيانات التاريخية
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-background shadow-[0_14px_34px_rgba(245,197,24,0.22)] transition hover:bg-amber-300">
          <RefreshCw size={18} />
          تحديث التوقعات
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">إيرادات Q1</div>
          <div className="mt-3 text-2xl font-black text-white">150,000</div>
          <div className="mt-2 text-xs text-muted-foreground">SAR (متوقع)</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">إيرادات Q2</div>
          <div className="mt-3 text-2xl font-black text-white">165,000</div>
          <div className="mt-2 text-xs text-muted-foreground">SAR (متوقع)</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">إيرادات Q3</div>
          <div className="mt-3 text-2xl font-black text-white">180,000</div>
          <div className="mt-2 text-xs text-muted-foreground">SAR (متوقع)</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">متوسط الثقة</div>
          <div className="mt-3 text-2xl font-black text-emerald-300">80%</div>
          <div className="mt-2 text-xs text-muted-foreground">مستوى دقة التوقع</div>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-black text-white">توقعات الأرباح والخسائر</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-white/[0.03] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-bold">الفترة</th>
                <th className="px-5 py-3 font-bold">الإيرادات المتوقعة</th>
                <th className="px-5 py-3 font-bold">المصروفات المتوقعة</th>
                <th className="px-5 py-3 font-bold">صافي الدخل المتوقع</th>
                <th className="px-5 py-3 font-bold">مستوى الثقة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {forecasts.map((forecast) => (
                <tr key={forecast.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-bold text-white">{forecast.period}</td>
                  <td className="px-5 py-4 font-mono text-emerald-300">{forecast.revenue}</td>
                  <td className="px-5 py-4 font-mono text-rose-300">{forecast.expenses}</td>
                  <td className="px-5 py-4 font-mono text-primary">{forecast.netIncome}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${forecast.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white">{forecast.confidence}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-black text-white">توقعات التدفق النقدي</h2>
        </div>
        <div className="p-5">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="text-primary" size={20} />
                <span className="font-bold text-white">التدفق النقدي المتوقع للأشهر الستة القادمة</span>
              </div>
              <span className="font-mono text-lg font-black text-emerald-300">+45,000 SAR</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              بناءً على الأنماط التاريخية والتوقعات الحالية
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
