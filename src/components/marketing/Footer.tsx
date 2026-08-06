import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full py-12 bg-black border-t border-gray-900 z-10 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="text-center md:text-right">
            <Link href="/" className="text-xl font-bold tracking-wider text-white mb-3 block">
              Officia <span className="gold-text">MENA</span>
            </Link>
            <p className="text-sm text-[var(--color-desert-300)] mb-4 leading-relaxed">
              منصة محاسبية ذكية للشركات في منطقة الشرق الأوسط وشمال أفريقيا.
            </p>
            <div className="flex justify-center md:justify-start gap-3">
              <a href="mailto:info@agrinexus.eu" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[var(--color-gold-500)]/20 border border-gray-700 flex items-center justify-center transition-all" title="البريد الإلكتروني">
                <svg className="w-4 h-4 text-[var(--color-gold-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </a>
            </div>
          </div>

          <div className="text-center md:text-right">
            <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-[var(--color-desert-300)] hover:text-[var(--color-gold-500)] transition-colors">الرئيسية</Link></li>
              <li><Link href="/about" className="text-sm text-[var(--color-desert-300)] hover:text-[var(--color-gold-500)] transition-colors">عن المنصة</Link></li>
              <li><Link href="/contact" className="text-sm text-[var(--color-desert-300)] hover:text-[var(--color-gold-500)] transition-colors">تواصل معنا</Link></li>
              <li><Link href="/dashboard" className="text-sm text-[var(--color-desert-300)] hover:text-[var(--color-gold-500)] transition-colors">تسجيل الدخول</Link></li>
            </ul>
          </div>

          <div className="text-center md:text-right">
            <h4 className="text-white font-bold mb-4">قانوني</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-[var(--color-desert-300)] hover:text-[var(--color-gold-500)] transition-colors">سياسة الخصوصية</Link></li>
              <li><Link href="/terms" className="text-sm text-[var(--color-desert-300)] hover:text-[var(--color-gold-500)] transition-colors">الشروط والأحكام</Link></li>
            </ul>
          </div>

          <div className="text-center md:text-right">
            <h4 className="text-white font-bold mb-4">الشركة</h4>
            <ul className="space-y-2 text-sm text-[var(--color-desert-300)]">
              <li>Agri Nexus Ltd</li>
              <li>صوفيا، بلغاريا</li>
              <li><a href="mailto:info@agrinexus.eu" className="hover:text-[var(--color-gold-500)] transition-colors">info@agrinexus.eu</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--color-desert-400)]">© 2026 Officia MENA. جميع الحقوق محفوظة.</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="https://zatca.gov.sa" target="_blank" rel="noopener noreferrer" className="text-[var(--color-desert-300)] hover:text-[var(--color-emerald-500)] transition-colors flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-emerald-500)]"></div>
              متوافق مع ZATCA
            </a>
            <span className="text-[var(--color-desert-600)]">|</span>
            <span className="text-[var(--color-desert-400)]">السجل التجاري: 208692862</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
