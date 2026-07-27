'use client';

import { useState } from 'react';
import { createProduct } from '../actions';
import { Package, ArrowRight, Save, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState('product'); // 'product' | 'service'
  const [isHalal, setIsHalal] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products" className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <Package className="w-6 h-6 text-emerald-500" />
              إضافة صنف جديد
            </h1>
          </div>
        </div>
      </div>

      <form 
        action={async (formData) => {
          setIsSubmitting(true);
          await createProduct(formData);
        }}
        className="space-y-8"
      >
        {/* Type Toggle */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <h2 className="text-lg font-medium text-white border-b border-zinc-800 pb-4">نوع الصنف</h2>
          <div className="flex gap-4">
            <label className={`flex-1 cursor-pointer rounded-xl border p-4 transition-all ${type === 'product' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900'}`}>
              <input type="radio" name="type" value="product" checked={type === 'product'} onChange={() => setType('product')} className="sr-only" />
              <div className="font-bold text-white mb-1">منتج ملموس</div>
              <div className="text-sm text-zinc-400">بضاعة لها كميات في المخزن</div>
            </label>
            <label className={`flex-1 cursor-pointer rounded-xl border p-4 transition-all ${type === 'service' ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900'}`}>
              <input type="radio" name="type" value="service" checked={type === 'service'} onChange={() => setType('service')} className="sr-only" />
              <div className="font-bold text-white mb-1">خدمة</div>
              <div className="text-sm text-zinc-400">خدمات استشارية، صيانة، إلخ (لا تتبع كميات)</div>
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <h2 className="text-lg font-medium text-white border-b border-zinc-800 pb-4">البيانات الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-400">اسم الصنف *</label>
              <input required name="name" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="مثال: لابتوب ديل / استشارة هندسية" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">رمز المنتج (SKU) *</label>
              <input required name="sku" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans" dir="ltr" placeholder="LAP-101" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">الباركود (إن وجد)</label>
              <input name="barcode" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans" dir="ltr" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">الفئة</label>
              <input name="category" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="مثال: إلكترونيات" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <h2 className="text-lg font-medium text-white border-b border-zinc-800 pb-4">التسعير (SAR)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">سعر البيع (قبل الضريبة) *</label>
              <input required name="unitPrice" type="number" step="0.01" min="0" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans" dir="ltr" placeholder="100.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">التكلفة (اختياري)</label>
              <input name="costPrice" type="number" step="0.01" min="0" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans" dir="ltr" placeholder="80.00" />
            </div>
          </div>
        </div>

        {/* Halal / MENA Compliance - ONLY for products */}
        {type === 'product' && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl space-y-6 relative overflow-hidden">
            {/* Background Icon */}
            <ShieldCheck className="absolute -left-4 -bottom-4 w-32 h-32 text-emerald-500/5" />
            
            <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-medium text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                تراخيص الجودة وشهادة Halal
              </h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm font-medium text-white">הمح المنتج معتمد (Halal)؟</span>
                <input 
                  type="checkbox" 
                  name="isHalalCertified"
                  checked={isHalal}
                  onChange={(e) => setIsHalal(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900" 
                />
              </label>
            </div>

            {isHalal && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">رقم شهادة حلال</label>
                  <input name="halalCertificateNumber" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-sans" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">تاريخ انتهاء الشهادة</label>
                  <input name="halalExpiryDate" type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-sans" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">تاريخ انتهاء الصلاحية (هجري)</label>
                  <input name="expiryDateHijri" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-sans" dir="ltr" placeholder="مثال: 1446-08-01" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pb-12">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 text-lg"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ الصنف'}
          </button>
        </div>
      </form>
    </div>
  );
}
