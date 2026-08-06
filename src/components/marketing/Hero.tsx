import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Receipt, BrainCircuit } from 'lucide-react';
import { Globe } from './Globe';

export function Hero() {
  return (
    <main className="max-w-7xl mx-auto px-6 w-full min-h-[90vh] flex flex-col lg:flex-row items-center justify-between gap-12 pb-20 pt-10">
      
      {/* Left Side (Text) */}
      <div className="w-full lg:w-[55%] p-10 md:p-14 rounded-3xl relative z-10">
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
          مستقبل <span className="gold-text">المحاسبة</span><br/> في الشرق الأوسط
        </h1>
        
        <div className="text-lg md:text-xl text-[var(--color-desert-200)] mb-10 font-light space-y-3">
          <p>المنصة المحاسبية الأولى المدعومة بالذكاء الاصطناعي في الشرق الأوسط، مصممة للأعمال الحديثة والصناعات المتخصصة.</p>
          <ul className="space-y-2 mt-4 text-base">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[var(--color-gold-500)] rounded-full"></div> <span>مدعومة بالذكاء الاصطناعي (Maestro AI)</span></li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[var(--color-gold-500)] rounded-full"></div> <span>أتمتة كاملة لإدارة النفقات والمخزون</span></li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[var(--color-gold-500)] rounded-full"></div> <span>متوافقة 100% مع أنظمة الضرائب العربية</span></li>
          </ul>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <Link href="/dashboard" className="px-8 py-4 rounded-xl gold-gradient text-[#1A120B] text-lg font-bold hover:opacity-90 transition-all flex items-center gap-2">
            ابدأ الآن مجاناً
          </Link>
          <Link href="#pricing" className="px-8 py-4 rounded-xl border border-[var(--color-gold-700)] text-[var(--color-gold-500)] text-lg font-bold hover:bg-[rgba(212,175,55,0.1)] transition-all">
            اختر خطتك
          </Link>
        </div>
        
        <div className="mt-12 flex items-center gap-6 text-sm text-[var(--color-desert-300)]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-emerald-500)] shadow-[0_0_8px_var(--color-emerald-500)]"></div>
            متوافق مع هيئة الزكاة (ZATCA) <span className="text-[10px] bg-[var(--color-emerald-500)]/20 text-[var(--color-emerald-400)] px-2 py-0.5 rounded border border-[var(--color-emerald-500)]/30 ml-2">قيد التطوير</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-gold-500)] shadow-[0_0_8px_var(--color-gold-500)]"></div>
            دعم كامل للغة العربية
          </div>
        </div>
      </div>

      {/* Right Side (Animated Graphic & Globe) */}
      <div className="w-full lg:w-[45%] relative hidden lg:flex items-center justify-center z-10" dir="ltr">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative w-full aspect-square flex items-center justify-center"
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,197,24,0.15)_0%,transparent_60%)] pointer-events-none"></div>
          
          <Globe />

          {/* Floating AI Label */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, y: [-10, 10, -10] }}
            transition={{ opacity: { delay: 0.8, duration: 0.5 }, x: { delay: 0.8 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
            className="absolute -right-4 top-[20%] z-20 flex cursor-pointer items-center gap-4 rounded-2xl border border-[var(--color-gold-500)]/30 bg-[#0f1712]/90 p-4 shadow-xl shadow-black/50 backdrop-blur-md"
          >
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-gold-500)] to-yellow-700">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.4),transparent)] opacity-70" />
              <BrainCircuit className="text-[#1A120B] relative z-10" size={24} />
            </div>
            <div>
              <div className="text-sm font-black text-white mb-1 flex items-center gap-2">
                Maestro AI <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-400)] shadow-[0_0_8px_var(--color-emerald-400)] animate-pulse"></span>
              </div>
              <div className="text-xs text-[var(--color-gold-400)] font-medium">
                Global Intelligence
              </div>
            </div>
          </motion.div>
          
          {/* Floating ZATCA Label */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, y: [10, -10, 10] }}
            transition={{ opacity: { delay: 1.2, duration: 0.5 }, x: { delay: 1.2 }, y: { repeat: Infinity, duration: 5, ease: "easeInOut" } }}
            className="absolute -left-4 bottom-[20%] z-20 flex cursor-pointer items-center gap-4 rounded-2xl border border-emerald-500/30 bg-[#0f1712]/90 p-4 shadow-xl shadow-black/50 backdrop-blur-md"
            dir="rtl"
          >
             <div className="rounded-2xl bg-emerald-950 p-2 border border-emerald-500/20">
               <Receipt className="text-emerald-400" size={24} />
             </div>
             <div>
               <div className="text-sm font-black text-white mb-1">
                 مزامنة ZATCA
               </div>
               <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                 متصل بالشبكة
               </div>
             </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
