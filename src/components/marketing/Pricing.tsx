import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Pricing() {
  return (
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
              <span className="text-[var(--color-desert-300)]">/ شهرياً</span>
              <div className="text-xs text-[var(--color-desert-400)] mt-2">* تتم معالجة الدفع باليورو عبر Stripe (≈€29). نقبل Visa, Mastercard, MADA.</div>
            </div>
            <ul className="space-y-4 mb-8 text-gray-100">
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
            <Link href="/dashboard" className="block w-full py-3 rounded-xl border border-[var(--color-gold-700)] text-center text-[var(--color-gold-500)] font-bold hover:bg-[rgba(212,175,55,0.1)] transition-all">
              ابدأ مجاناً (14 يوم)
            </Link>
          </div>

          {/* Pro Plan */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-panel p-8 rounded-3xl relative transform md:-translate-y-4"
          >
            {/* Glowing Border Background */}
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -inset-[2px] rounded-[1.6rem] bg-gradient-to-r from-[var(--color-gold-400)] via-yellow-200 to-[var(--color-gold-600)] opacity-70 z-[-1]"
            />
            
            <div className="absolute inset-0 bg-[#0a0a0a] rounded-3xl z-[-1]"></div>
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 gold-gradient text-[#1A120B] px-4 py-1 rounded-full text-sm font-bold">
              الأكثر مبيعاً
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <p className="text-[var(--color-desert-300)] mb-6 h-12">للاحتياجات المتكاملة وإدارة الموارد الذكية.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-white">SAR 399</span>
              <span className="text-[var(--color-desert-300)]">/ شهرياً</span>
              <div className="text-xs text-[var(--color-desert-400)] mt-2">* تتم معالجة الدفع باليورو عبر Stripe (≈€99). نقبل Visa, Mastercard, MADA.</div>
            </div>
            <ul className="space-y-4 mb-8 text-gray-100">
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
            <Link href="/dashboard" className="block w-full py-3 rounded-xl gold-gradient text-[#1A120B] text-center font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
              اشترك الآن
            </Link>
          </motion.div>

          {/* Enterprise Plan */}
          <div className="glass-panel p-8 rounded-3xl border border-gray-800 hover:border-[var(--color-gold-700)] transition-all">
            <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
            <p className="text-[var(--color-desert-300)] mb-6 h-12">للشركات الكبرى والمؤسسات ذات الفروع المتعددة.</p>
            <div className="mb-8 flex items-center h-10">
              <span className="text-3xl font-black text-white">تواصل معنا</span>
            </div>
            <ul className="space-y-4 mb-8 text-gray-100">
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
            <Link href="mailto:info@agrinexus.eu" className="block w-full py-3 rounded-xl border border-[var(--color-gold-700)] text-center text-[var(--color-gold-500)] font-bold hover:bg-[rgba(212,175,55,0.1)] transition-all">
              اتصل بنا
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
