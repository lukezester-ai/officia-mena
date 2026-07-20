'use client';

import React, { useEffect, useState } from 'react';
import { FileSignature, Plus, ArrowRight, ArrowLeftRight, Loader2, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { getQuotations, convertToInvoice } from './quotation-actions';

interface Quotation {
  id: string;
  quotationNumber: string;
  clientName: string;
  totalAmount: string;
  status: string;
  issueDate: string | null;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      const res = await getQuotations();
      if (res.success && res.data) {
        setQuotations(res.data);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  const handleConvert = async (id: string) => {
    if (confirm('هل أنت متأكد من تحويل عرض السعر هذا إلى فاتورة رسمية؟')) {
      setConvertingId(id);
      const res = await convertToInvoice(id);
      if (res.success) {
        alert('تم تحويل العرض إلى فاتورة بنجاح: ' + res.invoiceNumber);
        // Remove from list or change status
        setQuotations(quotations.map(q => q.id === id ? { ...q, status: 'converted' } : q));
      } else {
        alert('حدث خطأ أثناء التحويل: ' + res.error);
      }
      setConvertingId(null);
    }
  };

  const formatMoney = (val: string) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(parseFloat(val));
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <FileSignature className="text-primary" /> عروض الأسعار (Quotations)
          </h1>
          <p className="text-muted-foreground mt-1">إدارة عروض الأسعار وتحويلها إلى فواتير</p>
        </div>
        <Link 
          href="/dashboard/quotations/create" 
          className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> عرض سعر جديد
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-white/5 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : quotations.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            لا توجد عروض أسعار حتى الآن
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-white/5 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">رقم العرض</th>
                  <th className="px-6 py-4 font-semibold">العميل</th>
                  <th className="px-6 py-4 font-semibold">التاريخ</th>
                  <th className="px-6 py-4 font-semibold">المبلغ</th>
                  <th className="px-6 py-4 font-semibold">الحالة</th>
                  <th className="px-6 py-4 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-white">{q.quotationNumber}</td>
                    <td className="px-6 py-4 font-bold text-white">{q.clientName}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {q.issueDate ? new Date(q.issueDate).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 font-mono text-primary font-bold">
                      {formatMoney(q.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      {q.status === 'converted' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                          <CheckCircle size={14} /> محول لفاتورة
                        </span>
                      ) : q.status === 'sent' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
                          <Clock size={14} /> مرسل
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white/70">
                          {q.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {q.status !== 'converted' && (
                        <button
                          onClick={() => handleConvert(q.id)}
                          disabled={convertingId === q.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary hover:text-black rounded-lg transition-all font-bold text-xs disabled:opacity-50"
                        >
                          {convertingId === q.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ArrowLeftRight className="w-4 h-4" />
                          )}
                          تحويل لفاتورة
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
