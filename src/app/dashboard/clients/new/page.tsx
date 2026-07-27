'use client';

import { useState } from 'react';
import { createClient } from '../actions';
import { Users, ArrowRight, Save, Building2, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewClientPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clients" className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-500" />
              إضافة عميل جديد
            </h1>
          </div>
        </div>
      </div>

      <form 
        action={async (formData) => {
          setIsSubmitting(true);
          await createClient(formData);
        }}
        className="space-y-8"
      >
        {/* Company Details */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl space-y-6 relative overflow-hidden">
          <Building2 className="absolute -left-4 -bottom-4 w-32 h-32 text-indigo-500/5" />
          
          <h2 className="text-lg font-medium text-white border-b border-zinc-800 pb-4 relative z-10">بيانات الشركة / المؤسسة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-400">اسم الشركة أو العميل *</label>
              <input required name="companyName" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="مثال: شركة الرواد للتجارة" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">الرقم الضريبي (TRN)</label>
              <input name="trn" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans" dir="ltr" placeholder="3000..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">رقم السجل التجاري (CRN)</label>
              <input name="crn" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans" dir="ltr" placeholder="1010..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-400">العنوان الوطني / المقر</label>
              <input name="address" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="الرياض، حي العليا، شارع الأمير سلطان" />
            </div>
          </div>
        </div>

        {/* Contact Person */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl space-y-6 relative overflow-hidden">
          <UserCircle className="absolute -left-4 -bottom-4 w-32 h-32 text-indigo-500/5" />

          <h2 className="text-lg font-medium text-white border-b border-zinc-800 pb-4 relative z-10">معلومات التواصل (الشخص المسؤول)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-400">اسم الشخص المسؤول (Contact Person)</label>
              <input name="contactPerson" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="مثال: أحمد عبدالله (مدير المشتريات)" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">رقم الهاتف / الجوال</label>
              <input name="phone" type="tel" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans" dir="ltr" placeholder="+966 50 000 0000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">البريد الإلكتروني</label>
              <input name="email" type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans" dir="ltr" placeholder="contact@company.com" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pb-12">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 text-lg"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ العميل'}
          </button>
        </div>
      </form>
    </div>
  );
}
