import Image from "next/image";
import Script from "next/script";
import InterestedButton from "./interested-button";
import { extractFirstName, lookupByCode, normalizeCode } from "@/lib/codes";

export const runtime = "nodejs";

type SearchParams = Promise<{
  code?: string | string[] | undefined;
}>;

function pickCode(rawCode: string | string[] | undefined): string {
  if (Array.isArray(rawCode)) {
    return normalizeCode(rawCode[0]);
  }

  return normalizeCode(rawCode);
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const code = pickCode(params.code);
  const lead = code ? await lookupByCode(code) : null;
  const firstName = extractFirstName(lead?.name ?? "");
  const greeting = firstName ? `مرحباً ${firstName}` : "مرحباً بك";

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col justify-center gap-8">
        <div className="flex justify-center">
          <Image
            src="/al-rowads-white-logo.png"
            alt="AL-ROWADs"
            width={2790}
            height={2599}
            priority
            className="h-auto w-36 object-contain drop-shadow-[0_18px_48px_rgba(0,0,0,0.72)] sm:w-44"
          />
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 text-center">
          <div className="space-y-4">
            <p className="title-font text-2xl text-[var(--white)] sm:text-3xl">
              {greeting}
            </p>
            <div className="brand-rule mx-auto h-px w-28" />
            <h1 className="text-4xl leading-tight text-[var(--white)] sm:text-5xl">
              الذكاء العاطفي
            </h1>
            <p className="mx-auto max-w-xl text-base leading-8 text-[var(--foreground-soft)] sm:text-lg">
              برنامج تدريبي متكامل لتطوير أنظمة البيع ورفع أداء فرق المبيعات
            </p>
          </div>

          <div
            className="relative w-full overflow-hidden rounded-[18px] p-px sm:rounded-[24px]"
            style={{
              background:
                "linear-gradient(135deg, rgba(217, 195, 171, 0.72) 0%, rgba(232, 80, 2, 0.88) 48%, rgba(193, 8, 1, 0.68) 72%, rgba(51, 51, 51, 0.9) 100%)",
              boxShadow:
                "0 24px 72px rgba(0, 0, 0, 0.58), 0 0 40px rgba(232, 80, 2, 0.1)",
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[rgba(249,249,249,0.54)]"
            />
            <div className="rounded-[17px] bg-black p-1.5 sm:rounded-[23px] sm:p-2">
              <div className="relative aspect-video w-full overflow-hidden rounded-[13px] bg-[#050505] sm:rounded-[18px]">
                <iframe
                  src="https://player.vimeo.com/video/1214858010?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1"
                  title="EI.mp4"
                  loading="lazy"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </div>
          </div>
          <Script
            src="https://player.vimeo.com/api/player.js"
            strategy="afterInteractive"
          />

          <div
            className="relative min-h-[260px] overflow-hidden rounded-[8px] border border-[var(--border-strong)]"
            style={{ boxShadow: "var(--shadow-raised)" }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0, 0, 0, 0.18) 0%, rgba(193, 8, 1, 0.4) 44%, rgba(241, 96, 1, 0.46) 74%, rgba(217, 195, 171, 0.24) 100%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(249, 249, 249, 0.18) 0%, transparent 24%), radial-gradient(circle at bottom left, rgba(0, 0, 0, 0.58) 0%, transparent 56%)",
              }}
            />
            <div className="relative flex h-full flex-col justify-between gap-6 p-5 text-right sm:gap-0 sm:p-7">
              <div className="flex items-center justify-end">
                <span className="title-font text-xs text-[var(--foreground-soft)]">
                  المادة البصرية للدورة
                </span>
              </div>

              <div className="space-y-3">
                <div className="brand-rule h-px w-20" />
                <div className="max-w-xl space-y-3 text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">
                  <p>
                    لكثير من المشكلات في العلاقات والعمل والتواصل اليومي قد تكون
                    مرتبطة بصعوبة فهم المشاعر وإدارة الانفعالات.
                  </p>
                  <p>وهذا يؤدي إلى:</p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>التوتر المستمر وردود الأفعال المتسرعة</li>
                    <li>صعوبة التعامل مع الضغوط والمواقف الصعبة</li>
                    <li>
                      سوء الفهم وفجوات التواصل في العلاقات الشخصية والمهنية
                    </li>
                    <li>التأثر السريع بالمشاعر السلبية والضغوط اليومية</li>
                    <li>اتخاذ قرارات تحت تأثير الغضب أو الانفعال</li>
                  </ul>
                  <p>
                    ولهذا صممت دورة الذكاء العاطفي لتساعدك على فهم مشاعرك
                    وإدارتها بشكل أفضل، وفهم الآخرين والتواصل معهم بوعي وحكمة،
                    لبناء علاقات أكثر توازنًا ونجاحًا.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="soft-panel rounded-[8px] px-5 py-6 text-right sm:px-7 sm:py-7">
            <p className="title-font text-sm text-[var(--muted)] sm:text-base">
              نبذة موجزة
            </p>
            <div className="mt-3 space-y-4 text-base leading-8 text-[var(--foreground-soft)] sm:text-lg">
              <ol className="list-inside list-decimal space-y-3">
                <li>
                  <span className="title-font text-[var(--white)]">
                    مقدمة في الذكاء العاطفي:
                  </span>
                  <br />
                  مفهومه وأهميته في الحياة والعمل
                </li>
                <li>
                  <span className="title-font text-[var(--white)]">
                    الوعي بالذات:
                  </span>
                  <br />
                  كيف تفهم مشاعرك ومحفزاتها
                </li>
                <li>
                  <span className="title-font text-[var(--white)]">
                    إدارة الذات:
                  </span>
                  <br />
                  تقنيات التعامل مع الانفعالات والضغوط اليومية
                </li>
              </ol>
            </div>
          </div>

          <InterestedButton code={code} hasMappedLead={lead !== null} />
        </div>
      </section>
    </main>
  );
}
