import { db } from '@/lib/db/db';
import { invoices } from '@/lib/db/schema/invoices';
import { clients } from '@/lib/db/schema/clients';
import { products } from '@/lib/db/schema/inventory';
import { requireTenant } from '@/lib/auth/get-tenant';
import { eq, sql } from 'drizzle-orm';
import { FileText, Users, Package, Wallet, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const tenant = await requireTenant();

  // 1. Fetch metrics
  const invoicesResult = await db.select({ count: sql<number>\`count(*)\`, total: sql<number>\`sum(total_amount)\` })
    .from(invoices)
    .where(eq(invoices.tenantId, tenant.id));
  
  const clientsResult = await db.select({ count: sql<number>\`count(*)\` })
    .from(clients)
    .where(eq(clients.tenantId, tenant.id));
    
  const productsResult = await db.select({ count: sql<number>\`count(*)\` })
    .from(products)
    .where(eq(products.tenantId, tenant.id));

  const totalInvoices = Number(invoicesResult[0]?.count || 0);
  const totalRevenue = Number(invoicesResult[0]?.total || 0);
  const totalClients = Number(clientsResult[0]?.count || 0);
  const totalProducts = Number(productsResult[0]?.count || 0);

  // Mock data for the chart to make it look beautiful
  const chartPoints = [20, 35, 25, 45, 40, 60, 55, 75, 70, 85, 80, 100];
  const maxPoint = Math.max(...chartPoints);
  
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            مرحباً بك في <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Officia MENA</span>
          </h1>
          <p className="text-zinc-400 mt-1">
            نظرة عامة على أداء أعمالك ({tenant.name}).
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-24 h-24 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-zinc-400 mb-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-medium">إجمالي الإيرادات</span>
            </div>
            <div className="text-3xl font-bold text-white flex items-end gap-2">
              <span className="font-sans" dir="ltr">{totalRevenue.toFixed(2)}</span>
              <span className="text-lg text-emerald-500 mb-1">SAR</span>
            </div>
          </div>
        </div>

        {/* Invoices Card */}
        <Link href="/dashboard/invoices" className="bg-zinc-900/60 border border-zinc-800 hover:border-blue-500/50 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="w-24 h-24 text-blue-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-zinc-400 mb-2">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-medium">الفواتير المصدرة</span>
            </div>
            <div className="text-3xl font-bold text-white font-sans" dir="ltr">{totalInvoices}</div>
          </div>
        </Link>

        {/* Clients Card */}
        <Link href="/dashboard/clients" className="bg-zinc-900/60 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24 text-indigo-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-zinc-400 mb-2">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-medium">العملاء والشركات</span>
            </div>
            <div className="text-3xl font-bold text-white font-sans" dir="ltr">{totalClients}</div>
          </div>
        </Link>

        {/* Products Card */}
        <Link href="/dashboard/products" className="bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/50 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package className="w-24 h-24 text-purple-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-zinc-400 mb-2">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-medium">المنتجات والخدمات</span>
            </div>
            <div className="text-3xl font-bold text-white font-sans" dir="ltr">{totalProducts}</div>
          </div>
        </Link>
      </div>

      {/* SVG Chart Section */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">الإيرادات (آخر 12 شهر)</h2>
            <p className="text-sm text-zinc-400">نظرة عامة على نمو المبيعات</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Custom SVG Area Chart */}
        <div className="h-72 w-full relative pt-4">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 200">
            
            <defs>
              <linearGradient id="area-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="0" x2="1000" y2="0" stroke="#27272a" strokeWidth="1" />
            <line x1="0" y1="50" x2="1000" y2="50" stroke="#27272a" strokeWidth="1" />
            <line x1="0" y1="100" x2="1000" y2="100" stroke="#27272a" strokeWidth="1" />
            <line x1="0" y1="150" x2="1000" y2="150" stroke="#27272a" strokeWidth="1" />
            <line x1="0" y1="200" x2="1000" y2="200" stroke="#27272a" strokeWidth="2" />

            {/* Area Path */}
            <path 
              d={\`M 0 200 \${chartPoints.map((p, i) => \`L \${(i / (chartPoints.length - 1)) * 1000} \${200 - (p / maxPoint) * 180}\`).join(' ')} L 1000 200 Z\`} 
              fill="url(#area-gradient)" 
            />

            {/* Line Path */}
            <path 
              d={\`M 0 \${200 - (chartPoints[0] / maxPoint) * 180} \${chartPoints.map((p, i) => \`L \${(i / (chartPoints.length - 1)) * 1000} \${200 - (p / maxPoint) * 180}\`).join(' ')}\`} 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="4" 
              strokeLinejoin="round" 
              strokeLinecap="round" 
            />
            
            {/* Dots */}
            {chartPoints.map((p, i) => (
              <circle 
                key={i} 
                cx={(i / (chartPoints.length - 1)) * 1000} 
                cy={200 - (p / maxPoint) * 180} 
                r="6" 
                fill="#18181b" 
                stroke="#3b82f6" 
                strokeWidth="3" 
                className="hover:r-8 transition-all cursor-pointer"
              />
            ))}
          </svg>
          
          {/* X Axis Labels */}
          <div className="flex justify-between mt-4 text-xs font-medium text-zinc-500 font-sans" dir="ltr">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
