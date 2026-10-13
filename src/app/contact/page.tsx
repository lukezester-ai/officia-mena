'use client';

import { useState } from 'react';
import Link from 'next/link';

const Mail = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const MapPin = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const Send = ({ className, size = 18 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const Loader2 = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className}`}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
      message: formData.get('message'),
      website: formData.get('website'),
    };

    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error('Contact request failed');
      setSubmitted(true);
    } catch {
      alert('تعذر إرسال الرسالة حالياً. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
    return;
    // Legacy mail client flow is unreachable and kept only until the UI migration is complete.
            const mailto = `mailto:info@agrinexus.eu?subject=${encodeURIComponent(`استفسار من ${data.name} - ${data.company}`)}&body=${encodeURIComponent(data.message as string + '\n\n---\n' + data.name + '\n' + data.email)}`;
    window.location.href = mailto;
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#1A120B] text-white" dir="rtl">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <Link href="/" className="text-[var(--color-gold-500)] hover:underline mb-8 inline-block">&larr; العودة للرئيسية</Link>

        <h1 className="text-4xl md:text-5xl font-black mb-4">تواصل معنا</h1>
        <p className="text-xl text-[var(--color-desert-300)] mb-16 max-w-2xl">
          لديك استفسار أو تريد معرفة المزيد عن منصتنا؟ نحن هنا لمساعدتك.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            {submitted ? (
              <div className="glass-panel p-10 rounded-3xl border border-[var(--color-emerald-500)]/30 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-emerald-500)]/20 flex items-center justify-center mx-auto mb-6">
                  <Send className="text-[var(--color-emerald-500)]" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">شكراً لتواصلك معنا!</h2>
                <p className="text-[var(--color-desert-300)]">سنقوم بالرد على استفسارك في أقرب وقت ممكن.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">الاسم الكامل</label>
                  <input name="name" required className="w-full bg-black/40 border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]/50 transition-colors" placeholder="أدخل اسمك" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">البريد الإلكتروني</label>
                  <input name="email" type="email" required className="w-full bg-black/40 border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]/50 transition-colors" placeholder="name@company.com" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">الشركة (اختياري)</label>
                  <input name="company" className="w-full bg-black/40 border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]/50 transition-colors" placeholder="اسم الشركة" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">الرسالة</label>
                  <textarea name="message" required rows={5} className="w-full bg-black/40 border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]/50 transition-colors resize-none" placeholder="كيف يمكننا مساعدتك؟"></textarea>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl gold-gradient text-[#1A120B] font-bold hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send size={18} /> إرسال الرسالة</>}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-8">
            <div className="glass-panel p-8 rounded-3xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">معلومات الاتصال</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gold-gradient/20 border border-[var(--color-gold-500)]/30 flex items-center justify-center shrink-0">
                    <Mail className="text-[var(--color-gold-500)]" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">البريد الإلكتروني</h3>
                    <a href="mailto:info@agrinexus.eu" className="text-[var(--color-desert-300)] hover:text-[var(--color-gold-500)] transition-colors">info@agrinexus.eu</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gold-gradient/20 border border-[var(--color-gold-500)]/30 flex items-center justify-center shrink-0">
                    <MapPin className="text-[var(--color-gold-500)]" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">العنوان</h3>
                    <p className="text-[var(--color-desert-300)]">صوفيا، بلغاريا</p>
                  </div>
                </div>
              </div>
            </div>



            <div className="glass-panel p-8 rounded-3xl border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">راسلنا</h2>
              <p className="text-[var(--color-desert-300)] text-sm">يمكنك مراسلتنا عبر البريد الإلكتروني وسنرد في أقرب وقت ممكن.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
