'use client';

import { useState } from 'react';
import { FileText, Plus, Download, Eye, Trash2 } from 'lucide-react';

export default function CustomReportsPage() {
  const [reports, setReports] = useState([
    { id: '1', name: 'Quarterly Revenue Report', description: 'Revenue breakdown by quarter', createdAt: '2024-01-15' },
    { id: '2', name: 'Expense Analysis', description: 'Monthly expense analysis by category', createdAt: '2024-01-10' },
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-white">
            <FileText className="text-primary" size={32} />
            التقارير المخصصة
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            إنشاء وإدارة التقارير المخصصة لتحليلات الأعمال المتقدمة
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-background shadow-[0_14px_34px_rgba(245,197,24,0.22)] transition hover:bg-amber-300">
          <Plus size={18} />
          إنشاء تقرير جديد
        </button>
      </div>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-black text-white">التقارير المحفوظة</h2>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-black text-white transition hover:border-primary/40">
              <Download size={16} />
              تصدير الكل
            </button>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/[0.02]">
              <div className="flex-1">
                <h3 className="font-bold text-white">{report.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">تم الإنشاء: {report.createdAt}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-white transition hover:border-primary/40">
                  <Eye size={18} />
                </button>
                <button className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-white transition hover:border-primary/40">
                  <Download size={18} />
                </button>
                <button className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-2 text-rose-300 transition hover:bg-rose-400/20">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-black text-white">مقارنات الفترات</h2>
        </div>
        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-bold text-white">مقارنة شهر لشهر</h3>
              <p className="mt-2 text-sm text-muted-foreground">مقارنة الأداء بين الأشهر المتتالية</p>
              <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-black text-background transition hover:bg-amber-300">
                إنشاء مقارنة
              </button>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-bold text-white">مقارنة سنة لسنة</h3>
              <p className="mt-2 text-sm text-muted-foreground">مقارنة الأداء بين السنوات</p>
              <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-black text-background transition hover:bg-amber-300">
                إنشاء مقارنة
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
