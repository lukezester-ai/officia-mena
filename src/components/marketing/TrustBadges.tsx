import React from 'react';
import { motion } from 'framer-motion';

export function TrustBadges() {
  return (
    <section className="w-full py-16 relative z-10 border-t border-gray-800">
      <div className="max-w-[100vw] mx-auto overflow-hidden text-center relative flex py-4">
        <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
        <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>
        
        <p className="text-sm text-[var(--color-desert-300)] absolute -top-4 left-1/2 -translate-x-1/2 tracking-widest uppercase bg-background px-4 z-20">מוثوق من قبل</p>
        
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          className="flex whitespace-nowrap pt-8 items-center gap-16 md:gap-24 w-max"
        >
          {/* Duplicate items twice for infinite loop effect */}
          {[1, 2].map((group) => (
            <React.Fragment key={group}>
              <div className="flex items-center gap-3 text-[var(--color-desert-300)] opacity-70 hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span className="text-lg font-semibold">دعم فوري</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--color-desert-300)] opacity-70 hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                <span className="text-lg font-semibold tracking-wider">ZATCA</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--color-desert-300)] opacity-70 hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span className="text-lg font-semibold tracking-wider">Maestro AI</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--color-desert-300)] opacity-70 hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                <span className="text-lg font-semibold tracking-wider">Lightning Fast</span>
              </div>
              {/* Additional padding element to ensure seamless loop */}
              <div className="w-8"></div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
