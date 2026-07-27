import { db } from '@/lib/db/db';
import { clients } from '@/lib/db/schema/clients';
import { requireTenant } from '@/lib/auth/get-tenant';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { Users, Plus, Search, MoreHorizontal, Phone, Mail, Building2 } from 'lucide-react';

export default async function ClientsPage() {
  const tenant = await requireTenant();
  
  const allClients = await db.select()
    .from(clients)
    .where(eq(clients.tenantId, tenant.id))
    .orderBy(desc(clients.createdAt));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-500" />
            العملاء والشركات
          </h1>
          <p className="text-zinc-400 mt-1">
            إدارة قاعدة بيانات العملاء للوصول السريع عند إصدار الفواتير.
          </p>
        </div>
        
        <Link 
          href="/dashboard/clients/new" 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          إضافة عميل جديد
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-2 rounded-2xl backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="البحث باسم الشركة أو الرقم الضريبي..." 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pr-12 pl-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="hidden sm:flex gap-2 pr-4 border-r border-zinc-800">
          <button className="px-4 py-2 text-sm bg-zinc-800 text-white rounded-lg transition-colors">الكل</button>
          <button className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">شركات (B2B)</button>
          <button className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">أفراد</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">اسم العميل / الشركة</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">الرقم الضريبي (TRN)</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">الشخص المسؤول</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">التواصل</th>
                <th className="py-4 px-6 text-sm font-medium text-zinc-400">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {allClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    لا يوجد عملاء حتى الآن. أضف أول عميل لك للبدء!
                  </td>
                </tr>
              ) : (
                allClients.map((client) => (
                  <tr key={client.id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="font-medium text-white">{client.companyName}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-300 font-sans" dir="ltr">{client.trn || '-'}</td>
                    <td className="py-4 px-6 text-zinc-300">{client.contactPerson || '-'}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            <span dir="ltr">{client.phone}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Mail className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {!client.phone && !client.email && <span className="text-zinc-600">-</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 flex items-center gap-3">
                      <Link href={`/dashboard/clients/${client.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors opacity-0 group-hover:opacity-100">
                        عرض التفاصيل
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
