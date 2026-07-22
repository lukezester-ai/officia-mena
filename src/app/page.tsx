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

      <div className="relative z-10 w-full flex flex-col">
        {/* Navbar */}
        <header className="max-w-7xl mx-auto px-6 w-full py-8 flex justify-between items-center">
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
            <Link href="#pricing" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">الأسعار</Link>
            <Link href="#" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">تواصل معنا</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => alert("English translation is coming soon!")}
              className="text-sm font-bold text-gray-300 hover:text-white transition-colors uppercase tracking-widest"
            >
              EN
            </button>
            <Link href="/login" className="px-6 py-2.5 rounded-full gold-gradient text-[#1A120B] font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] transition-all">
              تسجيل الدخول
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 w-full min-h-[90vh] flex items-center justify-center lg:justify-start pb-20">
          <div className="max-w-3xl glass-panel p-10 md:p-14 rounded-3xl relative">
            <div className="absolute top-0 right-10 w-20 h-1 gold-gradient rounded-b-lg"></div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              مستقبل <span className="gold-text">المحاسبة</span><br/> في الشرق الأوسط
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--color-desert-200)] mb-10 leading-relaxed font-light">
              منصة Officia MENA تقدم الحل الأمثل لإدارة الشؤون المالية، مدعومة بالذكاء الاصطناعي، ومصممة خصيصاً لتتوافق مع أنظمة الضرائب والزكاة في العالم العربي.
            </p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/login" className="px-8 py-4 rounded-xl gold-gradient text-[#1A120B] text-lg font-bold hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2">
                ابدأ الآن مجاناً
              </Link>
              <Link href="#pricing" className="px-8 py-4 rounded-xl border border-[var(--color-gold-700)] text-[var(--color-gold-500)] text-lg font-bold hover:bg-[rgba(212,175,55,0.1)] transition-all">
                اختر خطتك
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

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-24 relative">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">خطط وأسعار <span className="gold-text">مرنة</span></h2>
              <p className="text-xl text-[var(--color-desert-200)] max-w-2xl mx-auto font-light">
                اختر الباقة التي تناسب حجم أعمالك. قم بالترقية أو الإلغاء في أي وقت.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <div className="glass-panel p-8 rounded-3xl border border-gray-800 hover:border-[var(--color-gold-700)] transition-all">
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <p className="text-[var(--color-desert-300)] mb-6 h-12">للشركات الناشئة والمؤسسات الصغيرة.</p>
                <div className="mb-8">
                  <span className="text-4xl font-black text-white">$29</span>
                  <span className="text-[var(--color-desert-400)]">/ شهرياً</span>
                </div>
                <ul className="space-y-4 mb-8 text-gray-300">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-500)]"></div>
                    حتى 5 مستخدمين
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-500)]"></div>
                    فواتير إلكترونية محدودة
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-500)]"></div>
                    إدارة المخزون الأساسية
                  </li>
                </ul>
                <Link href="/login" className="block w-full py-3 rounded-xl border border-[var(--color-gold-700)] text-center text-[var(--color-gold-500)] font-bold hover:bg-[rgba(212,175,55,0.1)] transition-all">
                  ابدأ مجاناً (14 يوم)
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="glass-panel p-8 rounded-3xl border-2 border-[var(--color-gold-500)] relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 gold-gradient text-[#1A120B] px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  الأكثر مبيعاً
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <p className="text-[var(--color-desert-300)] mb-6 h-12">للاحتياجات المتكاملة وإدارة الموارد الذكية.</p>
                <div className="mb-8">
                  <span className="text-4xl font-black text-white">$99</span>
                  <span className="text-[var(--color-desert-400)]">/ شهرياً</span>
                </div>
                <ul className="space-y-4 mb-8 text-gray-300">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-500)]"></div>
                    مستخدمين غير محدودين
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-500)]"></div>
                    مساعد AI الذكي (Maestro)
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-500)]"></div>
                    قراءة الفواتير بالذكاء الاصطناعي
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-500)]"></div>
                    نظام نقاط البيع (POS)
                  </li>
                </ul>
                <Link href="/login" className="block w-full py-3 rounded-xl gold-gradient text-[#1A120B] text-center font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
                  اشترك الآن
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="glass-panel p-8 rounded-3xl border border-gray-800 hover:border-[var(--color-gold-700)] transition-all">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-[var(--color-desert-300)] mb-6 h-12">للشركات الكبرى والمؤسسات ذات الفروع المتعددة.</p>
                <div className="mb-8 flex items-center h-10">
                  <span className="text-3xl font-black text-white">تواصل معنا</span>
                </div>
                <ul className="space-y-4 mb-8 text-gray-300">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-500)]"></div>
                    كل ميزات خطة Pro
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-500)]"></div>
                    مدير حساب مخصص
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-500)]"></div>
                    ربط API مخصص (Custom Integrations)
                  </li>
                </ul>
                <Link href="#" className="block w-full py-3 rounded-xl border border-[var(--color-gold-700)] text-center text-[var(--color-gold-500)] font-bold hover:bg-[rgba(212,175,55,0.1)] transition-all">
                  اتصل بالمبيعات
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
