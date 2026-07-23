/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Filter, FileText, CheckCircle2, Clock, ScanLine } from 'lucide-react';
import Link from 'next/link';
import { getExpenses, createExpense } from './expenses-actions';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New Expense Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('office');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const res = await getExpenses();
    if (res.success && res.data) {
      setExpenses(res.data);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createExpense({
      description: desc,
      amount: parseFloat(amount),
      category: cat,
      expenseDate: new Date().toISOString()
    });
    
    if (res.success) {
      setShowModal(false);
      setDesc('');
      setAmount('');
      fetchExpenses();
    } else {
      alert('Failed to add expense');
    }
    setIsSubmitting(false);
  };

  const formatMoney = (val: string) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(Number(val));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-1 flex items-center gap-3">
            <CreditCard className="text-[var(--color-gold-600)]" size={32} />
            إدارة النفقات
          </h1>
          <p className="text-[var(--color-desert-600)] text-sm">سجل وتتبع جميع مصاريف الشركة</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/dashboard/expenses/ocr"
            className="bg-white border-2 border-[var(--color-gold-500)] hover:bg-[var(--color-gold-50)] text-[var(--color-gold-700)] font-bold py-3 px-6 rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <ScanLine size={20} /> 
            مسح إيصال 📸
          </Link>
          
          <button 
            onClick={() => {
              setDesc(''); setAmount(''); setCat('office'); setShowModal(true);
            }}
            className="bg-[var(--color-gold-500)] hover:bg-[var(--color-gold-600)] text-black font-bold py-3 px-6 rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus size={20} /> إضافة نفقة يدوياً
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[var(--color-desert-200)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[var(--color-desert-200)] flex justify-between items-center bg-[var(--color-desert-50)]">
          <h2 className="font-bold text-[var(--color-desert-900)]">سجل النفقات</h2>
          <button className="text-[var(--color-desert-500)] hover:text-[var(--color-desert-900)] p-2 bg-white rounded-lg border border-[var(--color-desert-200)]">
            <Filter size={18} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="text-xs text-[var(--color-desert-500)] bg-[var(--color-desert-50)]/50">
              <tr>
                <th className="px-6 py-4 font-bold">الوصف</th>
                <th className="px-6 py-4 font-bold">التصنيف</th>
                <th className="px-6 py-4 font-bold">المبلغ</th>
                <th className="px-6 py-4 font-bold">التاريخ</th>
                <th className="px-6 py-4 font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-desert-100)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-desert-400)]">
                    جاري التحميل...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex flex-col items-center gap-3 text-[var(--color-desert-400)]">
                      <FileText size={32} />
                      <p>لا توجد نفقات مسجلة بعد</p>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[var(--color-desert-50)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[var(--color-desert-900)]">{exp.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-white border border-[var(--color-desert-200)] px-2 py-1 rounded-lg text-xs font-bold text-[var(--color-desert-600)]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-[var(--color-desert-900)]">
                      {formatMoney(exp.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-desert-500)]">
                      {new Date(exp.expenseDate).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      {exp.status === 'pending' ? (
                        <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg w-max text-xs font-bold border border-amber-200">
                          <Clock size={14} /> بانتظار التسوية
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-max text-xs font-bold border border-emerald-200">
                          <CheckCircle2 size={14} /> تمت التسوية
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-6 border-b border-[var(--color-desert-200)] bg-[var(--color-desert-50)]">
              <h2 className="text-xl font-bold text-[var(--color-desert-900)]">إضافة نفقة جديدة</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">الوصف</label>
                <input 
                  type="text" 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">المبلغ (ريال)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">التصنيف</label>
                <select 
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                >
                  <option value="office">مستلزمات مكتبية</option>
                  <option value="travel">سفر وإقامة</option>
                  <option value="software">برمجيات واشتراكات</option>
                  <option value="meals">ضيافة ووجبات</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-[var(--color-desert-900)] hover:bg-black text-white font-bold py-3 rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ النفقة'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white border border-[var(--color-desert-200)] hover:bg-[var(--color-desert-50)] text-[var(--color-desert-700)] font-bold py-3 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
