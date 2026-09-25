"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  Boxes,
  BrainCircuit,
  Check,
  ChevronDown,
  Receipt,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Menu,
  X,
} from "lucide-react";
import "./officia-home.css";

const features = [
  {
    icon: Receipt,
    title: "الفواتير والمبيعات",
    copy: "أنشئ فواتير عربية واضحة، وتابع التحصيل من مكان واحد.",
  },
  {
    icon: Boxes,
    title: "المخزون والمنتجات",
    copy: "رؤية دقيقة للأصناف، المستودعات، والطلبات قبل أن تتعطل.",
  },
  {
    icon: UsersRound,
    title: "الموارد البشرية",
    copy: "الرواتب والإجازات وملفات الفريق، بواجهة يفهمها الجميع.",
  },
  {
    icon: ShieldCheck,
    title: "الامتثال المحلي",
    copy: "أدوات تساعدك على تجهيز سجلاتك ومتطلبات الفوترة المحلية.",
  },
];

const faqs = [
  [
    "هل يدعم Officia اللغة العربية بالكامل؟",
    "نعم. الواجهة والمستندات والتقارير مصممة لتعمل بالعربية أولاً، مع دعم اتجاه RTL.",
  ],
  [
    "كيف تعمل تجربة Starter؟",
    "تتضمن خطة Starter تجربة مجانية لمدة 14 يوماً، ثم تبلغ قيمة الاشتراك 99 ريالاً سعودياً شهرياً.",
  ],
  [
    "ما وضع الفوترة الإلكترونية ومتطلبات ZATCA؟",
    "توفر Officia أدوات لإدارة الفواتير والسجلات. ويعتمد استيفاء المتطلبات على إعدادات منشأتك والمتطلبات التنظيمية المطبقة؛ يرجى التحقق من الإعدادات المناسبة لحالتك قبل الاعتماد.",
  ],
  [
    "كيف يعمل Maestro AI؟",
    "يساعد Maestro AI على قراءة المستندات واقتراح تصنيفات وملخصات. راجع كل اقتراح قبل اعتماده.",
  ],
];

function Logo() {
  return (
    <a className="officia-logo" href="#top" aria-label="Officia MENA - الرئيسية">
      <span className="logo-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>
        Officia <b>MENA</b>
      </span>
    </a>
  );
}

function DashboardPreview() {
  return (
    <div className="dashboard-shell" aria-label="معاينة توضيحية للوحة تحكم Officia">
      <div className="dash-top">
        <span className="dash-brand">
          <span className="mini-mark">O</span> لوحة التحكم
        </span>
        <span className="dash-date">الأحد، ٢٣ يونيو ٢٠٢٤</span>
        <span className="dash-avatar">ن</span>
      </div>
      <div className="dash-body">
        <aside className="dash-nav" aria-hidden="true">
          {["نظرة عامة", "الفواتير", "المخزون", "المبيعات", "الموظفون"].map(
            (item, index) => (
              <span className={index === 0 ? "active" : ""} key={item}>
                {item}
              </span>
            ),
          )}
          <span className="nav-ai">
            <BrainCircuit size={14} /> Maestro
          </span>
        </aside>
        <div className="dash-content" dir="rtl">
          <div className="dash-heading">
            <div>
              <small>صباح الخير، نورة</small>
              <h3>صورة واضحة لأعمالك</h3>
            </div>
            <span className="dash-action">+ فاتورة جديدة</span>
          </div>
          <div className="metric-grid">
            <div>
              <small>إجمالي المبيعات</small>
              <strong>ر.س 326,540</strong>
              <em>↑ 14.6%</em>
            </div>
            <div>
              <small>الفواتير المستحقة</small>
              <strong>ر.س 87,230</strong>
              <em>↑ 8.2%</em>
            </div>
            <div>
              <small>الطلبات النشطة</small>
              <strong>156</strong>
              <em className="muted">هذا الشهر</em>
            </div>
          </div>
          <div className="chart-row">
            <div className="chart-card">
              <div className="card-label">
                <span>نمو الإيرادات</span>
                <small>آخر ٦ أشهر</small>
              </div>
              <svg
                viewBox="0 0 360 118"
                role="img"
                aria-label="رسم توضيحي لنمو الإيرادات"
              >
                <path
                  className="gridline"
                  d="M0 28H360M0 65H360M0 102H360"
                />
                <path
                  className="chart-fill"
                  d="M4 95C30 88 43 94 64 75S96 79 115 61s31-2 48-18 27 17 45-2 27-7 42-23 30 3 42-13 27 3 58-5V118H4Z"
                />
                <path
                  className="chart-line"
                  d="M4 95C30 88 43 94 64 75S96 79 115 61s31-2 48-18 27 17 45-2 27-7 42-23 30 3 42-13 27 3 58-5"
                />
              </svg>
            </div>
            <div className="ai-card">
              <span className="ai-orb">
                <Sparkles size={17} />
              </span>
              <small>اقتراح من Maestro AI</small>
              <strong>
                هناك ٤ فواتير متشابهة
                <br />
                يمكن تصنيفها الآن.
              </strong>
              <span className="ai-suggestion">
                مراجعة الاقتراحات <ArrowLeft size={14} />
              </span>
            </div>
          </div>
        </div>
      </div>
      <span className="illustrative">بيانات توضيحية للمعاينة</span>
    </div>
  );
}

export function OfficiaHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Officia MENA",
        operatingSystem: "Web",
        applicationCategory: "BusinessApplication",
        offers: {
          "@type": "Offer",
          price: "99.00",
          priceCurrency: "SAR",
        },
        author: {
          "@type": "Organization",
          name: "Agri Nexus Ltd",
          url: "https://agrinexus.eu",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <div className="officia-brand" dir="rtl" lang="ar" id="top">
      <header className="site-header">
        <Logo />
        <button
          className="mobile-menu"
          type="button"
          aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav
          id="main-navigation"
          className={menuOpen ? "main-nav open" : "main-nav"}
          aria-label="التنقل الرئيسي"
        >
          <a href="#platform" onClick={() => setMenuOpen(false)}>
            المنصة
          </a>
          <a href="#solutions" onClick={() => setMenuOpen(false)}>
            الحلول
          </a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>
            الأسعار
          </a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>
            الأسئلة الشائعة
          </a>
          <a href="/dashboard" className="mobile-nav-cta" onClick={() => setMenuOpen(false)}>
            ابدأ الآن <ArrowLeft size={15} />
          </a>
        </nav>
        <div className="header-actions">
          <a href="#pricing" className="header-link">
            تعرّف على الأسعار
          </a>
          <a href="/dashboard" className="button button-small">
            ابدأ الآن <ArrowLeft size={15} />
          </a>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> مساحة عمل عربية للأعمال الخليجية
            </div>
            <h1>
              أدِر أعمالك
              <br />
              <span>بوضوح.</span> <i>بذكاء.</i>
            </h1>
            <p className="hero-lede">
              من الفاتورة الأولى إلى التقرير الأخير، تجمع Officia عملياتك
              اليومية في مساحة عمل واحدة تفهم السوق المحلي وتترك لك وقتاً للنمو.
            </p>
            <div className="hero-actions">
              <a href="/dashboard" className="button button-primary">
                ابدأ تجربتك <ArrowLeft size={18} />
              </a>
              <a href="#platform" className="text-link">
                شاهد كيف تعمل المنصة <ArrowUpLeft size={17} />
              </a>
            </div>
            <div className="hero-note">
              <span>
                <Check size={14} /> تجربة Starter لمدة 14 يوماً
              </span>
              <span>
                <Check size={14} /> بالعربية أولاً
              </span>
              <span>
                <Check size={14} /> قابل للتوسع معك
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-glow" />
            <div className="visual-label label-top">
              <BrainCircuit size={17} />
              <span>Maestro AI</span>
              <b>مساعدك العملي</b>
            </div>
            <DashboardPreview />
            <div className="visual-label label-bottom">
              <ShieldCheck size={17} />
              <span>سجلاتك في مكان واضح</span>
            </div>
          </div>
        </section>

        <section className="signal-strip" aria-label="وظائف المنصة">
          <span>كل ما تحتاجه لتشغيل عملك</span>
          <i />
          <strong>فاتورة</strong>
          <i />
          <strong>مخزون</strong>
          <i />
          <strong>فريق</strong>
          <i />
          <strong>قرار</strong>
        </section>

        <section className="platform-section" id="platform">
          <div className="section-intro">
            <div className="section-kicker">المنصة في مكان واحد</div>
            <h2>
              أقل تبديل بين الأدوات.
              <br />
              <span>أكثر تركيزاً على العمل.</span>
            </h2>
            <p>
              Officia ليست برنامج محاسبة معزولاً. إنها نقطة التقاء العمليات التي
              تحرك شركتك كل يوم.
            </p>
          </div>
          <div className="feature-grid" id="solutions">
            {features.map(({ icon: Icon, title, copy }, index) => (
              <article className={`feature-card card-${index}`} key={title}>
                <span className="feature-number">0{index + 1}</span>
                <Icon size={25} />
                <h3>{title}</h3>
                <p>{copy}</p>
                <a href="#pricing" aria-label={`تعرف على ${title}`}>
                  اكتشف الوحدة <ArrowLeft size={15} />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="maestro-section">
          <div className="maestro-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="maestro-core">
              <BrainCircuit size={47} />
              <span>AI</span>
            </div>
            <div className="float-card float-one">
              <span>تحليل المصروفات</span>
              <strong>+ ٢١.٤٪</strong>
            </div>
            <div className="float-card float-two">
              <span>فواتير تمت قراءتها</span>
              <strong>١٢٨</strong>
            </div>
          </div>
          <div className="maestro-copy">
            <div className="section-kicker">مساعدك العملي</div>
            <h2>
              ذكاء يساعدك على
              <br />
              <span>اتخاذ الخطوة التالية.</span>
            </h2>
            <p>
              Maestro AI يختصر المستندات، يلفت انتباهك للأنماط، ويحوّل الأرقام
              إلى أسئلة مفيدة. أنت صاحب القرار دائماً.
            </p>
            <ul>
              <li>
                <Check size={16} /> قراءة الفواتير والمستندات
              </li>
              <li>
                <Check size={16} /> ملخصات واضحة للتدفقات والمصروفات
              </li>
              <li>
                <Check size={16} /> اقتراحات قابلة للمراجعة قبل الاعتماد
              </li>
            </ul>
            <a href="/dashboard" className="text-link">
              جرّب مساحة العمل <ArrowLeft size={17} />
            </a>
          </div>
        </section>

        <section className="pricing-section" id="pricing">
          <div className="section-intro centered">
            <div className="section-kicker">خطط تنمو معك</div>
            <h2>
              ابدأ بخطوة <span>واضحة.</span>
            </h2>
            <p>اختر الأدوات التي تحتاجها الآن، وأضف المزيد عندما يحين الوقت.</p>
          </div>
          <div className="pricing-grid">
            <article className="price-card">
              <small>للأعمال الصغيرة</small>
              <h3>Starter</h3>
              <p>كل الأساسيات لإدارة يومك بثقة.</p>
              <strong>
                ر.س 99 <em>/ شهرياً</em>
              </strong>
              <a href="/dashboard" className="button button-outline">
                ابدأ تجربة 14 يوماً
              </a>
              <ul>
                <li>
                  <Check size={15} /> حتى ٥ مستخدمين
                </li>
                <li>
                  <Check size={15} /> فواتير إلكترونية محدودة
                </li>
                <li>
                  <Check size={15} /> إدارة المخزون الأساسية
                </li>
              </ul>
            </article>
            <article className="price-card featured">
              <span className="popular">الأكثر اختياراً</span>
              <small>للأعمال المتنامية</small>
              <h3>Pro</h3>
              <p>رؤية أوسع ووقت أقل في المهام المتكررة.</p>
              <strong>
                ر.س 399 <em>/ شهرياً</em>
              </strong>
              <a href="/dashboard" className="button button-primary">
                ابدأ الآن
              </a>
              <ul>
                <li>
                  <Check size={15} /> مستخدمون غير محدودين
                </li>
                <li>
                  <Check size={15} /> مساعد AI الذكي (Maestro)
                </li>
                <li>
                  <Check size={15} /> قراءة الفواتير بالذكاء الاصطناعي
                </li>
                <li>
                  <Check size={15} /> نظام نقاط البيع (POS)
                </li>
              </ul>
            </article>
            <article className="price-card">
              <small>للشركات متعددة الفروع</small>
              <h3>Enterprise</h3>
              <p>مساحة عمل مرنة للعمليات المعقدة.</p>
              <strong className="contact-price">لنتحدث</strong>
              <a
                href="mailto:info@agrinexus.eu"
                className="button button-outline"
              >
                تواصل معنا
              </a>
              <ul>
                <li>
                  <Check size={15} /> كل ميزات Pro
                </li>
                <li>
                  <Check size={15} /> مدير حساب مخصص
                </li>
                <li>
                  <Check size={15} /> ربط API مخصص
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section className="faq-section" id="faq">
          <div className="section-intro">
            <div className="section-kicker">أسئلة قبل البداية</div>
            <h2>
              كل شيء <span>واضح.</span>
            </h2>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => (
              <div
                className={`faq-item ${openFaq === index ? "is-open" : ""}`}
                key={question}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(openFaq === index ? -1 : index)
                  }
                  aria-expanded={openFaq === index}
                >
                  <span>{question}</span>
                  <ChevronDown size={19} />
                </button>
                {openFaq === index && <p>{answer}</p>}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <Logo />
        <p>تشغيل أوضح للأعمال التي تبني الخليج.</p>
        <div>
          <a href="#platform">المنصة</a>
          <a href="#pricing">الأسعار</a>
          <a href="/about">عن المنصة</a>
          <a href="/contact">تواصل معنا</a>
          <a href="/privacy">الخصوصية</a>
          <a href="/terms">الشروط</a>
          <a href="/dashboard">لوحة التحكم</a>
        </div>
        <small>© 2026 Officia MENA · جميع الحقوق محفوظة</small>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </div>
  );
}