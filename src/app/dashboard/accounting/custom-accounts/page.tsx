'use client';

import { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';

export default function CustomAccountsPage() {
  const [accounts, setAccounts] = useState([
    { id: '1', code: '6001', name: 'Salaries Expense', type: 'expense', category: 'Operating', status: 'active' },
    { id: '2', code: '6002', name: 'Rent Expense', type: 'expense', category: 'Operating', status: 'active' },
    { id: '3', code: '7001', name: 'Consulting Revenue', type: 'revenue', category: 'Service', status: 'active' },
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-white">
            <BookOpen className="text-primary" size={32} />
            دليل الحسابات المخصص
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            إنشاء وإدارة الحسابات المخصصة لتناسب احتياجات العمل
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-background shadow-[0_14px_34px_rgba(245,197,24,0.22)] transition hover:bg-amber-300">
          <Plus size={18} />
          إضافة حساب جديد
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">إجمالي الحسابات</div>
          <div className="mt-3 text-3xl font-black text-white">47</div>
          <div className="mt-2 text-xs text-muted-foreground">حساب نشط</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">حسابات مخصصة</div>
          <div className="mt-3 text-3xl font-black text-primary">12</div>
          <div className="mt-2 text-xs text-muted-foreground">أضيفها المستخدم</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">الفئات</div>
          <div className="mt-3 text-3xl font-black text-white">8</div>
          <div className="mt-2 text-xs text-muted-foreground">تصنيفات الحسابات</div>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-black text-white">الحسابات المخصصة</h2>
          <div className="flex items-center gap-2">
            <select className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-black text-white outline-none focus:border-primary/40">
              <option>جميع الأنواع</option>
              <option>الإيرادات</option>
              <option>المصروفات</option>
              <option>الأصول</option>
              <option>الخصوم</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-white/[0.03] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-bold">الكود</th>
                <th className="px-5 py-3 font-bold">اسم الحساب</th>
                <th className="px-5 py-3 font-bold">النوع</th>
                <th className="px-5 py-3 font-bold">الفئة</th>
                <th className="px-5 py-3 font-bold">الحالة</th>
                <th className="px-5 py-3 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-mono font-bold text-white">{account.code}</td>
                  <td className="px-5 py-4 font-bold text-white">{account.name}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-bold ${
                      account.type === 'revenue'
                        ? 'border-[var(--color-gold-500)]/20 bg-[var(--color-gold-500)]/10 text-[var(--color-gold-500)]'
                        : account.type === 'expense'
                        ? 'border-rose-400/20 bg-rose-400/10 text-rose-300'
                        : 'border-white/10 bg-white/[0.03] text-white'
                    }`}>
                      {account.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white">{account.category}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">
                      نشط
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-white transition hover:border-primary/40">
                        <Edit size={16} />
                      </button>
                      <button className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-2 text-rose-300 transition hover:bg-rose-400/20">
                        <Trash2 size={16} />
                      </button>
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
          <h2 className="text-lg font-black text-white">استيراد/تصدير دليل الحسابات</h2>
        </div>
        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-bold text-white">استيراد من Excel/CSV</h3>
              <p className="mt-2 text-sm text-muted-foreground">استيراد دليل حسابات من ملف خارجي</p>
              <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-black text-background transition hover:bg-amber-300">
                استيراد
              </button>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-bold text-white">تصدير إلى Excel/CSV</h3>
              <p className="mt-2 text-sm text-muted-foreground">تصدير دليل الحسابات الحالي</p>
              <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-black text-background transition hover:bg-amber-300">
                تصدير
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
