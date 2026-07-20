'use client';

import React, { useState } from 'react';
import { CreditCard, Download, Calculator, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { calculateEOSB, formatSaudiRiyal } from '@/lib/hr/eosb-calc';
import { downloadWpsSif } from './payroll-actions';

export default function PayrollPage() {
  const [eosbYears, setEosbYears] = useState<number>(6);
  const [eosbSalary, setEosbSalary] = useState<number>(10000);
  
  const [wpsGenerated, setWpsGenerated] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);

  const eosbAmount = calculateEOSB(eosbSalary, eosbYears);

  const handleGenerateWPS = async () => {
    setIsGenerating(true);
    try {
      const res = await downloadWpsSif(7, 2026); // Hardcoded July 2026 for UI demo
      if (res.success && res.data) {
        // Create Blob and trigger download
        const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `WPS_SIF_2026_07.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        setWpsGenerated(true);
      } else {
        alert(res.error || 'فشل في إنشاء الملف');
      }
    } catch (error) {
      console.error(error);
      alert('حدث خطأ');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/hr" className="p-2 bg-white rounded-full border border-[var(--color-desert-200)] hover:bg-[var(--color-desert-50)] transition-colors">
          <ArrowRight size={20} className="text-[var(--color-desert-600)]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-1 flex items-center gap-3">
            <CreditCard className="text-[var(--color-gold-600)]" size={32} />
            الرواتب (Payroll)
          </h1>
          <p className="text-[var(--color-desert-600)] text-sm">نظام حماية الأجور ومكافأة نهاية الخدمة.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WPS Section */}
        <div className="bg-white border border-[var(--color-desert-200)] rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--color-desert-200)] pb-4">
            <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[var(--color-desert-900)]">نظام حماية الأجور (WPS)</h2>
              <p className="text-xs text-[var(--color-desert-500)]">إنشاء ملف SIF للبنك</p>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="bg-[var(--color-desert-50)] p-4 rounded-xl border border-[var(--color-desert-200)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-[var(--color-desert-700)]">رواتب شهر</span>
                <span className="font-mono text-[var(--color-desert-900)] font-bold">يوليو 2026</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-[var(--color-desert-700)]">عدد الموظفين</span>
                <span className="font-mono text-[var(--color-desert-900)] font-bold">45</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[var(--color-desert-200)]">
                <span className="text-sm font-bold text-[var(--color-desert-700)]">الإجمالي للملف</span>
                <span className="font-mono text-[var(--color-gold-600)] font-bold">485,200.00 SAR</span>
              </div>
            </div>

            <p className="text-xs text-[var(--color-desert-600)] leading-relaxed">
              سيقوم النظام بجمع كافة الرواتب الأساسية، البدلات، والخصومات لإنشاء ملف متوافق 100% مع البنك المركزي ووزارة الموارد البشرية.
            </p>
          </div>

          <div className="mt-6">
            {!wpsGenerated ? (
              <button 
                onClick={handleGenerateWPS}
                disabled={isGenerating}
                className="w-full bg-[var(--color-desert-900)] hover:bg-black text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2"><span className="animate-spin text-white">⚙️</span> جاري التوليد...</span>
                ) : (
                  <><Download size={18} /> إنشاء وتحميل ملف (SIF)</>
                )}
              </button>
            ) : (
              <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold py-3 rounded-xl flex justify-center items-center gap-2 animate-in zoom-in duration-300">
                <CheckCircle2 size={18} /> تم تحميل الملف بنجاح!
              </div>
            )}
          </div>
        </div>

        {/* EOSB Section */}
        <div className="bg-white border border-[var(--color-desert-200)] rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--color-desert-200)] pb-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <Calculator size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[var(--color-desert-900)]">مكافأة نهاية الخدمة (EOSB)</h2>
              <p className="text-xs text-[var(--color-desert-500)]">حاسبة حقوق الموظف عند الاستقالة/الإقالة</p>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-desert-500)] mb-1">الراتب الأساسي (SAR)</label>
              <input 
                type="number" 
                value={eosbSalary}
                onChange={(e) => setEosbSalary(Number(e.target.value))}
                className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-[var(--color-gold-500)]" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[var(--color-desert-500)] mb-1">سنوات الخدمة</label>
              <input 
                type="number" 
                value={eosbYears}
                onChange={(e) => setEosbYears(Number(e.target.value))}
                className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-[var(--color-gold-500)]" 
              />
              <p className="text-[10px] text-[var(--color-desert-400)] mt-1">حسب المادة 84 من نظام العمل: نصف شهر لأول 5 سنوات، وشهر كامل لما زاد.</p>
            </div>
          </div>

          <div className="mt-6 bg-[var(--color-desert-950)] text-white rounded-2xl p-5 border-4 border-black">
            <div className="text-sm text-white/60 mb-1">المكافأة المستحقة</div>
            <div className="text-3xl font-mono font-bold text-[var(--color-gold-400)]" dir="ltr">
              {formatSaudiRiyal(eosbAmount)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
