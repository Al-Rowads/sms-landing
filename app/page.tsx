import Image from "next/image";
import InterestedButton from "./interested-button";
import { extractFirstName, lookupByCode, normalizeCode } from "@/lib/codes";

export const runtime = "nodejs";

type SearchParams = Promise<{
  code?: string | string[] | undefined;
}>;

const courseHighlights = [
  { label: "المكان", value: "بغداد – نادي اليرموك" },
  { label: "المواعيد", value: "29/8، 12/9، 26/9/2026" },
  { label: "الوقت", value: "3:00 – 9:00 مساءً" },
  { label: "المدة", value: "3 محاضرات | 18 ساعة" }
];

const outcomes = [
  {
    number: "01",
    title: "فهم المشاعر",
    description: "تفهم أسباب مشاعرك وتأثيرها على قراراتك."
  },
  {
    number: "02",
    title: "إدارة الانفعالات",
    description: "تتعامل مع الغضب والضغط والرفض بتوازن أكبر."
  },
  {
    number: "03",
    title: "تحسين العلاقات",
    description: "تطوّر التواصل وفهم الآخرين وبناء علاقات أفضل."
  },
  {
    number: "04",
    title: "قرارات أكثر وعياً",
    description: "تقلل تأثير الانفعال المؤقت على قراراتك."
  }
];

const courseDetails = [
  { label: "المدرب", value: "د. أحمد الكاتب" },
  { label: "المكان", value: "بغداد – نادي اليرموك الترفيهي" },
  { label: "المواعيد", value: "29/8، 12/9، 26/9/2026" },
  { label: "الوقت", value: "3:00 – 9:00 مساءً" },
  { label: "المدة", value: "3 محاضرات | 18 ساعة" },
  { label: "الشهادة", value: "شهادة من أكاديمية الرواد" }
];

const modules = [
  "علاقتك مع نفسك وفهم مشاعرك",
  "علاقتك مع الآخرين وفهمهم",
  "إدارة الضغط والتوتر والأزمات",
  "المزاج العام وطريقة النظر للحياة",
  "الرضا والسعادة"
];

const packages = [
  {
    title: "الحضور الحضوري",
    price: "550$",
    benefits: [
      "حضور المحاضرات الثلاث",
      "التطبيق والنقاش داخل القاعة",
      "شهادة من الأكاديمية"
    ]
  },
  {
    title: "الحضور + التسجيلات",
    price: "750$",
    featured: true,
    benefits: ["الحضور الحضوري", "تسجيلات الدورة", "مراجعة المحتوى لاحقاً"]
  },
  {
    title: "باقة شخصين",
    price: "850$",
    benefits: ["حضور شخصين", "التسجيلات", "مناسبة للأزواج أو العائلة"]
  },
  {
    title: "VIP",
    price: "1150$",
    benefits: ["الحضور", "التسجيلات", "استشارة خاصة لمدة ساعة"]
  }
];

const faqs = [
  {
    question: "هل الدورة مناسبة لتخصص معين؟",
    answer: "لا، هي مناسبة لكل شخص يريد تطوير مهارة الذكاء العاطفي."
  },
  {
    question: "هل الدورة عملية أم نظرية؟",
    answer: "تعتمد على التمارين والتطبيق والمناقشات والحالات الواقعية."
  },
  {
    question: "هل توجد تسجيلات؟",
    answer: "نعم، ضمن الباقات التي تشمل التسجيلات."
  },
  {
    question: "هل يحصل المشارك على شهادة؟",
    answer: "نعم، يحصل المشارك على شهادة من أكاديمية الرواد."
  }
];

function pickCode(rawCode: string | string[] | undefined): string {
  if (Array.isArray(rawCode)) {
    return normalizeCode(rawCode[0]);
  }

  return normalizeCode(rawCode);
}

export default async function Home({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const code = pickCode(params.code);
  const lead = code ? await lookupByCode(code) : null;
  const firstName = extractFirstName(lead?.name ?? "");
  const greeting = firstName ? `مرحباً ${firstName}` : "مرحباً بك";
  const whatsappMessage = encodeURIComponent(
    "مرحباً، أود التسجيل في دورة الذكاء العاطفي."
  );

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="page-container header-content">
          <a className="brand-lockup" href="#top" aria-label="أكاديمية الرواد - الرئيسية">
            <Image
              src="/al-rowads-white-logo.png"
              alt="شعار أكاديمية الرواد"
              width={2790}
              height={2599}
              priority
              className="brand-logo"
            />
            <span>
              <strong>أكاديمية الرواد</strong>
              <small>AL-ROWADs Academy</small>
            </span>
          </a>

          <nav className="header-nav" aria-label="التنقل الرئيسي">
            <a href="#program">محاور الدورة</a>
            <a href="#packages">الباقات</a>
            <a className="header-cta" href="#register">
              احجز مقعدك
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-glow hero-glow-one" aria-hidden="true" />
          <div className="hero-glow hero-glow-two" aria-hidden="true" />

          <div className="page-container hero-grid">
            <div className="hero-copy">
              <div className="personal-greeting">{greeting}</div>
              <p className="eyebrow">
                <span aria-hidden="true" />
                برنامج حضوري مع د. أحمد الكاتب
              </p>
              <h1>
                دورة <span>الذكاء العاطفي</span>
              </h1>
              <p className="hero-lead">افهم نفسك ومشاعرك… وابنِ علاقات أفضل</p>
              <p className="hero-description">
                برنامج تدريبي عملي يساعدك على فهم مشاعرك وإدارتها، وتحسين طريقة
                تعاملك مع نفسك والآخرين في الحياة والعمل والعلاقات.
              </p>

              <div className="hero-actions">
                <a className="primary-button" href="#register">
                  احجز مقعدك الآن
                  <span aria-hidden="true">←</span>
                </a>
                <a className="secondary-button" href="#packages">
                  شاهد الباقات
                </a>
              </div>

              <div className="hero-trust">
                <span className="trust-mark" aria-hidden="true">✓</span>
                <span>تدريب عملي</span>
                <i aria-hidden="true" />
                <span>شهادة من الأكاديمية</span>
              </div>
            </div>

            <div className="video-column">
              <div className="video-card">
                <div className="video-heading">
                  <div>
                    <span className="live-dot" aria-hidden="true" />
                    الفيديو التعريفي
                  </div>
                  <span>دورة الذكاء العاطفي</span>
                </div>
                <div className="video-frame">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/E_dehUGp_Yg?autoplay=1&mute=1&playsinline=1&controls=1&rel=0"
                    title="الفيديو التعريفي لدورة الذكاء العاطفي"
                    loading="eager"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <p className="video-caption">
                  إذا لم يبدأ الفيديو تلقائياً، اضغط على زر التشغيل.
                </p>
              </div>
            </div>
          </div>

          <div className="page-container highlights-wrap">
            <div className="course-highlights">
              {courseHighlights.map((item) => (
                <div className="highlight-item" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section outcomes-section" aria-labelledby="outcomes-title">
          <div className="page-container">
            <div className="section-heading">
              <p className="section-kicker">نتائج ملموسة</p>
              <h2 id="outcomes-title">ماذا ستطوّر من خلال الدورة؟</h2>
              <p>أربع نتائج أساسية تساعدك على التعامل بوعي أكبر مع نفسك والآخرين.</p>
            </div>

            <div className="outcomes-grid">
              {outcomes.map((outcome) => (
                <article className="outcome-card" key={outcome.number}>
                  <span className="outcome-number">{outcome.number}</span>
                  <h3>{outcome.title}</h3>
                  <p>{outcome.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section program-section" id="program" aria-labelledby="program-title">
          <div className="page-container">
            <div className="section-heading section-heading-right">
              <p className="section-kicker">برنامج متكامل</p>
              <h2 id="program-title">كل ما تحتاج معرفته قبل التسجيل</h2>
              <p>تفاصيل واضحة ومحاور عملية مصممة لتنعكس على حياتك وعلاقاتك.</p>
            </div>

            <div className="program-grid">
              <article className="details-panel">
                <div className="panel-title-row">
                  <span className="panel-index">01</span>
                  <h3>تفاصيل البرنامج</h3>
                </div>
                <dl className="details-list">
                  {courseDetails.map((detail) => (
                    <div key={detail.label}>
                      <dt>{detail.label}</dt>
                      <dd>{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>

              <article className="modules-panel">
                <div className="panel-title-row">
                  <span className="panel-index">02</span>
                  <h3>محاور الدورة</h3>
                </div>
                <ol className="modules-list">
                  {modules.map((module, index) => (
                    <li key={module}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{module}</strong>
                    </li>
                  ))}
                </ol>
              </article>
            </div>
          </div>
        </section>

        <section className="content-section packages-section" id="packages" aria-labelledby="packages-title">
          <div className="page-container">
            <div className="section-heading">
              <p className="section-kicker">خيارات مرنة</p>
              <h2 id="packages-title">اختر الباقة المناسبة</h2>
              <p>اختر التجربة التي تناسب احتياجك، ثم سجّل اهتمامك ليتواصل معك الفريق.</p>
            </div>

            <div className="packages-grid">
              {packages.map((coursePackage) => (
                <article
                  className={`package-card${coursePackage.featured ? " package-card-featured" : ""}`}
                  key={coursePackage.title}
                >
                  {coursePackage.featured ? (
                    <span className="popular-badge">الأكثر اختياراً</span>
                  ) : null}
                  <h3>{coursePackage.title}</h3>
                  <div className="package-price" dir="ltr">
                    {coursePackage.price}
                  </div>
                  <ul>
                    {coursePackage.benefits.map((benefit) => (
                      <li key={benefit}>
                        <span aria-hidden="true">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <a
                    className={coursePackage.featured ? "primary-button" : "package-button"}
                    href="#register"
                  >
                    سجّل اهتمامك
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section faq-section" aria-labelledby="faq-title">
          <div className="page-container faq-layout">
            <div className="section-heading section-heading-right faq-heading">
              <p className="section-kicker">لديك سؤال؟</p>
              <h2 id="faq-title">أسئلة شائعة</h2>
              <p>إجابات سريعة عن أكثر ما يهمك قبل الانضمام إلى الدورة.</p>
            </div>

            <div className="faq-list">
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>
                    <span>{faq.question}</span>
                    <i aria-hidden="true">+</i>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="register-section" id="register" aria-labelledby="register-title">
          <div className="page-container">
            <div className="register-card">
              <div className="register-copy">
                <p className="section-kicker">خطوتك التالية</p>
                <h2 id="register-title">ابدأ خطوة جديدة في فهم نفسك وعلاقاتك</h2>
                <p>
                  سجّل اهتمامك وسيتواصل معك فريق أكاديمية الرواد لتأكيد الباقة
                  وإرسال طرق الدفع.
                </p>
                <div className="register-meta">
                  <span>بغداد</span>
                  <i aria-hidden="true" />
                  <span>18 ساعة تدريبية</span>
                  <i aria-hidden="true" />
                  <span>شهادة من الأكاديمية</span>
                </div>
              </div>
              <div className="register-action">
                <InterestedButton code={code} hasMappedLead={lead !== null} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container footer-content">
          <a className="brand-lockup footer-brand" href="#top">
            <Image
              src="/al-rowads-white-logo.png"
              alt=""
              width={2790}
              height={2599}
              className="brand-logo"
            />
            <span>
              <strong>أكاديمية الرواد</strong>
              <small>دورة الذكاء العاطفي</small>
            </span>
          </a>
          <p>دورة الذكاء العاطفي مع د. أحمد الكاتب</p>
        </div>
      </footer>

      <a
        className="whatsapp-button"
        href={`https://wa.me/9647862411999?text=${whatsappMessage}`}
        target="_blank"
        rel="noreferrer"
        aria-label="التسجيل عبر واتساب"
      >
        <span className="whatsapp-icon" aria-hidden="true">◔</span>
        <span>التسجيل عبر واتساب</span>
      </a>
    </div>
  );
}
