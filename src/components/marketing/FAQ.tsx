import React from 'react';

export function FAQ() {
  return (
    <section className="w-full py-20 relative z-10 bg-black/50 border-t border-gray-800">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-10 text-center">الأسئلة <span className="gold-text">الشائعة</span></h2>
        
        <div className="space-y-6">
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-2">هل يدعم النظام الفوترة الإلكترونية (ZATCA) في السعودية؟</h3>
            <p className="text-[var(--color-desert-200)]">نعم، نظامنا متوافق بالكامل مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) للمرحلة الثانية للفوترة الإلكترونية، ويقوم بتوليد رموز QR مشفرة.</p>
          </div>
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-2">هل يوجد ذكاء اصطناعي (AI) في النظام؟</h3>
            <p className="text-[var(--color-desert-200)]">بالتأكيد. يتضمن النظام &quot;المايسترو&quot; (Maestro AI) الذي يقوم بقراءة الفواتير آلياً عبر الكاميرا (OCR)، تحليل النفقات، وتقديم استشارات ضريبية ذكية بناءً على القوانين المحلية.</p>
          </div>
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-2">هل يمكنني تتبع المخزون والمنتجات الزراعية/البترولية؟</h3>
            <p className="text-[var(--color-desert-200)]">نعم، نوفر وحدة مخزون متقدمة تدعم التصنيفات الخاصة مثل البترول (مع حسابات API Gravity) والأسمدة الزراعية مع تنبيهات لتواريخ انتهاء التصاريح الأمنية.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
