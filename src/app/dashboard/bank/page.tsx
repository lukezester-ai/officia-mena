/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { Landmark, ArrowUpRight, ArrowDownRight, Search, CheckCircle2, AlertCircle, BrainCircuit } from 'lucide-react';
import { getBankAccounts, getBankTransactions } from './bank-actions';
import { runSmartReconciliation } from './reconcile-actions';

export default function BankPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReconciling, setIsReconciling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [accRes, transRes] = await Promise.all([
      getBankAccounts(),
      getBankTransactions()
    ]);
    
    if (accRes.success && accRes.data) {
      setAccounts(accRes.data);
    }
    if (transRes.success && transRes.data) {
      setTransactions(transRes.data);
    }
    setLoading(false);
  };

  const formatMoney = (val: string) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(Number(val));
  };

  const handleReconcile = async () => {
    setIsReconciling(true);
    try {
      const res = await runSmartReconciliation();
      if (res.success) {
        if (res.matchedCount && res.matchedCount > 0) {
          alert(`تمت تسوية ${res.matchedCount} عملية بنجاح!`);
        } else {
          alert(res.message || 'لم يتم العثور على عمليات متطابقة.');
        }
        await fetchData(); // Refresh table
      } else {
        alert(res.error || 'فشل في التسوية الذكية');
      }
    } catch (error) {
      alert('حدث خطأ');
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-1 flex items-center gap-3">
            <Landmark className="text-[var(--color-gold-600)]" size={32} />
            البنك والتسويات
          </h1>
          <p className="text-[var(--color-desert-600)] text-sm">إدارة الحسابات البنكية والتسوية الذكية للعمليات</p>
        </div>
        <button 
          onClick={handleReconcile}
          disabled={isReconciling || loading}
          className="bg-[var(--color-desert-900)] hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm flex items-center gap-2 group disabled:opacity-50"
        >
          <BrainCircuit size={20} className={`text-[var(--color-gold-500)] ${isReconciling ? 'animate-spin' : 'group-hover:animate-pulse'}`} /> 
          {isReconciling ? 'جاري التحليل (AI)...' : 'التسوية الذكية (AI)'}
        </button>
      </div>

      {/* Bank Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="h-48 bg-white border border-[var(--color-desert-200)] rounded-3xl animate-pulse"></div>
        ) : (
          accounts.map(acc => (
            <div key={acc.id} className="relative overflow-hidden rounded-3xl p-6 flex flex-col justify-between h-48 border border-[var(--color-gold-200)] shadow-sm bg-gradient-to-br from-white to-[var(--color-gold-50)] group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-gold-200)] rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
              
              <div className="flex justify-between items-start z-10">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-[var(--color-desert-100)] flex items-center justify-center text-[var(--color-desert-900)] font-bold text-xl">
                    {acc.bankName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-desert-900)]">{acc.bankName}</h3>
                    <p className="text-xs text-[var(--color-desert-500)]">{acc.accountName}</p>
                  </div>
                </div>
                <div className="text-[10px] tracking-wider text-[var(--color-desert-500)] font-mono">
                  {acc.iban.match(/.{1,4}/g)?.join(' ')}
                </div>
              </div>
              
              <div className="z-10">
                <div className="text-sm text-[var(--color-desert-600)] mb-1">الرصيد المتاح</div>
                <div className="text-3xl font-mono font-bold text-[var(--color-desert-900)]">
                  {formatMoney(acc.currentBalance)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-3xl border border-[var(--color-desert-200)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[var(--color-desert-200)] flex justify-between items-center bg-[var(--color-desert-50)]">
          <h2 className="font-bold text-[var(--color-desert-900)]">العمليات البنكية الأخيرة</h2>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-desert-400)]" size={16} />
            <input 
              type="text" 
              placeholder="بحث في العمليات..." 
              className="bg-white border border-[var(--color-desert-200)] rounded-lg py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--color-gold-500)]"
              dir="rtl"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="text-xs text-[var(--color-desert-500)] bg-[var(--color-desert-50)]/50">
              <tr>
                <th className="px-6 py-4 font-bold w-12"></th>
                <th className="px-6 py-4 font-bold">التفاصيل</th>
                <th className="px-6 py-4 font-bold">المبلغ</th>
                <th className="px-6 py-4 font-bold">التاريخ</th>
                <th className="px-6 py-4 font-bold">التسوية (Reconciliation)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-desert-100)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-desert-400)]">
                    جاري التحميل...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-desert-400)]">
                    لا توجد عمليات بنكية
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[var(--color-desert-50)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        t.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {t.type === 'IN' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[var(--color-desert-900)]">{t.description}</p>
                      <p className="text-xs text-[var(--color-desert-400)] font-mono mt-1">ID: {t.id.split('-')[0]}</p>
                    </td>
                    <td className={`px-6 py-4 font-mono font-bold ${
                      t.type === 'IN' ? 'text-emerald-600' : 'text-[var(--color-desert-900)]'
                    }`}>
                      {t.type === 'IN' ? '+' : '-'}{formatMoney(t.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-desert-500)]">
                      {new Date(t.transactionDate).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      {t.status === 'reconciled' ? (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-max text-xs font-bold border border-emerald-200">
                          <CheckCircle2 size={14} /> تمت التسوية
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg w-max text-xs font-bold border border-amber-200">
                          <AlertCircle size={14} /> غير مسوى (Unreconciled)
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
    </div>
  );
}
