'use client';

import { useState } from 'react';
import { FileText, Plus, Edit, Copy, Trash2 } from 'lucide-react';

export default function InvoiceTemplatesPage() {
  const [templates, setTemplates] = useState([
    { id: '1', name: 'Standard Invoice', description: 'Default invoice template', isDefault: true, usageCount: 245 },
    { id: '2', name: 'Professional Invoice', description: 'Detailed invoice with company branding', isDefault: false, usageCount: 128 },
    { id: '3', name: 'Simple Invoice', description: 'Minimal design for quick invoicing', isDefault: false, usageCount: 56 },
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-white">
            <FileText className="text-primary" size={32} />
            قوالب الفواتير
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            إنشاء وإدارة قوالب الفواتير المخصصة مع خيارات التصميم المتقدمة
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-background shadow-[0_14px_34px_rgba(245,197,24,0.22)] transition hover:bg-amber-300">
          <Plus size={18} />
          إنشاء قالب جديد
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">إجمالي القوالب</div>
          <div className="mt-3 text-3xl font-black text-white">3</div>
          <div className="mt-2 text-xs text-muted-foreground">قالب نشط</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">القالب الافتراضي</div>
          <div className="mt-3 text-2xl font-black text-primary">Standard Invoice</div>
          <div className="mt-2 text-xs text-muted-foreground">المستخدم غالباً</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">إجمالي الاستخدام</div>
          <div className="mt-3 text-3xl font-black text-white">429</div>
          <div className="mt-2 text-xs text-muted-foreground">فاتورة هذا الشهر</div>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-black text-white">القوالب المتاحة</h2>
        </div>

        <div className="divide-y divide-white/5">
          {templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/[0.02]">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{template.name}</h3>
                  {template.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                      افتراضي
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">استخدم {template.usageCount} مرة</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-white transition hover:border-primary/40">
                  <Edit size={18} />
                </button>
                <button className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-white transition hover:border-primary/40">
                  <Copy size={18} />
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
          <h2 className="text-lg font-black text-white">خيارات التخصيص</h2>
        </div>
        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-bold text-white">الألوان والخطوط</h3>
              <p className="mt-2 text-sm text-muted-foreground">تخصيص الألوان والخطوط للقالب</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-bold text-white">الشعار والعلامة التجارية</h3>
              <p className="mt-2 text-sm text-muted-foreground">إضافة شعار الشركة والعناصر المميزة</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-bold text-white">التذييل والملاحظات</h3>
              <p className="mt-2 text-sm text-muted-foreground">تخصيص التذييل والملاحظات القياسية</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-bold text-white">الحقول الإضافية</h3>
              <p className="mt-2 text-sm text-muted-foreground">إضافة حقول مخصصة للفاتورة</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
