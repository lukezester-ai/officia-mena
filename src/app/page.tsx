'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#1A120B]">
      {/* Abstract Desert/Gold Background Elements */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[var(--color-gold-700)] opacity-20 blur-[120px]"></div>
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[var(--color-desert-600)] opacity-10 blur-[100px]"></div>
        <div className="absolute -bottom-[20%] right-[20%] w-[60%] h-[60%] rounded-full bg-[var(--color-emerald-900)] opacity-20 blur-[150px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 h-screen flex flex-col">
        {/* Navbar */}
        <header className="py-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              O
            </div>
            <span className="text-2xl font-bold tracking-wider text-white">
              Officia <span className="gold-text">MENA</span>
            </span>
          </div>
          
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="#" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">الرئيسية</Link>
            <Link href="#" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">الحلول</Link>
            <Link href="#" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">الأسعار</Link>
            <Link href="#" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">تواصل معنا</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => alert("English translation is coming soon!")}
              className="text-sm font-bold text-gray-300 hover:text-white transition-colors uppercase tracking-widest"
            >
              EN
            </button>
            <Link href="/dashboard" className="px-6 py-2.5 rounded-full gold-gradient text-[#1A120B] font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] transition-all">
              تسجيل الدخول
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center lg:justify-start pt-10 pb-20">
          <div className="max-w-3xl glass-panel p-10 md:p-14 rounded-3xl relative">
            <div className="absolute top-0 right-10 w-20 h-1 gold-gradient rounded-b-lg"></div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              مستقبل <span className="gold-text">المحاسبة</span><br/> في الشرق الأوسط
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--color-desert-200)] mb-10 leading-relaxed font-light">
              منصة Officia MENA تقدم الحل الأمثل لإدارة الشؤون المالية، مدعومة بالذكاء الاصطناعي، ومصممة خصيصاً لتتوافق مع أنظمة الضرائب والزكاة في العالم العربي.
            </p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/dashboard" className="px-8 py-4 rounded-xl gold-gradient text-[#1A120B] text-lg font-bold hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2">
                ابدأ الآن مجاناً
              </Link>
              <Link href="/dashboard" className="px-8 py-4 rounded-xl border border-[var(--color-gold-700)] text-[var(--color-gold-500)] text-lg font-bold hover:bg-[rgba(212,175,55,0.1)] transition-all">
                احجز عرضاً تجريبياً
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6 text-sm text-[var(--color-desert-400)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-emerald-500)] shadow-[0_0_8px_var(--color-emerald-500)]"></div>
                متوافق مع هيئة الزكاة (ZATCA)
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-gold-500)] shadow-[0_0_8px_var(--color-gold-500)]"></div>
                دعم كامل للغة العربية
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
