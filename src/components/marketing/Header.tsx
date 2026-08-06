import React from 'react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="max-w-7xl mx-auto px-6 w-full py-8 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
        <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center font-bold text-white">
          O
        </div>
        <span className="text-2xl font-bold tracking-wider text-white">
          Officia <span className="gold-text">MENA</span>
        </span>
      </Link>
      
      <nav className="hidden md:flex gap-8 items-center">
        <Link href="/" className="text-gray-100 hover:text-[var(--color-gold-500)] transition-colors font-medium">الرئيسية</Link>
        <Link href="/about" className="text-gray-100 hover:text-[var(--color-gold-500)] transition-colors font-medium">عن المنصة</Link>
        <Link href="#pricing" className="text-gray-100 hover:text-[var(--color-gold-500)] transition-colors font-medium">الحلول</Link>
        <Link href="#pricing" className="text-gray-100 hover:text-[var(--color-gold-500)] transition-colors font-medium">الأسعار</Link>
        <Link href="/contact" className="text-gray-100 hover:text-[var(--color-gold-500)] transition-colors font-medium">تواصل معنا</Link>
      </nav>
      
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="px-6 py-2.5 rounded-full gold-gradient text-[#1A120B] font-bold hover:opacity-90 transition-all">
          تسجيل الدخول
        </Link>
      </div>
    </header>
  );
}
