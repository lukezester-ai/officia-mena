/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, FileText, Download, Building2 } from 'lucide-react';
import { generateVatReturn } from './actions';

export default function TaxesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVat();
  }, []);

  const fetchVat = async () => {
    setLoading(true);
    const d = new Date();
    // Default to current month/year
    const res = await generateVatReturn(d.getMonth() + 1, d.getFullYear());
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(val);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-1 flex items-center gap-3">
            <Calculator className="text-[var(--color-gold-600)]" size={32} />
            الإقرار الضريبي (VAT Return)
          </h1>
          <p className="text-[var(--color-desert-600)] text-sm">نموذج الإقرار الضريبي المتوافق مع هيئة الزكاة والضريبة والجمارك (ZATCA)</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-white border border-[var(--color-desert-200)] hover:bg-[var(--color-desert-50)] text-[var(--color-desert-700)] font-bold py-3 px-6 rounded-xl transition-colors shadow-sm flex items-center gap-2"
        >
          <Download size={20} /> تصدير PDF
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-[var(--color-desert-200)] p-12 text-center text-[var(--color-desert-500)]">
          جاري حساب الإقرار الضريبي...
        </div>
      ) : data ? (
        <div className="bg-white rounded-3xl border border-[var(--color-desert-200)] shadow-sm overflow-hidden" id="vat-form">
          <div className="p-8 border-b border-[var(--color-desert-200)] flex justify-between items-start bg-[var(--color-desert-50)]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[var(--color-desert-900)] rounded-2xl flex items-center justify-center">
                <Building2 className="text-[var(--color-gold-500)]" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-desert-900)]">Officia MENA Corp</h2>
                <p className="text-[var(--color-desert-500)] font-mono mt-1">TRN: 310123456700003</p>
              </div>
            </div>
            <div className="text-left bg-white p-4 rounded-xl border border-[var(--color-desert-200)] shadow-sm">
              <p className="text-sm text-[var(--color-desert-500)] mb-1">الفترة الضريبية</p>
              <p className="font-bold text-[var(--color-desert-900)] font-mono text-lg">{data.period}</p>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Sales Section */}
            <div>
              <h3 className="text-lg font-bold text-[var(--color-desert-900)] mb-4 pb-2 border-b-2 border-[var(--color-desert-100)]">1. المبيعات (المخرجات)</h3>
              <div className="grid grid-cols-3 gap-4 font-mono text-sm">
                <div className="text-[var(--color-desert-500)]">الوصف</div>
                <div className="text-left text-[var(--color-desert-500)]">المبلغ (SAR)</div>
                <div className="text-left text-[var(--color-desert-500)]">الضريبة (VAT)</div>
                
                <div className="col-span-3 border-t border-[var(--color-desert-100)] my-2"></div>
                
                <div className="font-bold">المبيعات الخاضعة للنسبة الأساسية (15%)</div>
                <div className="text-left">{formatMoney(data.sales.total)}</div>
                <div className="text-left text-amber-600 font-bold">{formatMoney(data.sales.vat)}</div>
              </div>
            </div>

            {/* Purchases Section */}
            <div>
              <h3 className="text-lg font-bold text-[var(--color-desert-900)] mb-4 pb-2 border-b-2 border-[var(--color-desert-100)]">2. المشتريات (المدخلات)</h3>
              <div className="grid grid-cols-3 gap-4 font-mono text-sm">
                <div className="text-[var(--color-desert-500)]">الوصف</div>
                <div className="text-left text-[var(--color-desert-500)]">المبلغ (SAR)</div>
                <div className="text-left text-[var(--color-desert-500)]">الضريبة (VAT)</div>
                
                <div className="col-span-3 border-t border-[var(--color-desert-100)] my-2"></div>
                
                <div className="font-bold">المشتريات الخاضعة للنسبة الأساسية (15%)</div>
                <div className="text-left">{formatMoney(data.purchases.total)}</div>
                <div className="text-left text-indigo-600 font-bold">{formatMoney(data.purchases.vat)}</div>
              </div>
            </div>

            {/* Final Calculation */}
            <div className="bg-[var(--color-desert-950)] rounded-2xl p-6 text-white border-2 border-black mt-8">
              <h3 className="font-bold text-[var(--color-gold-500)] mb-4">3. صافي الضريبة</h3>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between text-white/70">
                  <span>إجمالي ضريبة المبيعات المستحقة</span>
                  <span>{formatMoney(data.sales.vat)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>ناقص: إجمالي ضريبة المشتريات القابلة للخصم</span>
                  <span>- {formatMoney(data.purchases.vat)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white border-t border-white/20 pt-4 mt-4">
                  <span>صافي الضريبة المستحقة للدفع (VAT Payable)</span>
                  <span className={data.netVatDue >= 0 ? "text-[var(--color-gold-400)]" : "text-emerald-400"}>
                    {formatMoney(data.netVatDue)}
                  </span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      ) : null}
    </div>
  );
}
