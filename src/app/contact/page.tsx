'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Send, Loader2 } from 'lucide-react';
import { PublicSiteShell } from '@/components/marketing/PublicSiteShell';

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
    <PublicSiteShell eyebrow="نحن هنا للمساعدة" title="تواصل معنا">
      <div>
        <Link href="/" className="public-back-link">&larr; العودة للرئيسية</Link>

        <p className="public-lede">
          لديك استفسار أو تريد معرفة المزيد عن منصتنا؟ نحن هنا لمساعدتك.
        </p>

        <div className="public-contact-grid">
          <div>
            {submitted ? (
              <div className="public-success">
                <div className="public-success-icon">
                  <Send size={32} />
                </div>
                <h2>شكراً لتواصلك معنا!</h2>
                <p>سنقوم بالرد على استفسارك في أقرب وقت ممكن.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="public-form">
                <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <div>
                  <label htmlFor="contact-name">الاسم الكامل</label>
                  <input id="contact-name" name="name" required placeholder="أدخل اسمك" />
                </div>
                <div>
                  <label htmlFor="contact-email">البريد الإلكتروني</label>
                  <input id="contact-email" name="email" type="email" required placeholder="name@company.com" dir="ltr" />
                </div>
                <div>
                  <label htmlFor="contact-company">الشركة (اختياري)</label>
                  <input id="contact-company" name="company" placeholder="اسم الشركة" />
                </div>
                <div>
                  <label htmlFor="contact-message">الرسالة</label>
                  <textarea id="contact-message" name="message" required rows={5} placeholder="كيف يمكننا مساعدتك؟"></textarea>
                </div>
                <button type="submit" disabled={loading} className="public-form-submit">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-label="جار الإرسال" /> : <><Send size={18} /> إرسال الرسالة</>}
                </button>
              </form>
            )}
          </div>

          <div className="public-contact-aside">
            <div className="public-story-card">
              <h2>معلومات الاتصال</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="public-contact-icon">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3>البريد الإلكتروني</h3>
                    <a href="mailto:info@agrinexus.eu">info@agrinexus.eu</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="public-contact-icon">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3>العنوان</h3>
                    <p>صوفيا، بلغاريا</p>
                  </div>
                </div>
              </div>
            </div>



            <div className="public-story-card">
              <h2>راسلنا</h2>
              <p>يمكنك مراسلتنا عبر البريد الإلكتروني وسنرد في أقرب وقت ممكن.</p>
            </div>
          </div>
        </div>
      </div>
    </PublicSiteShell>
  );
}
