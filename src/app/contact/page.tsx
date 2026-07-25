'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Send, Loader2 } from 'lucide-react';

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
    };

    // Send via mailto as fallback
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
