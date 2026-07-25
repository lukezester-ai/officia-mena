import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'من نحن | Officia MENA',
  description: 'تعرف على فريق Officia MENA — منصة محاسبية ذكية للشركات في منطقة الشرق الأوسط وشمال أفريقيا.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#1A120B] text-white" dir="rtl">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="text-[var(--color-gold-500)] hover:underline mb-8 inline-block">&larr; العودة للرئيسية</Link>

        <div className="glass-panel p-10 md:p-14 rounded-3xl mb-12">
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

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="glass-panel p-8 rounded-3xl border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-4">رؤيتنا</h2>
            <p className="text-[var(--color-desert-200)] leading-relaxed">
              أن نكون المنصة المحاسبية الأولى في الشرق الأوسط، حيث يتكامل الذكاء الاصطناعي
              مع الفهم العميق للأنظمة المحلية لتقديم تجربة محاسبية استثنائية.
            </p>
          </div>
          <div className="glass-panel p-8 rounded-3xl border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-4">مهمتنا</h2>
            <p className="text-[var(--color-desert-200)] leading-relaxed">
              تمكين رواد الأعمال والشركات في المنطقة بأدوات محاسبية ذكية، متوافقة مع
              الأنظمة المحلية، وبسعر يناسب الجميع.
            </p>
          </div>
        </div>

        <div className="glass-panel p-10 rounded-3xl border border-gray-800 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">قيمنا</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-gold-500)] mb-2">الابتكار</h3>
              <p className="text-[var(--color-desert-300)] text-sm">نستخدم أحدث تقنيات الذكاء الاصطناعي لتبسيط العمليات المحاسبية.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-gold-500)] mb-2">الثقة</h3>
              <p className="text-[var(--color-desert-300)] text-sm">بياناتك مشفرة وآمنة. الامتثال والخصوصية هما أساس عملنا.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-gold-500)] mb-2">التميز</h3>
              <p className="text-[var(--color-desert-300)] text-sm">نسعى دائماً لتقديم أفضل تجربة مستخدم بخدمات عالية الجودة.</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-10 rounded-3xl border border-gray-800 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">معلومات الشركة</h2>
          <dl className="space-y-4 text-[var(--color-desert-200)]">
            <div className="flex flex-col md:flex-row md:gap-4">
              <dt className="text-white font-semibold min-w-[180px]">الاسم التجاري:</dt>
              <dd>Officia MENA for Financial Technology</dd>
            </div>
            <div className="flex flex-col md:flex-row md:gap-4">
              <dt className="text-white font-semibold min-w-[180px]">المقر الرئيسي:</dt>
              <dd>الرياض، المملكة العربية السعودية</dd>
            </div>
            <div className="flex flex-col md:flex-row md:gap-4">
              <dt className="text-white font-semibold min-w-[180px]">السجل التجاري:</dt>
              <dd>1010765432</dd>
            </div>
            <div className="flex flex-col md:flex-row md:gap-4">
              <dt className="text-white font-semibold min-w-[180px]">الرقم الضريبي:</dt>
              <dd>310987654300003</dd>
            </div>
            <div className="flex flex-col md:flex-row md:gap-4">
              <dt className="text-white font-semibold min-w-[180px]">البريد الإلكتروني:</dt>
              <dd>info@officia-mena.com</dd>
            </div>
          </dl>
        </div>

        <div className="flex justify-center">
          <Link href="/contact" className="px-8 py-4 rounded-xl gold-gradient text-[#1A120B] font-bold hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all">
            تواصل معنا
          </Link>
        </div>
      </div>
    </div>
  );
}
