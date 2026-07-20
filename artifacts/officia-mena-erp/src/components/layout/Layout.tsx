import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Calculator, 
  Users, 
  BarChart3, 
  UserCircle, 
  Building2,
  Search,
  Bell,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const NAV_ITEMS = [
  { path: '/', label: 'لوحة القيادة', icon: LayoutDashboard },
  { path: '/warehouse', label: 'المستودع', icon: Package },
  { path: '/invoices', label: 'الفواتير', icon: FileText },
  { path: '/accounting', label: 'المحاسبة', icon: Calculator },
  { path: '/contacts', label: 'العملاء والموردون', icon: Users },
  { path: '/reports', label: 'التقارير', icon: BarChart3 },
  { path: '/hr', label: 'الرواتب والموارد البشرية', icon: UserCircle },
  { path: '/vat', label: 'الزكاة والضرائب', icon: Building2 },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden text-foreground">
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
            const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
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
          <div className="flex items-center w-full max-w-md relative">
            <Search className="w-4 h-4 absolute right-3 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="البحث..." 
              className="pl-4 pr-10 bg-white/5 border-white/10 rounded-full h-9 focus-visible:ring-1 focus-visible:ring-primary/50 text-sm"
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
                <span className="text-xs font-medium leading-tight">أحمد عبدالله</span>
                <span className="text-[10px] text-muted-foreground leading-tight">المدير المالي</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </button>
          </div>
        </header>

        {/* Page Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
