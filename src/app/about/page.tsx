import Link from 'next/link';
import type { Metadata } from 'next';
import { PublicSiteShell } from '@/components/marketing/PublicSiteShell';

export const metadata: Metadata = {
  title: 'من نحن | Officia MENA',
  description: 'تعرف على فريق Officia MENA — منصة محاسبية ذكية للشركات في منطقة الشرق الأوسط وشمال أفريقيا.',
};

export default function AboutPage() {
  return (
    <PublicSiteShell eyebrow="عن Officia MENA" title="محاسبة تفهم المنطقة.">
      <div className="public-panel">
        <Link href="/" className="public-back-link">&larr; العودة للرئيسية</Link>

        <div className="public-content">
          <h1 className="text-4xl md:text-5xl font-black mb-6">من نحن</h1>
          <p className="text-xl text-[var(--color-desert-200)] leading-relaxed mb-6">
            <strong className="text-white">Officia MENA</strong> — منصة محاسبية متكاملة، مدعومة بالذكاء الاصطناعي،
            صُممت خصيصاً لتلبية احتياجات الشركات في منطقة الشرق الأوسط وشمال أفريقيا.
          </p>
          <p className="text-[var(--color-desert-300)] leading-relaxed">
            نؤمن بأن المحاسبة لا يجب أن تكون معقدة. لذلك بنينا منصة تجمع بين القوة والفخامة
            والبساطة — مع التركيز على الامتثال الكامل للأنظمة المحلية مثل هيئة الزكاة والضريبة
            والجمارك (ZATCA) في المملكة العربية السعودية.
          </p>
        </div>

        <div className="public-story-grid">
          <div className="public-story-card">
            <h2 className="text-2xl font-bold text-white mb-4">رؤيتنا</h2>
            <p className="text-[var(--color-desert-200)] leading-relaxed">
              أن نكون المنصة المحاسبية الأولى في الشرق الأوسط، حيث يتكامل الذكاء الاصطناعي
              مع الفهم العميق للأنظمة المحلية لتقديم تجربة محاسبية استثنائية.
            </p>
          </div>
          <div className="public-story-card">
            <h2 className="text-2xl font-bold text-white mb-4">مهمتنا</h2>
            <p className="text-[var(--color-desert-200)] leading-relaxed">
              تمكين رواد الأعمال والشركات في المنطقة بأدوات محاسبية ذكية، متوافقة مع
              الأنظمة المحلية، وبسعر يناسب الجميع.
            </p>
          </div>
        </div>

        <div className="public-story-card public-values">
          <h2 className="text-2xl font-bold text-white mb-6">قيمنا</h2>
          <div className="public-values-grid">
            <div>
              <h3>الابتكار</h3>
              <p className="text-[var(--color-desert-300)] text-sm">نستخدم أحدث تقنيات الذكاء الاصطناعي لتبسيط العمليات المحاسبية.</p>
            </div>
            <div>
              <h3>الثقة</h3>
              <p className="text-[var(--color-desert-300)] text-sm">بياناتك مشفرة وآمنة. الامتثال والخصوصية هما أساس عملنا.</p>
            </div>
            <div>
              <h3>التميز</h3>
              <p className="text-[var(--color-desert-300)] text-sm">نسعى دائماً لتقديم أفضل تجربة مستخدم بخدمات عالية الجودة.</p>
            </div>
          </div>
        </div>

        <div className="public-story-card public-company">
          <h2 className="text-2xl font-bold text-white mb-4">معلومات الشركة</h2>
          <dl className="space-y-4 text-[var(--color-desert-200)]">
            <div className="flex flex-col md:flex-row md:gap-4">
              <dt className="text-white font-semibold min-w-[180px]">الاسم التجاري:</dt>
              <dd>Agri Nexus Ltd</dd>
            </div>
            <div className="flex flex-col md:flex-row md:gap-4">
              <dt className="text-white font-semibold min-w-[180px]">المقر الرئيسي:</dt>
              <dd>صوفيا، بلغاريا</dd>
            </div>
            <div className="flex flex-col md:flex-row md:gap-4">
              <dt className="text-white font-semibold min-w-[180px]">السجل التجاري:</dt>
              <dd>208692862</dd>
            </div>
            <div className="flex flex-col md:flex-row md:gap-4">
              <dt className="text-white font-semibold min-w-[180px]">البريد الإلكتروني:</dt>
              <dd>info@agrinexus.eu</dd>
            </div>
          </dl>
        </div>

        <div className="public-cta-row">
          <Link href="/contact" className="public-button public-button-primary">
            تواصل معنا
          </Link>
        </div>
      </div>
    </PublicSiteShell>
  );
}
