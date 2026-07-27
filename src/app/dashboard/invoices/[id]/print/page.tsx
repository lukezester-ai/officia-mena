import { db } from '@/lib/db/db';
import { invoices } from '@/lib/db/schema/invoices';
import { requireTenant } from '@/lib/auth/get-tenant';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

export default async function PrintInvoicePage({ params }: { params: { id: string } }) {
  const tenant = await requireTenant();
  
  const invoiceResult = await db.select()
    .from(invoices)
    .where(and(eq(invoices.id, params.id), eq(invoices.tenantId, tenant.id)))
    .limit(1);

  if (invoiceResult.length === 0) {
    notFound();
  }

  const invoice = invoiceResult[0];
  const items = JSON.parse(invoice.items || '[]');

  return (
    <div className="bg-white min-h-screen p-8 text-black" dir="rtl">
      
      {/* Print Controls (Hidden when actually printing) */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-end print:hidden">
        <button 
          id="print-button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg cursor-pointer"
        >
          طباعة / حفظ كـ PDF
        </button>
      </div>

      {/* A4 Document Area */}
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 border border-zinc-200 shadow-sm print:border-none print:shadow-none rounded-xl print:rounded-none">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-zinc-200 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 mb-2">فاتورة ضريبية</h1>
            <h2 className="text-xl text-zinc-600 uppercase tracking-widest font-sans">TAX INVOICE</h2>
          </div>
          <div className="text-left">
            <h3 className="text-2xl font-bold text-zinc-900">{tenant.name}</h3>
            <p className="text-zinc-600 mt-1 font-sans" dir="ltr">CRN: {tenant.crn}</p>
            <p className="text-zinc-600 font-sans" dir="ltr">VAT: {tenant.trn || '300000000000003'}</p>
          </div>
        </div>

        {/* Invoice Info & Client Details */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-4 w-1/2 border-r-2 border-zinc-100 pr-4">
            <div>
              <p className="text-sm text-zinc-500 font-bold mb-1">بيانات العميل / Bill To:</p>
              <h4 className="text-xl font-bold text-zinc-900">{invoice.clientName}</h4>
              {invoice.clientAddress && <p className="text-zinc-700 mt-1">{invoice.clientAddress}</p>}
              {invoice.clientCrn && <p className="text-zinc-700 font-sans mt-1" dir="ltr">VAT/CRN: {invoice.clientCrn}</p>}
            </div>
          </div>
          
          <div className="w-1/2 pl-8 flex justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500 font-bold mb-1">رقم الفاتورة / Invoice No:</p>
                <p className="text-lg font-bold text-zinc-900 font-sans" dir="ltr">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-bold mb-1">تاريخ الإصدار / Issue Date:</p>
                <p className="text-lg font-bold text-zinc-900 font-sans" dir="ltr">{invoice.issueDate.toLocaleDateString('en-GB')}</p>
              </div>
            </div>
            {/* ZATCA QR Code */}
            {invoice.zatcaQrCode && (
              <div className="border-2 border-zinc-200 p-2 rounded-lg bg-white">
                <QRCodeSVG value={invoice.zatcaQrCode} size={120} level="M" />
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-right mb-8">
          <thead>
            <tr className="bg-zinc-100 text-zinc-800 border-y-2 border-zinc-200">
              <th className="py-3 px-4 font-bold w-1/2">الوصف / Description</th>
              <th className="py-3 px-4 font-bold text-center">الكمية / Qty</th>
              <th className="py-3 px-4 font-bold text-center">سعر الوحدة / Unit Price</th>
              <th className="py-3 px-4 font-bold text-left">المجموع / Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((item: any, i: number) => (
              <tr key={i} className="text-zinc-800">
                <td className="py-4 px-4 font-medium">{item.name}</td>
                <td className="py-4 px-4 text-center font-sans">{item.quantity}</td>
                <td className="py-4 px-4 text-center font-sans">{Number(item.price).toFixed(2)}</td>
                <td className="py-4 px-4 text-left font-bold font-sans">{(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-1/2 max-w-sm bg-zinc-50 p-6 rounded-xl border border-zinc-200">
            <div className="flex justify-between items-center mb-3 text-zinc-600">
              <span className="font-bold">المجموع الفرعي / Subtotal:</span>
              <span className="font-sans font-bold" dir="ltr">{Number(invoice.subtotal).toFixed(2)} SAR</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-zinc-600">
              <span className="font-bold">الضريبة / VAT (15%):</span>
              <span className="font-sans font-bold" dir="ltr">{Number(invoice.vatAmount).toFixed(2)} SAR</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2 border-zinc-200 text-zinc-900">
              <span className="font-bold text-xl">الإجمالي / Total:</span>
              <span className="font-sans font-bold text-2xl" dir="ltr">{Number(invoice.totalAmount).toFixed(2)} SAR</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t-2 border-zinc-100 text-center text-zinc-500 text-sm">
          <p>شكراً لتعاملكم معنا. / Thank you for your business.</p>
          <p className="mt-1 font-sans" dir="ltr">This is a system generated electronic tax invoice. No signature is required.</p>
        </div>

      </div>
      
      {/* Script to handle print button */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('print-button').addEventListener('click', function() {
          window.print();
        });
      `}} />
    </div>
  );
}
