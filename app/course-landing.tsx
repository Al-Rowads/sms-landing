import Image from "next/image";
import { headers } from "next/headers";
import { after } from "next/server";
import InterestedButton from "./interested-button";
import { extractFirstName, lookupByCode, normalizeCode } from "@/lib/codes";
import type { CourseLandingConfig } from "@/lib/courses";
import { normalizeVisitorIp, recordVisitor } from "@/lib/visitors";

export type CourseSearchParams = Promise<{
  code?: string | string[] | undefined;
}>;

export type CourseLandingProps = {
  course: CourseLandingConfig;
  searchParams: CourseSearchParams;
};

function pickCode(rawCode: string | string[] | undefined): string {
  if (Array.isArray(rawCode)) {
    return normalizeCode(rawCode[0]);
  }

  return normalizeCode(rawCode);
}

export default async function CourseLanding({
  course,
  searchParams
}: CourseLandingProps) {
  const [params, requestHeaders] = await Promise.all([searchParams, headers()]);
  const visitorIp = normalizeVisitorIp(requestHeaders.get("x-real-ip"));

  if (visitorIp) {
    const seenAt = new Date();

    after(() => {
      try {
        recordVisitor(visitorIp, seenAt);
      } catch (error) {
        console.error("Unable to record the visitor.", error);
      }
    });
  }

  const code = pickCode(params.code);
  const lead = code ? await lookupByCode(code) : null;
  const firstName = extractFirstName(lead?.name ?? "");
  const greeting = firstName ? `مرحباً ${firstName}` : "مرحباً بك";
  const whatsappMessage = encodeURIComponent(course.whatsappMessage);
  const packageGridClass =
    course.packages.length === 1
      ? "packages-grid packages-grid-single"
      : course.packages.length === 3
        ? "packages-grid packages-grid-three"
        : "packages-grid";

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="page-container header-content">
          <a
            className="brand-lockup"
            href="#top"
            aria-label="أكاديمية الرواد - الرئيسية"
          >
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
                {course.eyebrow}
              </p>
              <h1>
                دورة <span>{course.name}</span>
              </h1>
              <p className="hero-lead">{course.heroLead}</p>
              <p className="hero-description">{course.heroDescription}</p>

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
                <span className="trust-mark" aria-hidden="true">
                  ✓
                </span>
                <span>{course.trustItems[0]}</span>
                <i aria-hidden="true" />
                <span>{course.trustItems[1]}</span>
              </div>
            </div>

            <div className="video-column">
              <div className="video-card">
                <div className="video-heading">
                  <div>
                    <span className="live-dot" aria-hidden="true" />
                    الفيديو التعريفي
                  </div>
                  <span>دورة {course.name}</span>
                </div>
                <div className="video-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${course.videoId}?autoplay=1&playsinline=1&controls=1&rel=0`}
                    title={course.videoTitle}
                    loading="eager"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <p className="video-caption">
                  في حال لم يبدأ الفيديو تلقائيا ، انقر على زر التشغيل
                </p>
              </div>
            </div>
          </div>

          <div className="page-container highlights-wrap">
            <div className="course-highlights">
              {course.highlights.map((item) => (
                <div className="highlight-item" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="content-section outcomes-section"
          aria-labelledby="outcomes-title"
        >
          <div className="page-container">
            <div className="section-heading">
              <p className="section-kicker">نتائج ملموسة</p>
              <h2 id="outcomes-title">ماذا ستطوّر من خلال الدورة؟</h2>
              <p>{course.outcomesIntro}</p>
            </div>

            <div className="outcomes-grid">
              {course.outcomes.map((outcome, index) => (
                <article className="outcome-card" key={outcome.title}>
                  <span className="outcome-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{outcome.title}</h3>
                  <p>{outcome.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="content-section program-section"
          id="program"
          aria-labelledby="program-title"
        >
          <div className="page-container">
            <div className="section-heading section-heading-right">
              <p className="section-kicker">برنامج متكامل</p>
              <h2 id="program-title">كل ما تحتاج معرفته قبل التسجيل</h2>
              <p>{course.programIntro}</p>
            </div>

            <div className="program-grid">
              <article className="details-panel">
                <div className="panel-title-row">
                  <span className="panel-index">01</span>
                  <h3>تفاصيل البرنامج</h3>
                </div>
                <dl className="details-list">
                  {course.details.map((detail) => (
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
                  {course.modules.map((courseModule, index) => (
                    <li key={courseModule}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{courseModule}</strong>
                    </li>
                  ))}
                </ol>
              </article>
            </div>
          </div>
        </section>

        <section
          className="content-section packages-section"
          id="packages"
          aria-labelledby="packages-title"
        >
          <div className="page-container">
            <div className="section-heading">
              <p className="section-kicker">خيارات مرنة</p>
              <h2 id="packages-title">اختر الباقة المناسبة</h2>
              <p>
                اختر الباقة التي تناسب احتياجك، ثم سجّل اهتمامك ليتواصل معك
                الفريق.
              </p>
            </div>

            <div className={packageGridClass}>
              {course.packages.map((coursePackage) => (
                <article
                  className={`package-card${coursePackage.featured ? " package-card-featured" : ""}`}
                  key={coursePackage.title}
                >
                  {coursePackage.badge ? (
                    <span className="popular-badge">{coursePackage.badge}</span>
                  ) : null}
                  <h3>{coursePackage.title}</h3>
                  <div className="package-price" dir="ltr">
                    {coursePackage.price}
                  </div>
                  {coursePackage.benefits.length > 0 ? (
                    <ul>
                      {coursePackage.benefits.map((benefit) => (
                        <li key={benefit}>
                          <span aria-hidden="true">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <a
                    className={
                      coursePackage.featured
                        ? "primary-button"
                        : "package-button"
                    }
                    href="#register"
                  >
                    سجّل اهتمامك
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="content-section faq-section"
          aria-labelledby="faq-title"
        >
          <div className="page-container faq-layout">
            <div className="section-heading section-heading-right faq-heading">
              <p className="section-kicker">لديك سؤال؟</p>
              <h2 id="faq-title">أسئلة شائعة</h2>
              <p>إجابات سريعة عن أهم تساؤلاتك قبل الانضمام إلى الدورة</p>
            </div>

            <div className="faq-list">
              {course.faqs.map((faq, index) => (
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

        <section
          className="register-section"
          id="register"
          aria-labelledby="register-title"
        >
          <div className="page-container">
            <div className="register-card">
              <div className="register-copy">
                <p className="section-kicker">خطوتك التالية</p>
                <h2 id="register-title">{course.registerTitle}</h2>
                <p>{course.registerDescription}</p>
                <div className="register-meta">
                  {course.registerMeta.map((item, index) => (
                    <span className="register-meta-item" key={item}>
                      {index > 0 ? <i aria-hidden="true" /> : null}
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="register-action">
                <InterestedButton
                  code={code}
                  course={course.id}
                  hasMappedLead={lead !== null}
                />
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
              <small>دورة {course.name}</small>
            </span>
          </a>
          <p>{course.footerText}</p>
        </div>
      </footer>

      <a
        className="whatsapp-button"
        href={`https://wa.me/9647862411999?text=${whatsappMessage}`}
        target="_blank"
        rel="noreferrer"
        aria-label="التسجيل عبر واتساب"
      >
        <span className="whatsapp-icon" aria-hidden="true">
          ◔
        </span>
        <span>التسجيل عبر واتساب</span>
      </a>
    </div>
  );
}
