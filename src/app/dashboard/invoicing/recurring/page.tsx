'use client';

import { useState } from 'react';
import { RefreshCw, Calendar, TrendingUp } from 'lucide-react';

export default function RecurringInvoicesPage() {
  const [recurring, setRecurring] = useState([
    { id: '1', name: 'Monthly Service Fee', client: 'ABC Corp', amount: '5000', frequency: 'monthly', nextDate: '2024-02-01', status: 'active' },
    { id: '2', name: 'Quarterly Maintenance', client: 'XYZ Ltd', amount: '15000', frequency: 'quarterly', nextDate: '2024-03-15', status: 'active' },
    { id: '3', name: 'Annual License', client: 'Tech Solutions', amount: '12000', frequency: 'annually', nextDate: '2024-12-01', status: 'paused' },
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-white">
            <RefreshCw className="text-primary" size={32} />
            الفواتير المتكررة
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            إدارة الفواتير المتكررة والاشتراكات تلقائياً
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-background shadow-[0_14px_34px_rgba(245,197,24,0.22)] transition hover:bg-amber-300">
          <Calendar size={18} />
          إضافة فاتورة متكررة
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">الفواتير النشطة</div>
          <div className="mt-3 text-3xl font-black text-white">2</div>
          <div className="mt-2 text-xs text-muted-foreground">مخطط للإرسال</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">القيمة الشهرية المتوقعة</div>
          <div className="mt-3 text-3xl font-black text-primary">5,000</div>
          <div className="mt-2 text-xs text-muted-foreground">SAR</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">الفواتير المولدة</div>
          <div className="mt-3 text-3xl font-black text-white">24</div>
          <div className="mt-2 text-xs text-muted-foreground">هذا العام</div>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-black text-white">الفواتير المتكررة</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-white/[0.03] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-bold">الاسم</th>
                <th className="px-5 py-3 font-bold">العميل</th>
                <th className="px-5 py-3 font-bold">المبلغ</th>
                <th className="px-5 py-3 font-bold">التكرار</th>
                <th className="px-5 py-3 font-bold">التاريخ القادم</th>
                <th className="px-5 py-3 font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recurring.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-bold text-white">{item.name}</td>
                  <td className="px-5 py-4 text-white">{item.client}</td>
                  <td className="px-5 py-4 font-mono text-white">{item.amount}</td>
                  <td className="px-5 py-4 text-white">{item.frequency}</td>
                  <td className="px-5 py-4 text-white">{item.nextDate}</td>
                  <td className="px-5 py-4">
                    {item.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">
                        نشط
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-300">
                        متوقف
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-black text-white">تحليلات الاشتراكات</h2>
        </div>
        <div className="p-5">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-primary" size={20} />
                <span className="font-bold text-white">إيرادات الاشتراكات المتوقعة</span>
              </div>
              <span className="font-mono text-lg font-black text-emerald-300">60,000 SAR / سنة</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              بناءً على الفواتير المتكررة النشطة
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
