'use client';

import React, { useState } from 'react';
import { Camera, X, FileScan, CheckCircle2, ArrowRight, Upload, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ReceiptScannerPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Simulate AI processing a receipt
  const simulateAIProcessing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
    }, 4000);
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-[var(--color-desert-50)] rounded-3xl overflow-hidden shadow-sm border border-[var(--color-desert-200)] relative">
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-[var(--color-desert-200)] bg-white">
          <Link href="/dashboard/inventory" className="p-2 text-[var(--color-desert-500)] hover:text-[var(--color-desert-900)] hover:bg-[var(--color-desert-100)] rounded-full transition-colors">
            <ArrowRight size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--color-gold-500)]" />
            <span className="font-bold text-[var(--color-desert-900)]">قراءة ذكية للإيصالات (AI OCR)</span>
          </div>
          <Link href="/dashboard/inventory" className="p-2 text-[var(--color-desert-500)] hover:bg-[var(--color-desert-100)] rounded-full transition-colors">
            <X size={20} />
          </Link>
        </div>

        <div className="p-8">
          {!isProcessing && !isDone && (
            <div className="text-center">
              <div className="w-24 h-24 bg-[var(--color-gold-50)] rounded-full flex items-center justify-center mx-auto mb-6">
                <FileScan size={40} className="text-[var(--color-gold-600)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--color-desert-900)] mb-2">قم برفع فاتورة المورد</h2>
              <p className="text-[var(--color-desert-600)] mb-8 text-sm">
                سيقوم الذكاء الاصطناعي بقراءة الفاتورة، مطابقة المنتجات، وتحديث المخزون تلقائياً لتوفير وقتك.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={simulateAIProcessing}
                  className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-dashed border-[var(--color-desert-300)] rounded-2xl p-6 hover:border-[var(--color-gold-500)] hover:bg-[var(--color-gold-50)] transition-colors group"
                >
                  <div className="p-3 bg-[var(--color-desert-100)] group-hover:bg-white rounded-full text-[var(--color-desert-600)] group-hover:text-[var(--color-gold-600)]">
                    <Camera size={24} />
                  </div>
                  <span className="font-bold text-[var(--color-desert-900)] text-sm">التقاط صورة</span>
                </button>
                
                <button 
                  onClick={simulateAIProcessing}
                  className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-dashed border-[var(--color-desert-300)] rounded-2xl p-6 hover:border-[var(--color-gold-500)] hover:bg-[var(--color-gold-50)] transition-colors group"
                >
                  <div className="p-3 bg-[var(--color-desert-100)] group-hover:bg-white rounded-full text-[var(--color-desert-600)] group-hover:text-[var(--color-gold-600)]">
                    <Upload size={24} />
                  </div>
                  <span className="font-bold text-[var(--color-desert-900)] text-sm">رفع ملف (PDF/JPG)</span>
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-[var(--color-desert-200)] rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[var(--color-gold-500)] rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-[var(--color-gold-600)] animate-pulse" size={24} />
              </div>
              <h3 className="font-bold text-lg text-[var(--color-desert-900)] mb-2">جاري تحليل الفاتورة...</h3>
              <p className="text-[var(--color-desert-500)] text-sm animate-pulse">يتم الآن استخراج المنتجات والكميات</p>
            </div>
          )}

          {isDone && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-center font-bold text-xl text-[var(--color-desert-900)] mb-6">تم تحديث المخزون بنجاح!</h3>
              
              <div className="bg-white border border-[var(--color-desert-200)] rounded-xl overflow-hidden mb-6 text-sm">
                <div className="bg-[var(--color-desert-50)] p-3 border-b border-[var(--color-desert-200)] flex justify-between">
                  <span className="font-bold text-[var(--color-desert-700)]">المورد: شركة المراعي</span>
                  <span className="text-[var(--color-desert-500)]">الفاتورة #INV-9921</span>
                </div>
                <div className="divide-y divide-[var(--color-desert-100)]">
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[var(--color-desert-900)]">قهوة عربية ممتازة (FOD-023)</p>
                      <p className="text-xs text-emerald-600 font-bold">تم التعرف على الباركود</p>
                    </div>
                    <div className="text-left" dir="ltr">
                      <p className="text-[var(--color-desert-500)] line-through text-xs">40</p>
                      <p className="font-bold text-emerald-600 flex items-center gap-1">+50 <ArrowRight size={12}/> 90</p>
                    </div>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[var(--color-desert-900)]">تمور المجهول (FOD-044)</p>
                      <p className="text-xs text-emerald-600 font-bold">تم التعرف على الباركود</p>
                    </div>
                    <div className="text-left" dir="ltr">
                      <p className="text-[var(--color-desert-500)] line-through text-xs">42</p>
                      <p className="font-bold text-emerald-600 flex items-center gap-1">+100 <ArrowRight size={12}/> 142</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDone(false)}
                  className="flex-1 bg-white border border-[var(--color-desert-200)] hover:bg-[var(--color-desert-50)] py-3 rounded-xl font-bold text-[var(--color-desert-700)] transition-colors"
                >
                  مسح فاتورة أخرى
                </button>
                <Link href="/dashboard/inventory" className="flex-1 bg-[var(--color-desert-900)] hover:bg-black text-white py-3 rounded-xl font-bold text-center transition-colors">
                  العودة للمخزون
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
