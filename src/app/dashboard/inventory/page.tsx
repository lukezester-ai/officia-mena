import React from 'react';
import { Package, Plus, Search, ScanBarcode, ArrowUpDown, AlertTriangle, FileScan, MessageCircle, Fuel, Sprout } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const mockProducts = [
    { id: 1, sku: 'ITM-001', name: 'لابتوب ديل XPS 15', barcode: '884116362489', qty: 15, minQty: 5, price: '7,500 SAR', status: 'متاح', isHalal: false },
    { id: 2, sku: 'FOD-023', name: 'قهوة عربية ممتازة', barcode: '887276538914', qty: 40, minQty: 10, price: '120 SAR', status: 'متاح', isHalal: true, hijriExpiry: '1446-09-01' },
    { id: 3, sku: 'PTR-900', name: 'ديزل ممتاز (لتر)', barcode: '097855146820', qty: 9850, minQty: 2000, price: '1.15 SAR', status: 'متاح', isPetroleum: true, apiGravity: 35.5 },
    { id: 4, sku: 'FRT-044', name: 'نترات الأمونيوم (سماد)', barcode: '097855152204', qty: 42, minQty: 15, price: '150 SAR', status: 'متاح', isFertilizer: true, securityExpiry: '2026-12-31' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-2 flex items-center gap-3">
            <Package className="text-[var(--color-gold-600)]" size={32} />
            المخزون (Inventory)
          </h1>
          <p className="text-[var(--color-desert-600)]">إدارة المنتجات، الكميات، والباركود.</p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/dashboard/inventory/receipt-scanner" className="bg-[var(--color-gold-50)] border border-[var(--color-gold-200)] text-[var(--color-gold-700)] px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--color-gold-100)] transition-colors shadow-sm">
            <FileScan size={18} />
            AI قراءة فاتورة
          </Link>
          <Link href="/dashboard/inventory/scanner" className="bg-white border border-[var(--color-desert-200)] text-[var(--color-desert-900)] px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--color-desert-50)] transition-colors shadow-sm">
            <ScanBarcode size={18} className="text-[var(--color-desert-500)]" />
            مسح باركود
          </Link>
          <button className="bg-[var(--color-desert-900)] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-sm">
            <Plus size={18} />
            إضافة منتج
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[var(--color-desert-200)] p-6 shadow-sm">
          <h3 className="text-[var(--color-desert-500)] text-sm font-medium mb-1">إجمالي قيمة المخزون</h3>
          <p className="text-2xl font-bold text-[var(--color-desert-900)]">SAR 123,550.00</p>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--color-desert-200)] p-6 shadow-sm">
          <h3 className="text-[var(--color-desert-500)] text-sm font-medium mb-1">إجمالي المنتجات</h3>
          <p className="text-2xl font-bold text-[var(--color-desert-900)]">248 نوع</p>
        </div>
        <div className="bg-rose-50 border-rose-200 rounded-2xl border p-6 shadow-sm">
          <h3 className="text-rose-600 text-sm font-medium mb-1 flex items-center gap-2">
            <AlertTriangle size={16} />
            منتجات بحاجة للطلب
          </h3>
          <p className="text-2xl font-bold text-rose-700">12 منتج</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--color-desert-200)] flex justify-between items-center bg-[var(--color-desert-50)]">
          <div className="relative max-w-sm w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-desert-400)]" size={18} />
            <input 
              type="text" 
              placeholder="البحث بالاسم، SKU، أو الباركود..." 
              className="w-full bg-white border border-[var(--color-desert-200)] rounded-lg py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--color-gold-500)]"
            />
          </div>
        </div>
        
        <table className="w-full text-right text-sm">
          <thead className="bg-[var(--color-desert-50)]/50 text-[var(--color-desert-600)] border-b border-[var(--color-desert-200)]">
            <tr>
              <th className="py-3 px-6 font-medium">المنتج (Product)</th>
              <th className="py-3 px-6 font-medium">SKU</th>
              <th className="py-3 px-6 font-medium">الباركود (Barcode)</th>
              <th className="py-3 px-6 font-medium text-center">التصنيف (Class)</th>
              <th className="py-3 px-6 font-medium">السعر (Price)</th>
              <th className="py-3 px-6 font-medium flex items-center gap-1 justify-end">الكمية (Qty) <ArrowUpDown size={14}/></th>
              <th className="py-3 px-6 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-desert-100)] text-[var(--color-desert-900)]">
            {mockProducts.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--color-desert-50)]/50 transition-colors">
                <td className="py-4 px-6 font-bold">{p.name}</td>
                <td className="py-4 px-6 font-mono text-[var(--color-desert-600)]">{p.sku}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <ScanBarcode size={14} className="text-[var(--color-desert-400)]" />
                    <span className="font-mono text-xs text-[var(--color-desert-600)] tracking-widest">{p.barcode}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  {p.isHalal && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">حلال</span>
                      {p.hijriExpiry && <span className="text-[10px] text-[var(--color-desert-500)]" dir="ltr">📅 {p.hijriExpiry}</span>}
                    </div>
                  )}
                  {p.isPetroleum && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="bg-zinc-800 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><Fuel size={12}/> بترول</span>
                      <span className="text-[10px] text-[var(--color-desert-500)]">API: {p.apiGravity}</span>
                    </div>
                  )}
                  {p.isFertilizer && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1"><Sprout size={12}/> سماد (مقيد)</span>
                      <span className="text-[10px] text-[var(--color-desert-500)]" dir="ltr">🛡️ {p.securityExpiry}</span>
                    </div>
                  )}
                  {!p.isHalal && !p.isPetroleum && !p.isFertilizer && <span className="text-[var(--color-desert-300)]">-</span>}
                </td>
                <td className="py-4 px-6">{p.price}</td>
                <td className="py-4 px-6 text-left" dir="ltr">
                  <span className={`font-bold ${p.qty <= p.minQty && p.qty > 0 ? 'text-amber-500' : p.qty === 0 ? 'text-rose-500' : 'text-[var(--color-desert-900)]'}`}>
                    {p.qty}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                    p.status === 'متاح' ? 'bg-emerald-100 text-emerald-800' :
                    p.status === 'نقص في المخزون' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {p.status}
                  </span>
                  {(p.qty <= p.minQty) && (
                    <button className="mr-2 p-1.5 bg-[#25D366]/10 text-[#25D366] rounded-md hover:bg-[#25D366]/20 transition-colors inline-flex items-center" title="اطلب عبر واتساب">
                      <MessageCircle size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
