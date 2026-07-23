'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  FileSignature,
  Calculator, 
  BarChart3, 
  UserCircle, 
  Building2,
  Search,
  Bell,
  User,
  ShoppingCart,
  ShieldCheck,
  BrainCircuit,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'لوحة القيادة', icon: LayoutDashboard },
  { path: '/dashboard/approvals', label: 'سير الموافقات', icon: ShieldCheck },
  { path: '/dashboard/inventory', label: 'المستودع', icon: Package },
  { path: '/dashboard/inventory/purchase-orders', label: 'أوامر الشراء (PO)', icon: ShoppingCart },
  { path: '/dashboard/inventory/warehouses', label: 'المستودعات المتعددة', icon: Building2 },
  { path: '/dashboard/inventory/anomalies', label: 'AI فحص المخزون', icon: ShieldCheck },
  { path: '/dashboard/pos', label: 'نقطة البيع (POS)', icon: ShoppingCart },
  { path: '/dashboard/invoices', label: 'الفواتير', icon: FileText },
  { path: '/dashboard/quotations', label: 'عروض الأسعار', icon: FileSignature },
  { path: '/dashboard/expenses', label: 'المصروفات', icon: Calculator },
  { path: '/dashboard/bank', label: 'البنوك', icon: Building2 },
  { path: '/dashboard/taxes', label: 'الزكاة والضرائب', icon: FileText },
  { path: '/dashboard/reports/forecast', label: 'AI توقعات النقد', icon: BarChart3 },
  { path: '/dashboard/hr', label: 'الموارد البشرية', icon: UserCircle },
  { path: '/dashboard/ai-maestro', label: 'الذكاء الاصطناعي', icon: BrainCircuit },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="executive-shell flex h-screen w-full overflow-hidden text-foreground dark" dir="rtl">
      {/* Sidebar (Fixed Right) */}
      <aside className="executive-sidebar w-[248px] h-full flex-shrink-0 border-l border-white/5 flex flex-col z-20">
        <div className="h-20 flex items-center px-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="brand-mark w-10 h-10 rounded-lg flex items-center justify-center font-black text-background text-xl">
              O
            </div>
            <div className="leading-none">
              <div className="font-black text-xl tracking-tight text-white">
                Officia <span className="text-primary">MENA</span>
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                Command ERP
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-5 px-3 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                data-active={isActive}
                className={cn(
                  "nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-semibold",
                  isActive 
                    ? "text-primary shadow-[inset_-3px_0_0_hsl(var(--primary))]" 
                    : "text-muted-foreground hover:text-white"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors", 
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                )} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3">
          <div className="ambient-border rounded-lg border bg-white/[0.035] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white">Maestro AI</div>
                <div className="mt-1 text-[10px] text-muted-foreground">RAG / Finance / ZATCA</div>
              </div>
              <div className="command-pulse h-2.5 w-2.5 rounded-full bg-[var(--color-oasis-500)] shadow-[0_0_14px_rgba(31,191,165,0.9)]" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header */}
        <header className="h-20 flex-shrink-0 border-b border-white/5 bg-background/70 backdrop-blur-xl flex items-center justify-between px-6 z-10 sticky top-0">
          
          {/* Mock Search Panel for now */}
          <div className="relative flex items-center w-full max-w-xl">
            <Search className="w-4 h-4 absolute right-3 text-muted-foreground pointer-events-none z-10" />
            <input
              type="text"
              placeholder="بحث ذكي… فواتير، عروض، أوامر شراء"
              className="top-command h-11 w-full rounded-lg pr-10 pl-8 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
              dir="rtl"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="top-command relative flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
            </button>
            <div className="h-5 w-px bg-white/10"></div>
            <button className="top-command flex items-center gap-3 rounded-lg p-1 pr-3 transition-colors hover:bg-white/10">
              <div className="flex flex-col items-end">
                <span className="text-xs font-medium leading-tight text-white">أحمد عبدالله</span>
                <span className="text-[10px] text-muted-foreground leading-tight">المدير المالي</span>
              </div>
              <div className="brand-mark w-9 h-9 rounded-lg text-background flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </button>
          </div>
        </header>

        {/* Page Scrollable Content */}
        <main className="dashboard-canvas flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
