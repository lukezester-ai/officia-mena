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
            <Link href="/about" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">عن المنصة</Link>
            <Link href="#pricing" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">الحلول</Link>
            <Link href="#pricing" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">الأسعار</Link>
            <Link href="/contact" className="text-gray-300 hover:text-[var(--color-gold-500)] transition-colors font-medium">تواصل معنا</Link>
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
            
            <div className="text-lg md:text-xl text-[var(--color-desert-200)] mb-10 font-light space-y-3">
              <p>منصة محاسبية ذكية لرواد الأعمال والشركات. الحل الأمثل لإدارة الشؤون المالية بثقة.</p>
              <ul className="space-y-2 mt-4 text-base">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[var(--color-gold-500)] rounded-full"></div> <span>مدعومة بالذكاء الاصطناعي (Maestro AI)</span></li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[var(--color-gold-500)] rounded-full"></div> <span>أتمتة كاملة لإدارة النفقات والمخزون</span></li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[var(--color-gold-500)] rounded-full"></div> <span>متوافقة 100% مع أنظمة الضرائب العربية</span></li>
              </ul>
            </div>
            
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
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full h-[500px]"
            >
              {/* Main glowing backplate */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold-500)]/20 to-[var(--color-desert-600)]/10 rounded-3xl blur-xl transform rotate-3"></div>
              
              {/* Main Dashboard Panel */}
              <motion.div 
                animate={{ y: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute inset-0 glass-panel rounded-3xl border border-[var(--color-gold-700)]/40 p-6 shadow-2xl flex flex-col gap-5 overflow-hidden backdrop-blur-xl bg-black/40"
              >
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-800/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gold-gradient shadow-[0_0_10px_rgba(212,175,55,0.3)]"></div>
                    <div className="h-3 w-24 bg-gray-600/50 rounded-full"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/40 rounded-2xl p-4 border border-gray-700/50 hover:border-[var(--color-gold-500)]/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-3 w-16 bg-gray-600/50 rounded-full"></div>
                      <Receipt className="text-[var(--color-gold-500)]" size={18} />
                    </div>
                    <div className="h-6 w-24 bg-white/80 rounded-full mb-2"></div>
                    <div className="h-2 w-12 bg-emerald-500/80 rounded-full"></div>
                  </div>
                  <div className="bg-gray-800/40 rounded-2xl p-4 border border-gray-700/50 hover:border-[var(--color-emerald-500)]/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-3 w-16 bg-gray-600/50 rounded-full"></div>
                      <Users className="text-[var(--color-emerald-500)]" size={18} />
                    </div>
                    <div className="h-6 w-20 bg-white/80 rounded-full mb-2"></div>
                    <div className="h-2 w-14 bg-emerald-500/80 rounded-full"></div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 bg-gray-800/30 rounded-2xl border border-gray-700/50 p-5 mt-2 relative overflow-hidden flex flex-col justify-end group">
                   <div className="absolute top-4 left-4 h-3 w-24 bg-gray-600/50 rounded-full"></div>
                   
                   {/* Scanning laser effect */}
                   <motion.div 
                     animate={{ y: [0, 100, 0], opacity: [0, 1, 0] }}
                     transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                     className="absolute left-0 right-0 h-[2px] bg-[var(--color-emerald-500)] shadow-[0_0_15px_var(--color-emerald-500)] z-10"
                   />

                   <div className="flex items-end justify-between gap-3 h-32 w-full z-0">
                     {[40, 70, 45, 90, 60, 110, 80].map((height, i) => (
                       <motion.div 
                         key={i}
                         animate={{ 
                           height: [`${height}px`, `${height * 1.2}px`, `${height * 0.8}px`, `${height}px`]
                         }}
                         transition={{ 
                           repeat: Infinity, 
                           duration: 3 + (i % 3), 
                           delay: i * 0.2,
                           ease: "easeInOut" 
                         }}
                         whileHover={{ scaleY: 1.1, backgroundColor: "var(--color-gold-300)" }}
                         className="w-full bg-gradient-to-t from-[var(--color-gold-600)] to-[var(--color-gold-400)] rounded-t-md opacity-80 shadow-[0_0_10px_rgba(212,175,55,0.2)] origin-bottom cursor-pointer"
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
                className="absolute -right-12 top-1/3 glass-panel p-4 rounded-2xl border-2 border-[var(--color-emerald-500)]/30 shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center gap-4 z-20 backdrop-blur-2xl bg-[#1A120B]/90 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-emerald-500)] to-[var(--color-emerald-700)] flex items-center justify-center shadow-inner relative overflow-hidden">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50"
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

        {/* Early Access Banner */}
        <section className="w-full py-6 relative z-10 bg-gradient-to-r from-[var(--color-gold-700)]/20 via-[var(--color-gold-500)]/10 to-[var(--color-gold-700)]/20 border-y border-[var(--color-gold-700)]/30">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="glass-panel inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[var(--color-gold-500)]/30">
              <div className="w-2 h-2 rounded-full bg-[var(--color-emerald-500)] animate-pulse"></div>
              <span className="text-sm md:text-base text-[var(--color-desert-200)]">
                <strong className="text-white">مرحلة الوصول المبكر (Early Access)</strong> — 
                المنصة قيد التطوير. سجّل الآن لتحصل على أولوية الوصول وتجربة مجانية ممتدة.
              </span>
              <Link href="/login" className="px-4 py-1.5 rounded-lg gold-gradient text-[#1A120B] text-sm font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all shrink-0">
                سجّل الآن
              </Link>
            </div>
          </div>
        </section>

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
                  <div className="text-xs text-[var(--color-desert-500)] mt-2">* تتم معالجة الدفع باليورو عبر Stripe (≈€29). نقبل Visa, Mastercard, MADA.</div>
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
                  <div className="text-xs text-[var(--color-desert-500)] mt-2">* تتم معالجة الدفع باليورو عبر Stripe (≈€99). نقبل Visa, Mastercard, MADA.</div>
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

        {/* FAQ Section */}
        <section className="w-full py-20 relative z-10 bg-black/50 border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-10 text-center">الأسئلة <span className="gold-text">الشائعة</span></h2>
            
            <div className="space-y-6">
              <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-2">هل يدعم النظام الفوترة الإلكترونية (ZATCA) في السعودية؟</h3>
                <p className="text-[var(--color-desert-300)]">نعم، نظامنا متوافق بالكامل مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) للمرحلة الثانية للفوترة الإلكترونية، ويقوم بتوليد رموز QR مشفرة.</p>
              </div>
              <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-2">هل يوجد ذكاء اصطناعي (AI) في النظام؟</h3>
                <p className="text-[var(--color-desert-300)]">بالتأكيد. يتضمن النظام "المايسترو" (Maestro AI) الذي يقوم بقراءة الفواتير آلياً عبر الكاميرا (OCR)، تحليل النفقات، وتقديم استشارات ضريبية ذكية بناءً على القوانين المحلية.</p>
              </div>
              <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-2">هل يمكنني تتبع المخزون والمنتجات الزراعية/البترولية؟</h3>
                <p className="text-[var(--color-desert-300)]">نعم، نوفر وحدة مخزون متقدمة تدعم التصنيفات الخاصة مثل البترول (مع حسابات API Gravity) والأسمدة الزراعية مع تنبيهات لتواريخ انتهاء التصاريح الأمنية.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Trust Badges */}
        <section className="w-full py-16 relative z-10 border-t border-gray-800">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-sm text-[var(--color-desert-400)] mb-6 tracking-widest uppercase">موثوق من قبل</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <div className="flex items-center gap-2 text-[var(--color-desert-400)]">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                <span className="text-sm">LinkedIn</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-desert-400)]">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                <span className="text-sm">ZATCA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-desert-400)]">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span className="text-sm">Open Source</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-desert-400)]">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span className="text-sm">Trustpilot</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer with Compliance & Author Links */}
        <footer className="w-full py-12 bg-black border-t border-gray-900 z-10 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-10 mb-10">
              {/* Brand */}
              <div className="text-center md:text-right">
                <Link href="/" className="text-xl font-bold tracking-wider text-white mb-3 block">
                  Officia <span className="gold-text">MENA</span>
                </Link>
                <p className="text-sm text-[var(--color-desert-400)] mb-4 leading-relaxed">
                  منصة محاسبية ذكية للشركات في منطقة الشرق الأوسط وشمال أفريقيا.
                </p>
                <div className="flex justify-center md:justify-start gap-3">
                  <a href="https://linkedin.com/company/officia-mena" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[var(--color-gold-500)]/20 border border-gray-700 flex items-center justify-center transition-all" title="LinkedIn">
                    <span className="text-xs font-bold text-[var(--color-gold-500)]">in</span>
                  </a>
                  <a href="https://twitter.com/officiamena" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[var(--color-gold-500)]/20 border border-gray-700 flex items-center justify-center transition-all" title="Twitter / X">
                    <span className="text-xs font-bold text-[var(--color-gold-500)]">X</span>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="text-center md:text-right">
                <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-sm text-[var(--color-desert-400)] hover:text-[var(--color-gold-500)] transition-colors">الرئيسية</Link></li>
                  <li><Link href="/about" className="text-sm text-[var(--color-desert-400)] hover:text-[var(--color-gold-500)] transition-colors">عن المنصة</Link></li>
                  <li><Link href="/contact" className="text-sm text-[var(--color-desert-400)] hover:text-[var(--color-gold-500)] transition-colors">تواصل معنا</Link></li>
                  <li><Link href="/login" className="text-sm text-[var(--color-desert-400)] hover:text-[var(--color-gold-500)] transition-colors">تسجيل الدخول</Link></li>
                </ul>
              </div>

              {/* Legal */}
              <div className="text-center md:text-right">
                <h4 className="text-white font-bold mb-4">قانوني</h4>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="text-sm text-[var(--color-desert-400)] hover:text-[var(--color-gold-500)] transition-colors">سياسة الخصوصية</Link></li>
                  <li><Link href="/terms" className="text-sm text-[var(--color-desert-400)] hover:text-[var(--color-gold-500)] transition-colors">الشروط والأحكام</Link></li>
                </ul>
              </div>

              {/* Company Info */}
              <div className="text-center md:text-right">
                <h4 className="text-white font-bold mb-4">الشركة</h4>
                <ul className="space-y-2 text-sm text-[var(--color-desert-400)]">
                  <li>Officia MENA for Financial Technology</li>
                  <li>الرياض، المملكة العربية السعودية</li>
                  <li><a href="mailto:info@officia-mena.com" className="hover:text-[var(--color-gold-500)] transition-colors">info@officia-mena.com</a></li>
                  <li><a href="tel:+966112345678" className="hover:text-[var(--color-gold-500)] transition-colors">+966 11 234 5678</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-[var(--color-desert-500)]">© 2026 Officia MENA. جميع الحقوق محفوظة.</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <a href="https://zatca.gov.sa" target="_blank" rel="noopener noreferrer" className="text-[var(--color-desert-400)] hover:text-[var(--color-emerald-500)] transition-colors flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-emerald-500)]"></div>
                  معتمد من ZATCA
                </a>
                <span className="text-[var(--color-desert-600)]">|</span>
                <span className="text-[var(--color-desert-500)]">السجل التجاري: 1010765432</span>
              </div>
            </div>
          </div>
        </footer>

        {/* JSON-LD Structured Data for FAQ and SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "SoftwareApplication",
                  "name": "Officia MENA",
                  "operatingSystem": "Web",
                  "applicationCategory": "BusinessApplication",
                  "offers": {
                    "@type": "Offer",
                    "price": "99.00",
                    "priceCurrency": "SAR"
                  },
                  "author": {
                    "@type": "Organization",
                    "name": "Officia MENA AI Team",
                    "url": "https://officia-mena.com"
                  }
                },
                {
                  "@type": "FAQPage",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "هل يدعم النظام الفوترة الإلكترونية (ZATCA) في السعودية؟",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "نعم، نظامنا متوافق بالكامل مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) للمرحلة الثانية للفوترة الإلكترونية، ويقوم بتوليد رموز QR مشفرة."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "هل يوجد ذكاء اصطناعي (AI) في النظام؟",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "بالتأكيد. يتضمن النظام المايسترو (Maestro AI) الذي يقوم بقراءة الفواتير آلياً عبر الكاميرا (OCR)، تحليل النفقات، وتقديم استشارات ضريبية ذكية بناءً على القوانين المحلية."
                      }
                    }
                  ]
                }
              ]
            })
          }}
        />

      </div>
    </div>
  );
}
