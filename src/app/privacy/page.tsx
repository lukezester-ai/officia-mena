import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | Officia MENA',
  description: 'سياسة الخصوصية لمنصة Officia MENA для ERP. تعرّف على كيفية جمع، استخدام، وحماية بياناتك.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#1A120B] text-white" dir="rtl">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="text-[var(--color-gold-500)] hover:underline mb-8 inline-block">&larr; العودة للرئيسية</Link>
        <h1 className="text-4xl md:text-5xl font-black mb-8">سياسة الخصوصية</h1>
        <p className="text-[var(--color-desert-400)] mb-12">آخر تحديث: 25 يوليو 2026</p>

        <div className="space-y-8 text-[var(--color-desert-200)] leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. المقدمة</h2>
            <p>نحن في <strong>Agri Nexus Ltd</strong> (المشار إليها فيما يلي بـ "نحن" أو "المنصة") نلتزم بحماية خصوصية مستخدمينا. توضح سياسة الخصوصية هذه كيفية جمع، استخدام، الكشف، وحماية معلوماتك عندما تستخدم منصتنا المحاسبية.</p>
            <p className="mt-2">باستخدامك للمنصة، فإنك توافق على جمع واستخدام المعلومات وفقاً لهذه السياسة.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. المعلومات التي نجمعها</h2>
            <h3 className="text-xl font-semibold text-white mb-2">2.1 المعلومات الشخصية</h3>
            <ul className="list-disc list-inside space-y-1 pr-4">
              <li>الاسم الكامل والبريد الإلكتروني ورقم الهاتف</li>
              <li>اسم الشركة، السجل التجاري، رقم ضريبة القيمة المضافة</li>
              <li>بيانات تسجيل الدخول (بريد إلكتروني، كلمة مرور مشفرة)</li>
              <li>معلومات الدفع والفواتير</li>
            </ul>
            <h3 className="text-xl font-semibold text-white mt-4 mb-2">2.2 المعلومات المالية</h3>
            <ul className="list-disc list-inside space-y-1 pr-4">
              <li>البيانات المحاسبية والمالية المدخلة في النظام</li>
              <li>تفاصيل الفواتير والمشتريات والمصروفات</li>
              <li>المعاملات البنكية والضريبية</li>
            </ul>
            <h3 className="text-xl font-semibold text-white mt-4 mb-2">2.3 المعلومات التقنية</h3>
            <ul className="list-disc list-inside space-y-1 pr-4">
              <li>عنوان IP، نوع المتصفح، نظام التشغيل</li>
              <li>سجلات الاستخدام والتفاعل مع المنصة</li>
              <li>ملفات تعريف الارتباط (Cookies) لأغراض الجلسة والتحليلات</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. كيف نستخدم معلوماتك</h2>
            <p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
            <ul className="list-disc list-inside space-y-1 pr-4 mt-2">
              <li>تقديم وصيانة وتحسين منصتنا المحاسبية</li>
              <li>معالجة الفواتير والإقرارات الضريبية (بما في ذلك ZATCA)</li>
              <li>التواصل معك بخصوص حسابك وتحديثات الخدمة</li>
              <li>الامتثال للالتزامات القانونية والتنظيمية في المملكة العربية السعودية والمنطقة</li>
              <li>تحليل استخدام المنصة لتحسين تجربة المستخدم</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. مشاركة البيانات والإفصاح</h2>
            <p>لا نقوم ببيع بياناتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع:</p>
            <ul className="list-disc list-inside space-y-1 pr-4 mt-2">
              <li><strong>معالجات الدفع:</strong> Stripe لمعالجة المدفوعات (وفقاً لسياسة الخصوصية الخاصة بهم)</li>
              <li><strong>موفري الاستضافة:</strong> Supabase و Vercel لاستضافة البيانات والتطبيق</li>
              <li><strong>الجهات التنظيمية:</strong> هيئة الزكاة والضريبة والجمارك (ZATCA) عند الاقتضاء</li>
              <li><strong>شركاء الخدمات:</strong> مثل خدمات البريد الإلكتروني (Resend) لتوصيل الإشعارات</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. أمان البيانات</h2>
            <p>نتخذ إجراءات أمنية مناسبة لحماية بياناتك، بما في ذلك:</p>
            <ul className="list-disc list-inside space-y-1 pr-4 mt-2">
              <li>تشفير البيانات أثناء النقل (TLS 1.3) وعند التخزين (AES-256)</li>
              <li>التحكم في الوصول متعدد المستويات (RBAC)</li>
              <li>النسخ الاحتياطي اليومي للبيانات</li>
              <li>الامتثال لمعايير OWASP لأمن تطبيقات الويب</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. الاحتفاظ بالبيانات</h2>
            <p>نحتفظ ببياناتك طالما أن حسابك نشط أو حسبما تقتضي اللوائح الضريبية (عادة 10 سنوات وفقاً لقانون الضرائب السعودي). بعد إلغاء حسابك، قد نحتفظ ببعض البيانات للامتثال للالتزامات القانونية قبل حذفها بالكامل.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. حقوقك</h2>
            <p>لديك الحق في:</p>
            <ul className="list-disc list-inside space-y-1 pr-4 mt-2">
              <li>الوصول إلى بياناتك الشخصية</li>
              <li>تصحيح أو تحديث بياناتك</li>
              <li>طلب حذف بياناتك (مع مراعاة الالتزامات القانونية)</li>
              <li>تصدير بياناتك بصيغة قابلة للقراءة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. المراسلات التجارية الإلكترونية</h2>
            <p>قد نرسل لك رسائل بريد إلكتروني متعلقة بالخدمة (إشعارات الفواتير، تحديثات الأمان). يمكنك إلغاء الاشتراك في الرسائل التسويقية في أي وقت.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. التعديلات على سياسة الخصوصية</h2>
            <p>قد نقوم بتحديث هذه السياسة من وقت لآخر. سنقوم بإشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال المنصة.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. اتصل بنا</h2>
            <p>للاستفسارات المتعلقة بهذه السياسة أو ممارسات الخصوصية لدينا، يرجى التواصل معنا:</p>
            <ul className="list-none space-y-2 mt-2">
              <li><strong>البريد الإلكتروني:</strong> info@agrinexus.eu</li>
              <li><strong>العنوان:</strong> صوفيا، بلغاريا</li>
            </ul>
          </section>
        </div>

        <div className="mt-16 p-6 rounded-2xl border border-gray-800 bg-gray-900/50">
          <p className="text-sm text-[var(--color-desert-400)]">
            <strong>ملاحظة:</strong> هذه المسودة تستند إلى أفضل الممارسات. يوصى بمراجعة هذه السياسة من قبل مستشار قانوني مختص قبل النشر الرسمي.
          </p>
        </div>
      </div>
    </div>
  );
}
