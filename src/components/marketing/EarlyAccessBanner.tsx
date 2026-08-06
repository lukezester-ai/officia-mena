import React from 'react';
import Link from 'next/link';

export function EarlyAccessBanner() {
  return (
    <section className="w-full py-6 relative z-10 bg-gradient-to-r from-[var(--color-gold-700)]/20 via-[var(--color-gold-500)]/10 to-[var(--color-gold-700)]/20 border-y border-[var(--color-gold-700)]/30">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="glass-panel inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[var(--color-gold-500)]/30">
          <div className="w-2 h-2 rounded-full bg-[var(--color-emerald-500)] animate-pulse"></div>
          <span className="text-sm md:text-base text-[var(--color-desert-200)]">
            <strong className="text-white">مرحلة الوصول المبكر (Early Access)</strong> — 
            المنصة قيد التطوير. سجّل الآن لتحصل على أولوية الوصول وتجربة مجانية ممتدة.
          </span>
          <Link href="/dashboard" className="px-4 py-1.5 rounded-lg gold-gradient text-[#1A120B] text-sm font-bold hover:opacity-90 transition-all shrink-0">
            سجّل الآن
          </Link>
        </div>
      </div>
    </section>
  );
}
