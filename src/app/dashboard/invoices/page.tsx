import { db } from '@/lib/db/db';
import { invoices } from '@/lib/db/schema/invoices';
import { requireTenant } from '@/lib/auth/get-tenant';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { FileText, Plus, Search, MoreHorizontal } from 'lucide-react';

export default async function InvoicesPage() {
  const tenant = await requireTenant();
  
  const allInvoices = await db.select()
    .from(invoices)
    .where(eq(invoices.tenantId, tenant.id))
    .orderBy(desc(invoices.issueDate));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" />
            الفواتير الإلكترونية (ZATCA)
          </h1>
          <p className="text-zinc-400 mt-1">
            إدارة وإنشاء فواتير إلكترونية متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك.
          </p>
        </div>
        
        <Link 
          href="/dashboard/invoices/new" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          إنشاء فاتورة جديدة
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-2 rounded-2xl backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="البحث برقم الفاتورة أو اسم العميل..." 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pr-12 pl-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="hidden sm:flex gap-2 pr-4 border-r border-zinc-800">
          <button className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">الكل</button>
          <button className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">المسودات</button>
          <button className="px-4 py-2 text-sm bg-zinc-800 text-white rounded-lg transition-colors">المُصدرة</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">رقم الفاتورة</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">العميل</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">التاريخ</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">الإجمالي (شامل الضريبة)</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">الحالة</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">ZATCA</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {allInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    لا توجد فواتير حتى الآن. ابدأ بإنشاء فاتورتك الأولى!
                  </td>
                </tr>
              ) : (
                allInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="py-4 px-6 font-medium text-white">{inv.invoiceNumber}</td>
                    <td className="py-4 px-6 text-zinc-300">{inv.clientName}</td>
                    <td className="py-4 px-6 text-zinc-400">{inv.issueDate.toLocaleDateString('ar-SA')}</td>
                    <td className="py-4 px-6 text-white font-medium">{Number(inv.totalAmount).toFixed(2)} {inv.currency}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        مُصدرة
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {inv.zatcaQrCode ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          QR متاح
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 flex items-center gap-3">
                      <Link href={`/dashboard/invoices/${inv.id}/print`} className="text-blue-400 hover:text-blue-300 text-sm transition-colors opacity-0 group-hover:opacity-100">
                        طباعة PDF
                      </Link>
                      <button className="text-zinc-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-800 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
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
