'use client';

import { useState } from 'react';
import { createInvoice } from '../actions';
import { Plus, Trash2, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NewInvoicePage() {
  const [items, setItems] = useState([
    { id: 1, name: '', quantity: 1, price: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vatAmount = subtotal * 0.15;
  const total = subtotal + vatAmount;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices" className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-500" />
              إنشاء فاتورة جديدة
            </h1>
          </div>
        </div>
      </div>

      <form 
        action={async (formData) => {
          setIsSubmitting(true);
          formData.append('items', JSON.stringify(items));
          await createInvoice(formData);
        }}
        className="space-y-8"
      >
        {/* Client Details Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <h2 className="text-lg font-medium text-white border-b border-zinc-800 pb-4">بيانات العميل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">اسم العميل *</label>
              <input required name="clientName" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="مثال: شركة النور" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">الرقم الضريبي (إن وجد)</label>
              <input name="clientCrn" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="3000..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-400">العنوان</label>
              <input name="clientAddress" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="الرياض، المملكة العربية السعودية" />
            </div>
          </div>
        </div>

        {/* Invoice Items Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-medium text-white">المنتجات / الخدمات</h2>
          </div>
          
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-zinc-400 px-4 hidden md:grid">
              <div className="col-span-6">الوصف</div>
              <div className="col-span-2">الكمية</div>
              <div className="col-span-2">السعر (ريال)</div>
              <div className="col-span-2 text-left">المجموع</div>
            </div>

            {/* Rows */}
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                <div className="col-span-1 md:col-span-6">
                  <input 
                    type="text" 
                    required
                    placeholder="وصف المنتج أو الخدمة" 
                    className="w-full bg-transparent border-none p-0 text-white focus:ring-0"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <input 
                    type="number" 
                    min="1"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-center"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-center"
                    value={item.price || ''}
                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end items-center gap-4">
                  <span className="text-white font-medium">{(item.price * item.quantity).toFixed(2)}</span>
                  <button 
                    type="button" 
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={addItem}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium px-4 py-2 hover:bg-blue-500/10 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة بند آخر
          </button>
        </div>

        {/* Summary Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="w-full md:w-1/2 space-y-4">
             <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">ملاحظات الفاتورة</h3>
                <textarea 
                  name="notes" 
                  rows={3} 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" 
                  placeholder="أي ملاحظات إضافية للعميل..."
                ></textarea>
             </div>
          </div>
          
          <div className="w-full md:w-1/3 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between text-zinc-400">
              <span>المجموع الفرعي:</span>
              <span className="text-white">{subtotal.toFixed(2)} SAR</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>ضريبة القيمة المضافة (15%):</span>
              <span className="text-white">{vatAmount.toFixed(2)} SAR</span>
            </div>
            <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
              <span className="font-bold text-white">الإجمالي:</span>
              <span className="text-2xl font-bold text-blue-500">{total.toFixed(2)} SAR</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pb-12">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 text-lg"
          >
            {isSubmitting ? 'جاري الحفظ...' : 'إصدار الفاتورة'}
          </button>
        </div>
      </form>
    </div>
  );
}
