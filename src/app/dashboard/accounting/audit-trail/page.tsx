/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { History, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function AuditTrailPage() {
  const [auditEvents, setAuditEvents] = useState([
    { id: '1', action: 'Create Invoice', entity: 'INV-001', user: 'Admin', timestamp: '2024-01-15 10:30', critical: true },
    { id: '2', action: 'Update Budget', entity: 'BUD-001', user: 'Finance Manager', timestamp: '2024-01-15 09:15', critical: false },
    { id: '3', action: 'Delete Journal Entry', entity: 'JE-045', user: 'Accountant', timestamp: '2024-01-14 16:45', critical: true },
    { id: '4', action: 'Approve Expense', entity: 'EXP-023', user: 'Manager', timestamp: '2024-01-14 14:20', critical: false },
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-white">
            <History className="text-primary" size={32} />
            سجل التدقيق
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            تتبع جميع الإجراءات والتغييرات في النظام للتدقيق والامتثال
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-black text-white outline-none focus:border-primary/40">
            <option>جميع الإجراءات</option>
            <option>الإجراءات الحرجة</option>
            <option>الإجراءات العادية</option>
          </select>
          <input
            type="date"
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-black text-white outline-none focus:border-primary/40"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">إجمالي الأحداث</div>
          <div className="mt-3 text-3xl font-black text-white">1,234</div>
          <div className="mt-2 text-xs text-muted-foreground">هذا الشهر</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">الإجراءات الحرجة</div>
          <div className="mt-3 text-3xl font-black text-rose-300">45</div>
          <div className="mt-2 text-xs text-muted-foreground">تتطلب مراجعة</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">المستخدمين النشطين</div>
          <div className="mt-3 text-3xl font-black text-white">12</div>
          <div className="mt-2 text-xs text-muted-foreground">هذا الأسبوع</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">آخر حدث</div>
          <div className="mt-3 text-2xl font-black text-white">10:30</div>
          <div className="mt-2 text-xs text-muted-foreground">اليوم</div>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-black text-white">سجل الأحداث الأخير</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-white/[0.03] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-bold">الإجراء</th>
                <th className="px-5 py-3 font-bold">الكيان</th>
                <th className="px-5 py-3 font-bold">المستخدم</th>
                <th className="px-5 py-3 font-bold">التوقيت</th>
                <th className="px-5 py-3 font-bold">الأهمية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditEvents.map((event) => (
                <tr key={event.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-bold text-white">{event.action}</td>
                  <td className="px-5 py-4 font-mono text-white">{event.entity}</td>
                  <td className="px-5 py-4 text-white">{event.user}</td>
                  <td className="px-5 py-4 text-white">{event.timestamp}</td>
                  <td className="px-5 py-4">
                    {event.critical ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-1 text-xs font-bold text-rose-300">
                        <XCircle size={12} />
                        حرج
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">
                        <CheckCircle2 size={12} />
                        عادي
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
          <h2 className="text-lg font-black text-white">التقارير المطلوبة للامتثال</h2>
        </div>
        <div className="p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2">
                <Clock className="text-amber-300" size={18} />
                <span className="font-bold text-white">تقرير التعديلات الحرجة</span>
              </div>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-background transition hover:bg-amber-300">
                تنزيل
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2">
                <History className="text-primary" size={18} />
                <span className="font-bold text-white">سجل التدقيق الكامل</span>
              </div>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-background transition hover:bg-amber-300">
                تنزيل
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
