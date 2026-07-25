import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الشروط والأحكام | Officia MENA',
  description: 'الشروط والأحكام لمنصة Officia MENA المحاسبية. تعرّف على شروط استخدام الخدمة وحقوقك والتزاماتك.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#1A120B] text-white" dir="rtl">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="text-[var(--color-gold-500)] hover:underline mb-8 inline-block">&larr; العودة للرئيسية</Link>
        <h1 className="text-4xl md:text-5xl font-black mb-8">الشروط والأحكام</h1>
        <p className="text-[var(--color-desert-400)] mb-12">آخر تحديث: 25 يوليو 2026</p>

        <div className="space-y-8 text-[var(--color-desert-200)] leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. قبول الشروط</h2>
            <p>باستخدامك لمنصة Officia MENA، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك التوقف عن استخدام المنصة فوراً.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. وصف الخدمة</h2>
            <p>Officia MENA هي منصة محاسبية متكاملة تعمل بالذكاء الاصطناعي، مصممة للشركات في منطقة الشرق الأوسط وشمال أفريقيا. تشمل الخدمات: إدارة الفواتير، المصروفات، المخزون، الرواتب، نقاط البيع، الالتزام الضريبي (ZATCA)، والتقارير المالية.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. التسجيل والحساب</h2>
            <ul className="list-disc list-inside space-y-1 pr-4">
              <li>يجب أن يكون عمرك 18 سنة على الأقل لاستخدام المنصة</li>
              <li>أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك</li>
              <li>يجب تقديم معلومات دقيقة وكاملة عند التسجيل</li>
              <li>نحتفظ بالحق في تعليق أو إنهاء أي حساب ينتهك هذه الشروط</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. خطط الأسعار والدفع</h2>
            <p>تُعرض الأسعار بالريال السعودي (SAR) للمستخدمين في المملكة العربية السعودية. تتم معالجة المدفوعات عبر Stripe باليورو (EUR).</p>
            <ul className="list-disc list-inside space-y-1 pr-4 mt-2">
              <li>الاشتراكات شهرية وتتجدد تلقائياً</li>
              <li>يمكنك الإلغاء في أي وقت، وسيظل الوصول نشطاً حتى نهاية فترة الفوترة</li>
              <li>فترة تجربة مجانية لمدة 14 يوماً لجميع الخطط المدفوعة</li>
              <li>نحن لا نقدم استرداداً للفترات المتبقية بعد الإلغاء</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. التزامات المستخدم</h2>
            <ul className="list-disc list-inside space-y-1 pr-4">
              <li>الالتزام بالقوانين واللوائح المحلية، بما في ذلك قوانين الضرائب في المملكة العربية السعودية</li>
              <li>عدم استخدام المنصة لأي نشاط غير قانوني</li>
              <li>عدم محاولة اختراق أو تعطيل أمن المنصة أو البنية التحتية</li>
              <li>عدم تحميل أو توزيع محتوى ضار أو مخالف</li>
              <li>أنت المسؤول الوحيد عن صحة البيانات المالية المدخلة في النظام</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. الملكية الفكرية</h2>
            <p>جميع الحقوق الفكرية للمنصة، بما في ذلك الكود البرمجي، التصميم، العلامات التجارية، والمحتوى، مملوكة لـ Agri Nexus Ltd. لا يجوز نسخ أو توزيع أو تعديل أي جزء من المنصة دون إذن خطي مسبق.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. حدود المسؤولية</h2>
            <p>تُقدم المنصة "كما هي" دون أي ضمانات صريحة أو ضمنية. نحن لسنا مسؤولين عن:</p>
            <ul className="list-disc list-inside space-y-1 pr-4 mt-2">
              <li>الأضرار المباشرة أو غير المباشرة الناتجة عن استخدام المنصة</li>
              <li>فقدان البيانات أو الأرباح</li>
              <li>دقة الحسابات الضريبية أو التقارير المالية (يوصى بمراجعة محاسب قانوني)</li>
              <li>انقطاع الخدمة بسبب الصيانة أو القوة القاهرة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. الامتثال لـ ZATCA</h2>
            <p>توفر المنصة أدوات للمساعدة في الامتثال لمتطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) للمرحلة الثانية. ومع ذلك، تبقى المسؤولية النهائية عن الامتثال على عاتق المستخدم. نوصي بالتشاور مع مستشار ضريبي معتمد.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. سرية البيانات</h2>
            <p>نحن نتعامل مع بياناتك بسرية تامة وفقاً لسياسة الخصوصية الخاصة بنا. جميع البيانات المالية محمية بتشفير متقدم ولا يتم مشاركتها مع أطراف ثالثة دون موافقتك.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. إنهاء الخدمة</h2>
            <p>يمكنك إنهاء حسابك في أي وقت. في حالة انتهاكك لهذه الشروط، نحتفظ بالحق في إنهاء حسابك فوراً دون إشعار مسبق. بعد الإنهاء، قد نحتفظ ببياناتك للامتثال للالتزامات القانونية.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. القانون الواجب التطبيق</h2>
            <p>تخضع هذه الشروط للقوانين واللوائح في بلغاريا (الاتحاد الأوروبي). يتم حل أي نزاعات عبر المحاكم المختصة في صوفيا، بلغاريا.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. اتصل بنا</h2>
            <p>للاستفسارات المتعلقة بهذه الشروط:</p>
            <ul className="list-none space-y-2 mt-2">
              <li><strong>البريد الإلكتروني:</strong> info@agrinexus.eu</li>
              <li><strong>العنوان:</strong> صوفيا، بلغاريا</li>
            </ul>
          </section>
        </div>

        <div className="mt-16 p-6 rounded-2xl border border-gray-800 bg-gray-900/50">
          <p className="text-sm text-[var(--color-desert-400)]">
            <strong>ملاحظة:</strong> هذه مسودة شروط وأحكام. يوصى بمراجعتها من قبل مستشار قانوني مختص قبل النشر الرسمي.
          </p>
        </div>
      </div>
    </div>
  );
}
