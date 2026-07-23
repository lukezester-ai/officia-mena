'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getInvoiceById } from '../../invoice-actions';
import { Printer, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientTrn: string | null;
  subtotal: string;
  vatRate: string | null;
  vatAmount: string;
  totalAmount: string;
  issueDate: string | Date;
  zatcaQrCode: string | null;
  notes: string | null;
}

interface ParsedItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function PrintInvoicePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const res = await getInvoiceById(id);
      if (res.success && res.data) {
        setInvoice(res.data);
        
        // Parse items from notes
        if (res.data.notes && res.data.notes.includes('المنتجات:\n')) {
          const lines = res.data.notes.split('\n').filter(l => l.startsWith('- '));
          const parsedItems = lines.map(line => {
            // Format: - Description (الكمية: 5, السعر: 100)
            const match = line.match(/- (.+) \(الكمية: ([\d.]+), السعر: ([\d.]+)\)/);
            if (match) {
              const qty = parseFloat(match[2]);
              const price = parseFloat(match[3]);
              return {
                description: match[1].trim(),
                quantity: qty,
                unitPrice: price,
                total: qty * price
              };
            }
            return null;
          }).filter(Boolean) as ParsedItem[];
          setItems(parsedItems);
        }
      }
      setLoading(false);
    }
    fetch();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const formatMoney = (val: string | number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(typeof val === 'string' ? parseFloat(val) : val);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-black"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!invoice) {
    return <div className="flex h-screen items-center justify-center bg-black text-white">الفاتورة غير موجودة</div>;
  }

  return (
    <div className="bg-white min-h-screen text-black font-sans" dir="ltr">
      
      {/* Non-printable controls */}
      <div className="print:hidden bg-zinc-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <Link href="/dashboard/invoices" className="flex items-center gap-2 hover:text-primary transition-colors">
          <ArrowRight size={20} /> <span className="font-bold">عودة للقائمة</span>
        </Link>
        <button 
          onClick={handlePrint}
          className="bg-primary text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Printer size={20} /> Print Invoice / طباعة
        </button>
      </div>

      {/* A4 Print Container */}
      <div className="max-w-[21cm] mx-auto bg-white p-8 sm:p-12 min-h-[29.7cm] shadow-2xl print:shadow-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-black tracking-tighter mb-2">INVOICE</h1>
            <h2 className="text-2xl font-bold text-gray-700 font-arabic" dir="rtl">فاتورة ضريبية</h2>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black mb-1">Officia <span className="text-amber-500">MENA</span></div>
            <div className="text-sm text-gray-600">Al Olaya District, Riyadh, KSA</div>
            <div className="text-sm text-gray-600 font-bold mt-2">VAT No / الرقم الضريبي</div>
            <div className="text-sm font-mono">310123456700003</div>
          </div>
        </div>

        {/* Info Blocks */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To / فاتورة إلى</h3>
            <div className="font-bold text-lg mb-1">{invoice.clientName}</div>
            {invoice.clientTrn && (
              <>
                <div className="text-sm text-gray-500 font-bold mt-2">VAT No / الرقم الضريبي للعميل</div>
                <div className="text-sm font-mono">{invoice.clientTrn}</div>
              </>
            )}
          </div>
          <div className="text-right">
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Invoice No / رقم الفاتورة</h3>
              <div className="font-mono font-bold text-lg">{invoice.invoiceNumber}</div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Issue Date / تاريخ الإصدار</h3>
              <div className="font-bold">{new Date(invoice.issueDate).toLocaleDateString('en-US')}</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y-2 border-black">
                <th className="py-3 px-2 font-bold text-sm w-1/2">
                  <div>Description</div>
                  <div className="font-arabic text-xs text-gray-500" dir="rtl">الوصف</div>
                </th>
                <th className="py-3 px-2 font-bold text-sm text-center">
                  <div>Qty</div>
                  <div className="font-arabic text-xs text-gray-500" dir="rtl">الكمية</div>
                </th>
                <th className="py-3 px-2 font-bold text-sm text-right">
                  <div>Unit Price</div>
                  <div className="font-arabic text-xs text-gray-500" dir="rtl">سعر الوحدة</div>
                </th>
                <th className="py-3 px-2 font-bold text-sm text-right">
                  <div>Total</div>
                  <div className="font-arabic text-xs text-gray-500" dir="rtl">المجموع</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? items.map((item, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-4 px-2 font-arabic" dir="rtl">{item.description}</td>
                  <td className="py-4 px-2 text-center font-mono">{item.quantity}</td>
                  <td className="py-4 px-2 text-right font-mono">{formatMoney(item.unitPrice)}</td>
                  <td className="py-4 px-2 text-right font-mono font-bold">{formatMoney(item.total)}</td>
                </tr>
              )) : (
                <tr className="border-b border-gray-200">
                  <td colSpan={4} className="py-4 px-2 text-center text-gray-500 italic">No items detailed / لا توجد تفاصيل للمنتجات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Totals */}
        <div className="flex justify-between items-end">
          
          {/* ZATCA QR Code */}
          <div className="w-40 h-40 bg-gray-50 border-2 border-gray-200 rounded-xl p-2 flex items-center justify-center">
            {invoice.zatcaQrCode ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={invoice.zatcaQrCode} alt="ZATCA QR Code" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center text-xs text-gray-400">No QR Code<br/>(Draft)</div>
            )}
          </div>
          
          {/* Totals */}
          <div className="w-72">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <div className="text-sm font-bold text-gray-600">
                <div>Subtotal</div>
                <div className="font-arabic text-xs" dir="rtl">المبلغ الأساسي</div>
              </div>
              <div className="font-mono">{formatMoney(invoice.subtotal)}</div>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <div className="text-sm font-bold text-gray-600">
                <div>VAT ({(parseFloat(invoice.vatRate ?? '0')).toString()}%)</div>
                <div className="font-arabic text-xs" dir="rtl">ضريبة القيمة المضافة</div>
              </div>
              <div className="font-mono">{formatMoney(invoice.vatAmount)}</div>
            </div>
            <div className="flex justify-between py-4 border-b-4 border-black mt-2">
              <div className="text-lg font-black">
                <div>Total</div>
                <div className="font-arabic text-sm text-gray-600" dir="rtl">الإجمالي</div>
              </div>
              <div className="font-mono text-xl font-black">{formatMoney(invoice.totalAmount)}</div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
          This is a computer generated invoice and does not require a physical signature.<br/>
          <span className="font-arabic" dir="rtl">هذه فاتورة إلكترونية ولا تتطلب توقيعاً فعلياً.</span>
        </div>
      </div>
    </div>
  );
}
