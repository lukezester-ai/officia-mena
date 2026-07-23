import React from 'react';
import { getInvoiceById } from '../invoice-actions';
import { FileText, Printer, ArrowRight, CheckCircle2, QrCode, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const res = await getInvoiceById(resolvedParams.id);
  
  if (!res.success || !res.data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[var(--color-desert-500)]" dir="rtl">
        <h2 className="text-xl font-bold mb-2">الفاتورة غير موجودة</h2>
        <Link href="/dashboard/invoices" className="text-[var(--color-gold-600)] hover:underline">العودة للفواتير</Link>
      </div>
    );
  }

  const invoice = res.data;

  const formatMoney = (val: string) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(Number(val));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12" dir="rtl">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices" className="p-2 bg-white rounded-full border border-[var(--color-desert-200)] hover:bg-[var(--color-desert-50)] transition-colors">
            <ArrowRight size={20} className="text-[var(--color-desert-600)]" />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-desert-900)] flex items-center gap-2">
            تفاصيل الفاتورة <span className="font-mono text-[var(--color-desert-500)]">#{invoice.invoiceNumber}</span>
          </h1>
        </div>
        
        <div className="flex gap-3">
          <Link 
            href={`/dashboard/invoices/${invoice.id}/print`} 
            target="_blank"
            className="bg-white border-2 border-[var(--color-desert-200)] hover:border-[var(--color-desert-300)] text-[var(--color-desert-700)] font-bold py-2 px-6 rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <Printer size={18} /> طباعة A4
          </Link>
          {invoice.status !== 'paid' && (
            <button className="bg-[var(--color-gold-500)] hover:bg-[var(--color-gold-600)] text-black font-bold py-2 px-6 rounded-xl transition-colors shadow-sm flex items-center gap-2">
              <CreditCard size={18} /> تسجيل كمدفوعة
            </button>
          )}
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white border border-[var(--color-desert-200)] rounded-3xl shadow-sm overflow-hidden relative">
        {/* Status Banner */}
        <div className={`p-4 text-center font-bold text-sm ${
          invoice.status === 'draft' ? 'bg-amber-100 text-amber-800' :
          invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
          'bg-indigo-100 text-indigo-800'
        }`}>
          {invoice.status === 'draft' && 'مسودة (لم يتم الاعتماد)'}
          {invoice.status === 'issued' && 'مُصدرة (معتمدة وجاهزة للدفع)'}
          {invoice.status === 'paid' && 'مدفوعة بالكامل'}
        </div>

        <div className="p-8 md:p-12">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-[var(--color-desert-100)] pb-8 mb-8">
            <div>
              <h2 className="text-sm font-bold text-[var(--color-desert-500)] uppercase tracking-wider mb-2">فاتورة إلى (Billed To)</h2>
              <p className="text-xl font-bold text-[var(--color-desert-900)] mb-1">{invoice.clientName}</p>
              {invoice.clientTrn && (
                <p className="text-sm text-[var(--color-desert-600)] font-mono">الرقم الضريبي: {invoice.clientTrn}</p>
              )}
            </div>
            
            <div className="text-right">
              <div className="mb-4">
                <p className="text-sm font-bold text-[var(--color-desert-500)] mb-1">تاريخ الإصدار</p>
                <p className="font-bold text-[var(--color-desert-900)]">{new Date(invoice.issueDate).toLocaleDateString('ar-SA')}</p>
              </div>
            </div>
          </div>

          {/* Items / Notes Section */}
          <div className="mb-12">
            <h3 className="font-bold text-[var(--color-desert-900)] mb-4 flex items-center gap-2">
              <FileText size={18} className="text-[var(--color-gold-600)]"/>
              التفاصيل
            </h3>
            <div className="bg-[var(--color-desert-50)] p-6 rounded-2xl border border-[var(--color-desert-100)] whitespace-pre-wrap text-[var(--color-desert-700)]">
              {invoice.notes || 'لا توجد تفاصيل إضافية'}
            </div>
          </div>

          {/* Bottom Section: Totals & ZATCA */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            {/* ZATCA QR Code */}
            <div className="w-full md:w-auto flex flex-col items-center bg-[var(--color-desert-50)] p-4 rounded-2xl border border-[var(--color-desert-200)]">
              {invoice.zatcaQrCode ? (
                <>
                  <div className="bg-white p-2 rounded-xl shadow-sm mb-3">
                    <QRCodeSVG value={invoice.zatcaQrCode} size={120} />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 size={14} /> معتمدة من هيئة الزكاة
                  </div>
                </>
              ) : (
                <div className="w-[120px] h-[120px] bg-white rounded-xl border border-dashed border-[var(--color-desert-300)] flex items-center justify-center text-[var(--color-desert-400)] mb-3 flex-col gap-2">
                  <QrCode size={24} />
                  <span className="text-[10px]">لا يوجد QR</span>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="w-full md:w-80 space-y-4 text-left md:text-right" dir="ltr">
              <div className="flex justify-between items-center text-sm font-bold text-[var(--color-desert-600)]">
                <span>(Subtotal) المبلغ الأساسي</span>
                <span className="font-mono">{formatMoney(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-[var(--color-desert-600)]">
                <span>(VAT {invoice.vatRate}%) ضريبة القيمة المضافة</span>
                <span className="font-mono">{formatMoney(invoice.vatAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-[var(--color-desert-900)] border-t-2 border-[var(--color-desert-900)] pt-4 mt-2">
                <span>(Total) الإجمالي</span>
                <span className="font-mono">{formatMoney(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
