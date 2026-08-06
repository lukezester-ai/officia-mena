'use client';

import React from 'react';
import { Header } from '@/components/marketing/Header';
import { Hero } from '@/components/marketing/Hero';
import { EarlyAccessBanner } from '@/components/marketing/EarlyAccessBanner';
import { Pricing } from '@/components/marketing/Pricing';
import { FAQ } from '@/components/marketing/FAQ';
import { TrustBadges } from '@/components/marketing/TrustBadges';
import { Footer } from '@/components/marketing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10 w-full flex flex-col">
        <Header />
        <Hero />
        <EarlyAccessBanner />
        <Pricing />
        <FAQ />
        <TrustBadges />
        <Footer />

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
                    "name": "Agri Nexus Ltd",
                    "url": "https://agrinexus.eu"
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
