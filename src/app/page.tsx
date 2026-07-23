'use client';

import React from 'react';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { Receipt, Users, BrainCircuit } from 'lucide-react';

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
          <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              O
            </div>
            <span className="text-2xl font-bold tracking-wider text-white">
              Officia <span className="gold-text">MENA</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">الرئيسية</Link>
            <Link href="#pricing" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">الحلول</Link>
            <Link href="#pricing" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">الأسعار</Link>
            <Link href="mailto:sales@officia-mena.com" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">تواصل معنا</Link>
          </nav>
          
          <div className="flex items-center gap-4">

            <Link href="/login" className="px-6 py-2.5 rounded-full gold-gradient text-[#1A120B] font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] transition-all">
              تسجيل الدخول
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 w-full min-h-[90vh] flex flex-col lg:flex-row items-center justify-between gap-12 pb-20 pt-10">
          
          {/* Left Side (Text) */}
          <div className="w-full lg:w-[55%] glass-panel p-10 md:p-14 rounded-3xl relative z-10">
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
                متوافق مع هيئة الزكاة (ZATCA) <span className="text-[10px] bg-[var(--color-emerald-500)]/20 text-[var(--color-emerald-400)] px-2 py-0.5 rounded border border-[var(--color-emerald-500)]/30 ml-2">Live (المرحلة 2)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-gold-500)] shadow-[0_0_8px_var(--color-gold-500)]"></div>
                دعم كامل للغة العربية
              </div>
            </div>
          </div>

          {/* Right Side (Animated Graphic) */}
          <div className="w-full lg:w-[45%] relative hidden lg:block z-10" dir="ltr">
            <motion.div 
              initial={{ x: 50 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full h-[500px]"
            >
              {/* Main glowing backplate */}
              <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_25%_20%,rgba(245,197,24,0.26),transparent_34%),radial-gradient(circle_at_80%_64%,rgba(16,185,129,0.22),transparent_32%)] blur-2xl"></div>
              <div className="absolute inset-8 rounded-[2rem] border border-[var(--color-gold-500)]/15 bg-[linear-gradient(135deg,rgba(245,197,24,0.06),transparent_38%,rgba(16,185,129,0.06))] rotate-3"></div>
              
              {/* Main Dashboard Panel */}
              <motion.div 
                animate={{ y: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute inset-0 overflow-hidden rounded-[2rem] border border-[var(--color-gold-500)]/35 bg-[#1b1108]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
              >
                {/* Header */}
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.08),transparent_35%),repeating-linear-gradient(90deg,rgba(255,255,255,0.025)_0_1px,transparent_1px_74px)] pointer-events-none"></div>
                <div className="relative flex items-center justify-between border-b border-[var(--color-gold-500)]/10 pb-4">
                  <div className="flex items-center gap-3 text-right" dir="rtl">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f5c518,#b45309)] text-lg font-black text-[#1A120B] shadow-[0_0_24px_rgba(245,197,24,0.34)]">
                      O
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">Officia MENA</div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-gold-500)]">Live finance cockpit</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"></span>
                    <span className="text-[11px] font-bold text-emerald-300">Synced</span>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="relative mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-[var(--color-gold-500)]/25 bg-white/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="mb-4 flex items-center justify-between">
                      <Receipt className="text-[var(--color-gold-500)]" size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Revenue</span>
                    </div>
                    <div className="text-2xl font-black text-white">1.24M</div>
                    <div className="mt-1 text-xs font-bold text-[var(--color-gold-500)]">SAR +18%</div>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="mb-4 flex items-center justify-between">
                      <Users className="text-[var(--color-emerald-500)]" size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Payroll</span>
                    </div>
                    <div className="text-2xl font-black text-white">485K</div>
                    <div className="mt-1 text-xs font-bold text-emerald-300">WPS ready</div>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">ZATCA</div>
                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[conic-gradient(from_180deg,#10b981_0_84%,rgba(255,255,255,0.08)_84%_100%)]">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#120d08] text-sm font-black text-white">98%</div>
                    </div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="relative mt-4 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black/25 p-4">
                   <div className="mb-5 flex items-center justify-between">
                     <div>
                       <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Cashflow forecast</div>
                       <div className="mt-1 text-base font-black text-white">Q3 liquidity path</div>
                     </div>
                     <div className="rounded-full border border-[var(--color-gold-500)]/25 bg-[var(--color-gold-500)]/10 px-3 py-1 text-xs font-bold text-[var(--color-gold-500)]">
                       AI verified
                     </div>
                   </div>
                   
                   {/* Scanning laser effect */}
                   <motion.div 
                     animate={{ x: ["-20%", "120%"], opacity: [0, 1, 0] }}
                     transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
                     className="absolute top-0 bottom-0 w-16 bg-[linear-gradient(90deg,transparent,rgba(16,185,129,0.18),transparent)] z-10"
                   />

                   <div className="absolute inset-x-5 bottom-5 top-24 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))]">
                     <svg viewBox="0 0 520 170" className="absolute inset-0 h-full w-full overflow-visible">
                       <defs>
                         <linearGradient id="cashGlow" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#f5c518" stopOpacity="0.42" />
                           <stop offset="100%" stopColor="#f5c518" stopOpacity="0" />
                         </linearGradient>
                       </defs>
                       <path d="M10 128 C70 100 102 112 150 82 C198 52 225 78 272 62 C330 42 355 74 410 45 C456 20 486 33 510 24 L510 170 L10 170 Z" fill="url(#cashGlow)" />
                       <path d="M10 128 C70 100 102 112 150 82 C198 52 225 78 272 62 C330 42 355 74 410 45 C456 20 486 33 510 24" fill="none" stroke="#f5c518" strokeWidth="5" strokeLinecap="round" />
                       <path d="M10 144 C82 138 125 150 176 128 C230 105 270 126 326 94 C372 68 428 88 510 58" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="8 10" strokeLinecap="round" opacity="0.9" />
                     </svg>
                   </div>

                   <div className="absolute bottom-4 left-7 right-7 flex items-end justify-between gap-3">
                     {[18, 28, 38, 34, 46, 42, 30].map((height, i) => (
                       <motion.div 
                         key={i}
                         animate={{ 
                           height: [`${height}px`, `${height * 1.08}px`, `${height}px`]
                         }}
                         transition={{ 
                           repeat: Infinity, 
                           duration: 4 + (i % 2), 
                           delay: i * 0.2,
                           ease: "easeInOut" 
                         }}
                         className="w-full rounded-t-xl border border-[var(--color-gold-500)]/20 bg-[linear-gradient(180deg,rgba(245,197,24,0.92),rgba(180,83,9,0.22))] shadow-[0_0_20px_rgba(245,158,11,0.16)]"
                       ></motion.div>
                     ))}
                   </div>
                </div>
              </motion.div>

              {/* Floating AI Notification */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, y: [-15, 15, -15] }}
                transition={{ 
                  opacity: { duration: 0.5 },
                  scale: { duration: 0.5, type: "spring" },
                  y: { repeat: Infinity, duration: 5, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.05, borderColor: "rgba(16,185,129,0.8)" }}
                className="absolute -right-8 top-[44%] z-20 flex cursor-pointer items-center gap-4 rounded-2xl border border-emerald-400/30 bg-[#0f1712]/90 p-4 shadow-[0_0_48px_rgba(16,185,129,0.34)] backdrop-blur-2xl"
              >
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-emerald-500)] to-emerald-800 shadow-inner">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.32),transparent)] opacity-70"
                  />
                  <BrainCircuit className="text-white relative z-10" size={24} />
                </div>
                <div>
                  <div className="text-sm font-black text-white mb-1 flex items-center gap-2">
                    Maestro AI <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-400)] shadow-[0_0_8px_var(--color-emerald-400)] animate-pulse"></span>
                  </div>
                  <motion.div 
                    key="typing"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5 }}
                    className="text-xs text-[var(--color-emerald-400)] font-medium overflow-hidden whitespace-nowrap"
                  >
                    مساعد ذكي للفواتير والمحاسبة
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
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
                  <span className="text-4xl font-black text-white">SAR 99</span>
                  <span className="text-[var(--color-desert-400)]">/ شهرياً</span>
                  <div className="text-xs text-[var(--color-desert-500)] mt-2">* تتم معالجة الدفع باليورو (ما يعادل €29 تقريباً)</div>
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
                  <span className="text-4xl font-black text-white">SAR 399</span>
                  <span className="text-[var(--color-desert-400)]">/ شهرياً</span>
                  <div className="text-xs text-[var(--color-desert-500)] mt-2">* تتم معالجة الدفع باليورو (ما يعادل €99 تقريباً)</div>
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
                <Link href="mailto:sales@officia-mena.com" className="block w-full py-3 rounded-xl border border-[var(--color-gold-700)] text-center text-[var(--color-gold-500)] font-bold hover:bg-[rgba(212,175,55,0.1)] transition-all">
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
