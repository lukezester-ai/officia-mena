import { Bell, Search, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-[var(--color-desert-200)] flex items-center justify-between px-8 z-10 relative">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-desert-400)]" size={18} />
          <input 
            type="text" 
            placeholder="البحث في الفواتير، النفقات، أو العملاء..." 
            className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-full py-2 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold-500)]/50 focus:border-[var(--color-gold-500)] text-[var(--color-desert-900)] placeholder:text-[var(--color-desert-400)]"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 pl-4 border-l border-[var(--color-desert-200)]">
        <button className="relative p-2 text-[var(--color-desert-600)] hover:text-[var(--color-gold-600)] hover:bg-[var(--color-desert-50)] rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-emerald-500)] rounded-full border border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pr-2 border-r border-[var(--color-desert-200)] mr-2">
          <div className="text-left flex flex-col items-end">
            <span className="text-sm font-bold text-[var(--color-desert-900)]">أحمد محمد</span>
            <span className="text-xs text-[var(--color-desert-500)]">المدير المالي</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--color-desert-200)] flex items-center justify-center text-[var(--color-desert-700)]">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
