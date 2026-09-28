'use client';

import { useState } from 'react';
import { DollarSign, Plus, Edit, CheckCircle2, XCircle } from 'lucide-react';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([
    { id: '1', account: 'Operating Expenses', planned: '50000', actual: '45000', variance: '5000', status: 'under' },
    { id: '2', account: 'Marketing', planned: '10000', actual: '12000', variance: '-2000', status: 'over' },
    { id: '3', account: 'Research & Development', planned: '30000', actual: '28000', variance: '2000', status: 'under' },
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-white">
            <DollarSign className="text-primary" size={32} />
            الميزانيات
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            إدارة ومتابعة الميزانيات لكل حساب وفترة زمنية
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-background shadow-[0_14px_34px_rgba(245,197,24,0.22)] transition hover:bg-amber-300">
          <Plus size={18} />
          إنشاء ميزانية جديدة
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">إجمالي المخطط</div>
          <div className="mt-3 text-3xl font-black text-white">90,000</div>
          <div className="mt-2 text-xs text-muted-foreground">SAR</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">إجمالي الفعلي</div>
          <div className="mt-3 text-3xl font-black text-white">85,000</div>
          <div className="mt-2 text-xs text-muted-foreground">SAR</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">الفرق الإجمالي</div>
          <div className="mt-3 text-3xl font-black text-emerald-300">5,000</div>
          <div className="mt-2 text-xs text-muted-foreground">SAR (توفير)</div>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-black text-white">الميزانيات النشطة</h2>
          <div className="flex items-center gap-2">
            <select className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-black text-white outline-none focus:border-primary/40">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-white/[0.03] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-bold">الحساب</th>
                <th className="px-5 py-3 font-bold">المخطط</th>
                <th className="px-5 py-3 font-bold">الفعلي</th>
                <th className="px-5 py-3 font-bold">الفرق</th>
                <th className="px-5 py-3 font-bold">الحالة</th>
                <th className="px-5 py-3 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {budgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-bold text-white">{budget.account}</td>
                  <td className="px-5 py-4 font-mono text-white">{budget.planned}</td>
                  <td className="px-5 py-4 font-mono text-white">{budget.actual}</td>
                  <td className={`px-5 py-4 font-mono ${budget.status === 'under' ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {budget.variance}
                  </td>
                  <td className="px-5 py-4">
                    {budget.status === 'under' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">
                        <CheckCircle2 size={12} />
                        أقل من المخطط
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-1 text-xs font-bold text-rose-300">
                        <XCircle size={12} />
                        تجاوز المخطط
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-white transition hover:border-primary/40">
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
