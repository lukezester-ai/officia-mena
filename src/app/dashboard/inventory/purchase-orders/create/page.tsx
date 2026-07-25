/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use client';

import React, { useState } from 'react';
import { ShoppingCart, ArrowRight, Save, Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPO } from '../po-actions';
import { extractInvoiceData } from '../../../invoices/autofill-actions'; // Reusing AI action

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function CreatePOPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Fill State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form State
  const [supplierName, setSupplierName] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [vatRate, setVatRate] = useState('15');

  // Calculated values
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const vatAmount = subtotal * (parseFloat(vatRate) / 100);
  const totalAmount = subtotal + vatAmount;

  const handleAiFill = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    
    // We can reuse the invoice AI logic perfectly because they extract the same shape (items)
    const res = await extractInvoiceData(aiPrompt);
    if (res.success && res.data) {
      if (res.data.clientName) {
        setSupplierName(res.data.clientName); // Supplier name mapped from clientName
      }
      
      if (res.data.items && res.data.items.length > 0) {
        const newItems = res.data.items.map((i: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        }));
        setItems([...items, ...newItems]);
      }
      setAiPrompt('');
    } else {
      alert('فشل الذكاء الاصطناعي في تحليل النص');
    }
    
    setIsAiLoading(false);
  };

  const handleSave = async () => {
    if (!supplierName || items.length === 0) {
      alert('يرجى إدخال اسم المورد وإضافة منتج واحد على الأقل');
      return;
    }
    
    setIsSubmitting(true);
    
    const formattedNotes = "المنتجات:\n" + items.map(i => `- ${i.description} (الكمية: ${i.quantity}, السعر: ${i.unitPrice})`).join('\n');
    
    const res = await createPO({
      supplierName,
      subtotal: subtotal,
      vatRate: parseFloat(vatRate),
      notes: formattedNotes
    });
    
    if (res.success) {
      router.push('/dashboard/inventory/purchase-orders');
    } else {
      alert('حدث خطأ: ' + res.error);
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(val);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventory/purchase-orders" className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
          <ArrowRight size={20} className="text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <ShoppingCart className="text-primary" size={32} />
            إنشاء أمر شراء جديد
          </h1>
          <p className="text-muted-foreground text-sm">أضف المنتجات المطلوبة من المورد</p>
        </div>
      </div>

      {/* AI Smart Fill Box */}
      <div className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute left-0 top-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="text-primary" /> التعبئة الذكية للذكاء الاصطناعي
        </h2>
        <div className="flex gap-3 relative z-10">
          <input 
            type="text" 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="مثال: اطلب 50 شاشة ديل بسعر 800 من شركة الجريسي..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
            onKeyDown={(e) => e.key === 'Enter' && handleAiFill()}
          />
          <button 
            onClick={handleAiFill}
            disabled={isAiLoading || !aiPrompt}
            className="bg-primary hover:bg-primary/90 text-black font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            توليد الطلب
          </button>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-white/5 shadow-xl overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* Supplier Details */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">بيانات المورد</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">اسم المورد أو الشركة *</label>
                <input 
                  type="text" 
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart size={18} className="text-primary" /> المنتجات المطلوبة
              </h2>
              <button 
                onClick={addItem}
                className="text-primary hover:text-primary/80 text-sm font-bold flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-lg"
              >
                <Plus size={16} /> إضافة منتج
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              {items.length === 0 ? (
                <div className="text-center py-8 bg-black/20 rounded-xl border border-white/5 border-dashed">
                  <p className="text-muted-foreground text-sm">لا توجد منتجات. استخدم الذكاء الاصطناعي أو أضف يدوياً.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-white/5">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="اسم المنتج"
                        className="w-full bg-transparent border-none px-3 py-2 text-white focus:outline-none text-sm"
                      />
                    </div>
                    <div className="w-24">
                      <input 
                        type="number" 
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="الكمية"
                        className="w-full bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none text-center text-sm font-mono"
                      />
                    </div>
                    <div className="w-32">
                      <input 
                        type="number" 
                        value={item.unitPrice || ''}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="سعر الشراء"
                        className="w-full bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none text-center text-sm font-mono"
                      />
                    </div>
                    <div className="w-32 text-center text-primary font-mono font-bold text-sm bg-primary/5 py-2 rounded-lg">
                      {formatMoney(item.quantity * item.unitPrice)}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors bg-white/5 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end">
              <div className="w-64">
                <label className="block text-sm font-bold text-muted-foreground mb-2">نسبة الضريبة</label>
                <select 
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="15">15%</option>
                  <option value="5">5%</option>
                  <option value="0">0%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-[#07070F] rounded-2xl p-6 text-white border border-white/10">
            <h3 className="font-bold text-primary mb-4">ملخص الأمر</h3>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between text-white/70">
                <span>المبلغ الأساسي</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>قيمة الضريبة</span>
                <span>{formatMoney(vatAmount)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white border-t border-white/20 pt-3 mt-2">
                <span>الإجمالي</span>
                <span className="text-primary">{formatMoney(totalAmount)}</span>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Actions */}
        <div className="p-6 bg-black/20 border-t border-white/5">
          <button 
            onClick={handleSave}
            disabled={isSubmitting || items.length === 0}
            className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} /> حفظ وإرسال أمر الشراء
          </button>
        </div>
      </div>
    </div>
  );
}
