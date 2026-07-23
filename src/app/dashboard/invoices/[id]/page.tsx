/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { FileText, Calendar, CheckCircle2, AlertCircle, ArrowRight, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getInvoiceInstallments, createInstallmentPlan, payInstallment } from '../installments-actions';
import { getInvoices } from '../invoice-actions';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [splitCount, setSplitCount] = useState(3);
  const [isSplitting, setIsSplitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Find the invoice
    const invRes = await getInvoices();
    if (invRes.success && invRes.data) {
      const inv = invRes.data.find(i => i.id === invoiceId);
      setInvoice(inv);
    }
    
    // Get installments
    const instRes = await getInvoiceInstallments(invoiceId);
    if (instRes.success && instRes.data) {
      setInstallments(instRes.data);
    }
    setLoading(false);
  }, [invoiceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreatePlan = async () => {
    setIsSplitting(true);
    const res = await createInstallmentPlan(invoiceId, splitCount);
    if (res.success) {
      fetchData(); // Refresh installments list
    } else {
      alert('خطأ أثناء إنشاء خطة الدفع: ' + res.error);
    }
    setIsSplitting(false);
  };
  
  const handlePay = async (id: string) => {
    const res = await payInstallment(id);
    if (res.success) {
      fetchData();
    }
  };

  const formatMoney = (val: string) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(Number(val));
  };

  if (loading) return <div className="p-8 text-center" dir="rtl">جاري التحميل...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-500" dir="rtl">الفاتورة غير موجودة</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
      
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/invoices" className="p-2 bg-white rounded-full border border-[var(--color-desert-200)] hover:bg-[var(--color-desert-50)] transition-colors">
          <ArrowRight size={20} className="text-[var(--color-desert-600)]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-1 flex items-center gap-3">
            <FileText className="text-[var(--color-gold-600)]" size={32} />
            تفاصيل الفاتورة ({invoice.invoiceNumber})
          </h1>
          <p className="text-[var(--color-desert-600)] text-sm">العميل: {invoice.clientName} | الإجمالي: {formatMoney(invoice.totalAmount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT: Split Controls */}
        <div className="bg-white rounded-3xl border border-[var(--color-desert-200)] p-8 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-[var(--color-desert-900)] mb-4 flex items-center gap-2">
            <Wallet className="text-[var(--color-gold-600)]" /> الدفع بالتقسيط (Installments)
          </h2>
          
          <p className="text-sm text-[var(--color-desert-600)] mb-6">
            يمكنك تقسيم هذه الفاتورة إلى دفعات متعددة لتسهيل السداد على العميل. سيتم توزيع المبلغ الإجمالي بالتساوي.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[var(--color-desert-900)] mb-2">عدد الدفعات</label>
              <select 
                value={splitCount} 
                onChange={(e) => setSplitCount(Number(e.target.value))}
                className="w-full bg-white border border-[var(--color-desert-200)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-gold-500)]"
              >
                <option value={2}>دفعتين (2)</option>
                <option value={3}>ثلاث دفعات (3)</option>
                <option value={4}>أربع دفعات (4)</option>
                <option value={6}>ست دفعات (6)</option>
                <option value={12}>سنة كاملة (12 دفعة)</option>
              </select>
            </div>
            
            <button 
              onClick={handleCreatePlan}
              disabled={isSplitting}
              className="w-full bg-[var(--color-desert-900)] hover:bg-black text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isSplitting ? 'جاري الإنشاء...' : 'إنشاء جدول زمني للدفع'}
            </button>
          </div>
        </div>

        {/* RIGHT: Installments List */}
        <div className="bg-white rounded-3xl border border-[var(--color-desert-200)] p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[var(--color-desert-900)] mb-6 flex items-center gap-2">
            <Calendar className="text-[var(--color-gold-600)]" /> جدول المدفوعات
          </h2>
          
          {installments.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-[var(--color-desert-200)] rounded-2xl">
              <AlertCircle size={40} className="text-[var(--color-desert-300)] mx-auto mb-3" />
              <p className="text-[var(--color-desert-500)]">لا توجد خطة تقسيط لهذه الفاتورة.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {installments.map((inst, index) => (
                <div key={inst.id} className={`p-4 rounded-xl border flex items-center justify-between ${inst.status === 'paid' ? 'bg-emerald-50 border-emerald-200' : 'bg-[var(--color-desert-50)] border-[var(--color-desert-200)]'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[var(--color-desert-900)]">الدفعة {index + 1}</span>
                      {inst.status === 'paid' && <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">مدفوعة</span>}
                    </div>
                    <div className="text-sm text-[var(--color-desert-500)] flex items-center gap-1 font-mono">
                      <Calendar size={12} /> {new Date(inst.dueDate).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-mono font-bold text-lg text-[var(--color-desert-900)]">{formatMoney(inst.amount)}</span>
                    {inst.status !== 'paid' && (
                      <button 
                        onClick={() => handlePay(inst.id)}
                        className="text-xs bg-white border border-[var(--color-desert-200)] hover:bg-[var(--color-desert-100)] text-[var(--color-desert-900)] px-3 py-1 rounded-lg font-bold transition-colors"
                      >
                        تأكيد الدفع
                      </button>
                    )}
                    {inst.status === 'paid' && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> تم
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
