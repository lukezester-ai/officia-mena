/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, CheckCircle2, FileEdit, QrCode, LayoutList, Table, Printer } from 'lucide-react';
import Link from 'next/link';
import { getInvoices, updateInvoiceStatus } from './invoice-actions';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'spreadsheet'>('list');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const res = await getInvoices();
    if (res.success && res.data) {
      setInvoices(res.data);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
    
    const res = await updateInvoiceStatus(id, newStatus);
    if (!res.success) {
      alert('فشل في تحديث الحالة');
      fetchInvoices(); // Revert on failure
    } else if (newStatus === 'issued') {
      // Refresh to get the generated ZATCA QR status
      fetchInvoices();
    }
  };

  const formatMoney = (val: string) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(Number(val));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-1 flex items-center gap-3">
            <FileText className="text-[var(--color-gold-600)]" size={32} />
            الفواتير الإلكترونية (E-Invoicing)
          </h1>
          <p className="text-[var(--color-desert-600)] text-sm">إدارة الفواتير متوافقة مع هيئة الزكاة والضريبة (ZATCA)</p>
        </div>
        <Link 
          href="/dashboard/invoices/create"
          className="bg-[var(--color-gold-500)] hover:bg-[var(--color-gold-600)] text-black font-bold py-3 px-6 rounded-xl transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={20} /> إنشاء فاتورة جديدة
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-[var(--color-desert-200)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--color-desert-200)] flex justify-between items-center bg-[var(--color-desert-50)]">
          <div className="flex bg-white rounded-lg border border-[var(--color-desert-200)] p-1">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-bold transition-colors ${viewMode === 'list' ? 'bg-[var(--color-desert-900)] text-white' : 'text-[var(--color-desert-500)] hover:bg-[var(--color-desert-100)]'}`}
            >
              <LayoutList size={16} /> عرض القائمة
            </button>
            <button 
              onClick={() => setViewMode('spreadsheet')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-bold transition-colors ${viewMode === 'spreadsheet' ? 'bg-[var(--color-desert-900)] text-white' : 'text-[var(--color-desert-500)] hover:bg-[var(--color-desert-100)]'}`}
            >
              <Table size={16} /> وضع الإكسل (سريع)
            </button>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-desert-400)]" size={16} />
            <input 
              type="text" 
              placeholder="بحث برقم الفاتورة..." 
              className="bg-white border border-[var(--color-desert-200)] rounded-lg py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--color-gold-500)] w-64"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className={`w-full text-right ${viewMode === 'spreadsheet' ? 'border-collapse' : ''}`}>
            <thead className="text-xs text-[var(--color-desert-500)] bg-[var(--color-desert-50)]/50">
              <tr>
                <th className={`px-6 py-4 font-bold ${viewMode === 'spreadsheet' ? 'border border-[var(--color-desert-200)]' : ''}`}>رقم الفاتورة</th>
                <th className={`px-6 py-4 font-bold ${viewMode === 'spreadsheet' ? 'border border-[var(--color-desert-200)]' : ''}`}>العميل</th>
                <th className={`px-6 py-4 font-bold ${viewMode === 'spreadsheet' ? 'border border-[var(--color-desert-200)]' : ''}`}>التاريخ</th>
                <th className={`px-6 py-4 font-bold ${viewMode === 'spreadsheet' ? 'border border-[var(--color-desert-200)]' : ''}`}>الإجمالي</th>
                <th className={`px-6 py-4 font-bold ${viewMode === 'spreadsheet' ? 'border border-[var(--color-desert-200)]' : ''}`}>ZATCA</th>
                <th className={`px-6 py-4 font-bold ${viewMode === 'spreadsheet' ? 'border border-[var(--color-desert-200)]' : ''}`}>الحالة</th>
              </tr>
            </thead>
            <tbody className={viewMode === 'list' ? 'divide-y divide-[var(--color-desert-100)]' : ''}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--color-desert-400)]">جاري التحميل...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--color-desert-400)]">لا توجد فواتير بعد</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className={viewMode === 'spreadsheet' ? 'hover:bg-blue-50/50 transition-colors' : 'hover:bg-[var(--color-desert-50)]/50 transition-colors'}>
                    
                    {/* Invoice Number */}
                    <td className={`px-6 py-4 font-mono text-[var(--color-desert-900)] ${viewMode === 'spreadsheet' ? 'border border-[var(--color-desert-200)] p-0' : 'font-bold'}`}>
                      {viewMode === 'spreadsheet' ? (
                        <input type="text" readOnly value={inv.invoiceNumber} className="w-full h-full p-3 bg-transparent outline-none cursor-default font-mono text-sm" />
                      ) : (
                        inv.invoiceNumber
                      )}
                    </td>
                    
                    {/* Client */}
                    <td className={`px-6 py-4 ${viewMode === 'spreadsheet' ? 'border border-[var(--color-desert-200)] p-0' : ''}`}>
                      {viewMode === 'spreadsheet' ? (
                        <input type="text" readOnly value={inv.clientName} className="w-full h-full p-3 bg-transparent outline-none cursor-default font-bold text-sm text-[var(--color-desert-900)]" />
                      ) : (
                        <>
                          <p className="font-bold text-[var(--color-desert-900)]">{inv.clientName}</p>
                          {inv.clientTrn && <p className="text-xs text-[var(--color-desert-500)] font-mono">TRN: {inv.clientTrn}</p>}
                        </>
                      )}
                    </td>
                    
                    {/* Date */}
                    <td className={`px-6 py-4 text-sm text-[var(--color-desert-500)] ${viewMode === 'spreadsheet' ? 'border border-[var(--color-desert-200)] p-0' : ''}`}>
                      {viewMode === 'spreadsheet' ? (
                        <input type="text" readOnly value={new Date(inv.issueDate).toLocaleDateString('ar-SA')} className="w-full h-full p-3 bg-transparent outline-none cursor-default text-sm" />
                      ) : (
                        new Date(inv.issueDate).toLocaleDateString('ar-SA')
                      )}
                    </td>
                    
                    {/* Total */}
                    <td className={`px-6 py-4 font-mono font-bold text-[var(--color-desert-900)] ${viewMode === 'spreadsheet' ? 'border border-[var(--color-desert-200)] p-0' : ''}`}>
                      {viewMode === 'spreadsheet' ? (
                        <input type="text" readOnly value={formatMoney(inv.totalAmount)} className="w-full h-full p-3 bg-transparent outline-none cursor-default text-sm text-[var(--color-desert-900)] font-mono font-bold text-right" />
                      ) : (
                        formatMoney(inv.totalAmount)
                      )}
                    </td>
                    
                    {/* ZATCA Status */}
                    <td className={`px-6 py-4 ${viewMode === 'spreadsheet' ? 'border border-[var(--color-desert-200)] text-center' : ''}`}>
                      {inv.isZatcaReported ? (
                        <div className={`flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-max text-xs font-bold border border-emerald-200 ${viewMode === 'spreadsheet' ? 'mx-auto' : ''}`}>
                          <QrCode size={14} /> معتمد
                        </div>
                      ) : (
                        <div className={`flex items-center gap-1 text-[var(--color-desert-400)] bg-[var(--color-desert-50)] px-2 py-1 rounded-lg w-max text-xs font-bold border border-[var(--color-desert-200)] ${viewMode === 'spreadsheet' ? 'mx-auto' : ''}`}>
                          -
                        </div>
                      )}
                    </td>
                    
                    {/* Status with Inline Edit in Spreadsheet mode */}
                    <td className={`px-6 py-4 ${viewMode === 'spreadsheet' ? 'border border-[var(--color-desert-200)] p-0 bg-yellow-50/30' : ''}`}>
                      {viewMode === 'spreadsheet' ? (
                        <select 
                          value={inv.status}
                          onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                          className={`w-full h-full p-3 bg-transparent outline-none text-sm font-bold cursor-pointer ${inv.status === 'draft' ? 'text-amber-600' : 'text-indigo-600'}`}
                        >
                          <option value="draft">مسودة (Draft)</option>
                          <option value="issued">مُصدرة (Issued)</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-4">
                          {inv.status === 'draft' ? (
                            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg w-max text-xs font-bold border border-amber-200">
                              <FileEdit size={14} /> مسودة (Draft)
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg w-max text-xs font-bold border border-indigo-200">
                              <CheckCircle2 size={14} /> مُصدرة (Issued)
                            </span>
                          )}
                          <div className="flex flex-col gap-1">
                            <Link href={`/dashboard/invoices/${inv.id}`} className="text-xs bg-white border border-[var(--color-desert-200)] hover:bg-[var(--color-desert-100)] px-2 py-1 rounded shadow-sm text-[var(--color-desert-600)] font-bold transition-colors flex items-center gap-1"><FileText size={12}/> التفاصيل / التقسيط</Link>
                            <Link href={`/dashboard/invoices/${inv.id}/print`} target="_blank" className="text-xs bg-[var(--color-gold-500)] text-black hover:bg-[var(--color-gold-600)] border border-[var(--color-gold-600)] px-2 py-1 rounded shadow-sm font-bold transition-colors flex items-center gap-1"><Printer size={12}/> طباعة (A4)</Link>
                          </div>
                        </div>
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
