'use client';

import { Bell, Search, User, Loader2, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type SearchResult = {
  clientName: string;
  invoiceNumber: string;
  totalAmount: string;
  currency: string;
  status: string;
  similarity: number;
};

export default function Header() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);
  return (
    <header className="h-16 bg-white border-b border-[var(--color-desert-200)] flex items-center justify-between px-8 z-10 relative">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-desert-400)]" size={18} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="البحث الذكي (AI) في الفواتير..." 
            className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-full py-2 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold-500)]/50 focus:border-[var(--color-gold-500)] text-[var(--color-desert-900)] placeholder:text-[var(--color-desert-400)]"
          />
          {isSearching && (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gold-500)] animate-spin" size={16} />
          )}

          {/* Semantic Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-full md:w-[400px] bg-white border border-[var(--color-desert-200)] rounded-xl shadow-xl overflow-hidden z-50 flex flex-col" dir="rtl">
              <div className="bg-[var(--color-desert-50)] px-4 py-2 border-b border-[var(--color-desert-200)] text-xs font-bold text-[var(--color-desert-500)] flex justify-between">
                <span>نتائج البحث الذكي (AI Semantic Search)</span>
                {isSearching ? <span>جاري البحث...</span> : <span>{results.length} نتائج</span>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {results.length > 0 ? (
                  results.map((inv, idx) => (
                    <Link key={idx} href="/dashboard/invoices" className="flex flex-col p-4 border-b border-[var(--color-desert-100)] hover:bg-[var(--color-desert-50)] transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-[var(--color-desert-900)] flex items-center gap-2">
                          <FileText size={14} className="text-[var(--color-gold-600)]" />
                          {inv.clientName}
                        </span>
                        <span className="text-xs text-[var(--color-desert-400)] font-mono">#{inv.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[var(--color-desert-600)]">{inv.totalAmount} {inv.currency}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {inv.status === 'paid' ? 'مدفوعة' : 'مسودة/معلقة'}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-[var(--color-gold-600)]">
                        صلة الذكاء الاصطناعي: {Math.round(inv.similarity * 100)}%
                      </div>
                    </Link>
                  ))
                ) : !isSearching ? (
                  <div className="p-6 text-center text-[var(--color-desert-500)] text-sm">
                    لم يتم العثور على نتائج تناسب بحثك.
                  </div>
                ) : null}
              </div>
            </div>
          )}
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
