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
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground dark" dir="rtl">
      {/* Sidebar (Fixed Right) */}
      <aside className="w-[220px] h-full flex-shrink-0 bg-sidebar border-l border-white/5 flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-amber-400 flex items-center justify-center font-bold text-background text-lg shadow-[0_0_15px_rgba(245,197,24,0.3)]">
              O
            </div>
            <div className="font-bold text-xl tracking-tight leading-none">
              Officia <span className="text-primary">MENA</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
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
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 border-b border-white/5 bg-background/50 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
          
          {/* Mock Search Panel for now */}
          <div className="relative flex items-center w-full max-w-md">
            <Search className="w-4 h-4 absolute right-3 text-muted-foreground pointer-events-none z-10" />
            <input
              type="text"
              placeholder="بحث ذكي… فواتير، عروض، أوامر شراء"
              className="pl-8 pr-10 bg-white/5 border border-white/10 rounded-full h-9 focus-visible:ring-1 focus-visible:ring-primary/50 text-sm w-full text-white"
              dir="rtl"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors relative text-muted-foreground hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
            </button>
            <div className="h-5 w-px bg-white/10"></div>
            <button className="flex items-center gap-2 hover:bg-white/5 p-1 pr-3 rounded-full transition-colors border border-white/5">
              <div className="flex flex-col items-end">
                <span className="text-xs font-medium leading-tight text-white">أحمد عبدالله</span>
                <span className="text-[10px] text-muted-foreground leading-tight">المدير المالي</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </button>
          </div>
        </header>

        {/* Page Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth bg-[#07070F]">
          <div className="max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
