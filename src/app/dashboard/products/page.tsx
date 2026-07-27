import { db } from '@/lib/db/db';
import { products } from '@/lib/db/schema/inventory';
import { requireTenant } from '@/lib/auth/get-tenant';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { Package, Plus, Search, MoreHorizontal, ShieldCheck } from 'lucide-react';

export default async function ProductsPage() {
  const tenant = await requireTenant();
  
  const allProducts = await db.select()
    .from(products)
    .where(eq(products.tenantId, tenant.id))
    .orderBy(desc(products.createdAt));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-500" />
            المنتجات والخدمات
          </h1>
          <p className="text-zinc-400 mt-1">
            إدارة المخزون، الخدمات، والمنتجات المتوافقة مع معايير (Halal).
          </p>
        </div>
        
        <Link 
          href="/dashboard/products/new" 
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          إضافة صنف جديد
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-2 rounded-2xl backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="البحث بالاسم أو رمز SKU..." 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pr-12 pl-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div className="hidden sm:flex gap-2 pr-4 border-r border-zinc-800">
          <button className="px-4 py-2 text-sm bg-zinc-800 text-white rounded-lg transition-colors">الكل</button>
          <button className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">منتجات</button>
          <button className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">خدمات</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">النوع</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">الرمز (SKU)</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">اسم الصنف</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">الفئة</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">السعر</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">اعتمادات (Halal)</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {allProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    لا توجد منتجات حتى الآن. ابدأ بإضافة منتجك الأول!
                  </td>
                </tr>
              ) : (
                allProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="py-4 px-6">
                      {product.type === 'service' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          خدمة
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          منتج ملموس
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-medium text-white font-sans" dir="ltr">{product.sku}</td>
                    <td className="py-4 px-6 text-zinc-300 font-medium">{product.name}</td>
                    <td className="py-4 px-6 text-zinc-400">{product.category || '-'}</td>
                    <td className="py-4 px-6 text-white font-medium font-sans">{Number(product.unitPrice).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      {product.isHalalCertified ? (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="text-xs">معتمد</span>
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
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
