'use client';

import { useState } from 'react';
import { Bell, Plus, CheckCircle2, Send } from 'lucide-react';

export default function InvoiceRemindersPage() {
  const [reminders, setReminders] = useState([
    { id: '1', type: 'Due Date', daysBefore: 3, message: 'Invoice is due in 3 days', active: true },
    { id: '2', type: 'Overdue', daysAfter: 7, message: 'Invoice is overdue', active: true },
    { id: '3', type: 'Second Notice', daysAfter: 14, message: 'Payment is 14 days overdue', active: true },
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-white">
            <Bell className="text-primary" size={32} />
            تذكيرات الفواتير
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            إدارة التذكيرات الآلية للفواتير المستحقة والمتأخرة
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-background shadow-[0_14px_34px_rgba(245,197,24,0.22)] transition hover:bg-amber-300">
          <Plus size={18} />
          إضافة تذكير جديد
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">التذكيرات النشطة</div>
          <div className="mt-3 text-3xl font-black text-white">3</div>
          <div className="mt-2 text-xs text-muted-foreground">قاعدة نشطة</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">التذكيرات المرسلة</div>
          <div className="mt-3 text-3xl font-black text-white">156</div>
          <div className="mt-2 text-xs text-muted-foreground">هذا الشهر</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">معدل الاستجابة</div>
          <div className="mt-3 text-3xl font-black text-emerald-300">67%</div>
          <div className="mt-2 text-xs text-muted-foreground">تم الدفع بعد التذكير</div>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-black text-white">قواعد التذكير</h2>
        </div>

        <div className="divide-y divide-white/5">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/[0.02]">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{reminder.type}</h3>
                  {reminder.active && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">
                      <CheckCircle2 size={12} />
                      نشط
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{reminder.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {reminder.daysBefore ? `${reminder.daysBefore} أيام قبل الاستحقاق` : `${reminder.daysAfter} أيام بعد الاستحقاق`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-white transition hover:border-primary/40">
                  <Edit size={18} />
                </button>
                <button className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-white transition hover:border-primary/40">
                  <Send size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-black text-white">إعدادات التذكير</h2>
        </div>
        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-bold text-white">القنوات</h3>
              <p className="mt-2 text-sm text-muted-foreground">إرسال التذكيرات عبر البريد الإلكتروني أو SMS</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-bold text-white">التوقيت</h3>
              <p className="mt-2 text-sm text-muted-foreground">تحديد أوقات إرسال التذكيرات</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-bold text-white">التخصيص</h3>
              <p className="mt-2 text-sm text-muted-foreground">تخصيص رسائل التذكير لكل عميل</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-bold text-white">التتبع</h3>
              <p className="mt-2 text-sm text-muted-foreground">تتبع فتح وقراءة التذكيرات</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
