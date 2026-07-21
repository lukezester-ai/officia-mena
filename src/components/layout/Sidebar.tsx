'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Landmark, 
  BrainCircuit, 
  Settings,
  Scale,
  Package,
  Users
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'لوحة القيادة', href: '/dashboard' }, // Dashboard
    { icon: BrainCircuit, label: 'المايسترو (AI)', href: '/dashboard/ai-maestro' }, // AI Maestro
    { icon: Users, label: 'الموارد البشرية', href: '/dashboard/hr' }, // HR
    { icon: Package, label: 'المخزون', href: '/dashboard/inventory' }, // Inventory
    { icon: FileText, label: 'الفواتير', href: '/dashboard/invoices' }, // Invoices
    { icon: CreditCard, label: 'النفقات', href: '/dashboard/expenses' }, // Expenses
    { icon: Landmark, label: 'البنك', href: '/dashboard/bank' }, // Bank
    { icon: Scale, label: 'الزكاة والضرائب', href: '/dashboard/taxes' }, // Zakat & Taxes
  ];

  return (
    <aside className="w-64 bg-white border-l border-[var(--color-desert-200)] flex flex-col h-full shadow-sm z-20 relative">
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-desert-200)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center font-bold text-white">
            O
          </div>
          <span className="text-xl font-bold text-[var(--color-desert-900)]">
            Officia <span className="text-[var(--color-gold-600)]">MENA</span>
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={index} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-[var(--color-desert-100)] text-[var(--color-gold-700)] font-bold border border-[var(--color-gold-500)]/20 shadow-sm' 
                  : 'text-[var(--color-desert-700)] hover:bg-[var(--color-desert-50)] hover:text-[var(--color-desert-900)]'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-[var(--color-gold-600)]' : 'text-[var(--color-desert-500)]'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-[var(--color-desert-200)]">
        <Link 
          href="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-desert-700)] hover:bg-[var(--color-desert-50)] hover:text-[var(--color-desert-900)] transition-colors"
        >
          <Settings size={20} className="text-[var(--color-desert-500)]" />
          <span>الإعدادات</span> {/* Settings */}
        </Link>
      </div>
    </aside>
  );
}
