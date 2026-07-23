import React from 'react';
import { getInvoiceById } from '../../invoice-actions';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

export default async function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const res = await getInvoiceById(resolvedParams.id);
  
  if (!res.success || !res.data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen" dir="rtl">
        <h2>الفاتورة غير موجودة</h2>
        <Link href="/dashboard/invoices" className="text-blue-500">العودة</Link>
      </div>
    );
  }

  const invoice = res.data;

  const formatMoney = (val: string) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(Number(val));
  };

  return (
    <div className="bg-white text-black min-h-screen p-8 print:p-0" dir="rtl">
      {/* Hide this print button when actually printing */}
      <div className="max-w-4xl mx-auto mb-8 print:hidden flex justify-end">
        <button 
          onClick={() => {
            if (typeof window !== 'undefined') window.print();
          }}
          className="bg-black text-white px-6 py-2 rounded-lg font-bold"
        >
          طباعة (Print)
        </button>
      </div>

      {/* A4 Print Container */}
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 print:border-none p-12 print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">فاتورة ضريبية</h1>
            <h2 className="text-xl text-gray-600 font-bold uppercase tracking-widest">Tax Invoice</h2>
          </div>
          
          <div className="text-left" dir="ltr">
            <h2 className="text-2xl font-bold text-gray-800">Officia MENA Corp</h2>
            <p className="text-sm text-gray-500 mt-1">Riyadh, Saudi Arabia</p>
            <p className="text-sm font-bold mt-1">TRN: 310123456700003</p>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="flex justify-between mb-12">
          <div>
            <div className="mb-4">
              <p className="text-gray-500 text-sm font-bold mb-1">فاتورة إلى / Billed To:</p>
              <p className="text-lg font-bold">{invoice.clientName}</p>
              {invoice.clientTrn && (
                <p className="text-sm mt-1">الرقم الضريبي (TRN): {invoice.clientTrn}</p>
              )}
            </div>
          </div>
          
          <div className="text-left" dir="ltr">
            <div className="mb-2">
              <span className="text-gray-500 font-bold text-sm mr-2">Invoice No:</span>
              <span className="font-bold">{invoice.invoiceNumber}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-500 font-bold text-sm mr-2">Issue Date:</span>
              <span className="font-bold">{new Date(invoice.issueDate).toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </div>

        {/* Items - Since we don't have separate items in DB, we print the notes block */}
        <div className="mb-12 min-h-[200px]">
          <table className="w-full text-left" dir="ltr">
            <thead>
              <tr className="border-b border-black">
                <th className="py-2 font-bold uppercase text-sm">Description / التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 text-gray-800 whitespace-pre-wrap">
                  {invoice.notes || 'Services rendered'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer: Totals and QR */}
        <div className="flex justify-between items-end border-t-2 border-black pt-8">
          
          {/* ZATCA QR Code must be printed */}
          <div>
            {invoice.zatcaQrCode ? (
              <div className="border border-gray-200 p-2 rounded inline-block">
                <QRCodeSVG value={invoice.zatcaQrCode} size={150} />
              </div>
            ) : (
              <div className="w-[150px] h-[150px] border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                مسودة - لا يوجد رمز ZATCA
                <br/>
                Draft - No QR
              </div>
            )}
          </div>

          {/* Totals Box */}
          <div className="w-80 text-left" dir="ltr">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600 font-bold">Subtotal (المبلغ الأساسي)</span>
              <span className="font-mono">{formatMoney(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600 font-bold">VAT {invoice.vatRate}% (الضريبة)</span>
              <span className="font-mono">{formatMoney(invoice.vatAmount)}</span>
            </div>
            <div className="flex justify-between py-4 text-xl font-bold border-b-4 border-black">
              <span>Total (الإجمالي)</span>
              <span className="font-mono">{formatMoney(invoice.totalAmount)}</span>
            </div>
          </div>

        </div>
        
        {/* ZATCA Compliance Note */}
        <div className="mt-16 text-center text-xs text-gray-400">
          <p>هذه الفاتورة تم إصدارها إلكترونياً وهي متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA).</p>
          <p>This invoice is electronically generated and is compliant with ZATCA regulations.</p>
        </div>

      </div>
    </div>
  );
}
