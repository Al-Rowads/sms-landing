import Image from "next/image";
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
            src="/al-rowads-logo.png"
            alt="AL-ROWADs"
            width={140}
            height={140}
            priority
            className="h-24 w-24 object-contain drop-shadow-[0_18px_48px_rgba(0,0,0,0.72)] sm:h-28 sm:w-28"
          />
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 text-center">
          <div className="space-y-4">
            <p className="text-sm font-bold tracking-[0.08em] text-[var(--muted)] uppercase">
              AL-ROWADs
            </p>
            <p className="text-2xl font-extrabold text-[var(--white)] sm:text-3xl">
              {greeting}
            </p>
            <div className="brand-rule mx-auto h-px w-28" />
            <h1 className="text-4xl leading-tight font-black text-[var(--white)] sm:text-5xl">
              نشاركك تفاصيل دورة الذكاء العاطفي
            </h1>
            <p className="mx-auto max-w-xl text-base leading-8 text-[var(--foreground-soft)] sm:text-lg">
              برنامج تدريبي متكامل لتطوير أنظمة البيع ورفع أداء فرق المبيعات
            </p>
          </div>

          <div
            className="relative min-h-[260px] overflow-hidden rounded-[8px] border border-[var(--border-strong)] sm:aspect-[16/9]"
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
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-[999px] border border-[var(--button-primary-border)] bg-black/30 px-3 py-1 text-xs font-bold text-[var(--muted)]">
                  AL-ROWADs
                </span>
                <span className="text-xs font-semibold text-[var(--foreground-soft)]">
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
            <p className="text-sm font-bold text-[var(--muted)] sm:text-base">
              نبذة موجزة
            </p>
            <div className="mt-3 space-y-4 text-base leading-8 text-[var(--foreground-soft)] sm:text-lg">
              <ol className="list-inside list-decimal space-y-3">
                <li>
                  <span className="font-bold text-[var(--white)]">
                    مقدمة في الذكاء العاطفي:
                  </span>
                  <br />
                  مفهومه وأهميته في الحياة والعمل
                </li>
                <li>
                  <span className="font-bold text-[var(--white)]">
                    الوعي بالذات:
                  </span>
                  <br />
                  كيف تفهم مشاعرك ومحفزاتها
                </li>
                <li>
                  <span className="font-bold text-[var(--white)]">
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
