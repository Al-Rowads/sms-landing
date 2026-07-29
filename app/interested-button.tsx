"use client";

import { type FormEvent, useState } from "react";

type InterestedButtonProps = {
  code: string;
  hasMappedLead: boolean;
};

type SubmissionState = "idle" | "submitting" | "success" | "error";

type InterestedPayload = {
  code: string;
  name?: string;
  phone?: string;
};

export default function InterestedButton({
  code,
  hasMappedLead
}: InterestedButtonProps) {
  const [state, setState] = useState<SubmissionState>("idle");
  const [showContactForm, setShowContactForm] = useState(false);

  async function submitInterest(payload: InterestedPayload) {
    if (state === "submitting" || state === "success") {
      return;
    }

    setState("submitting");

    try {
      const response = await fetch("/api/interested", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setState("success");
    } catch {
      setState("error");
    }
  }

  function handleInterestClick() {
    if (hasMappedLead) {
      void submitInterest({ code });
      return;
    }

    setShowContactForm(true);
    setState("idle");
  }

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    void submitInterest({
      code,
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? "")
    });
  }

  if (state === "success") {
    return (
      <div
        aria-live="polite"
        className="soft-panel rounded-[8px] border-[var(--success-border)] px-5 py-6 text-center sm:px-7"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] text-xl font-black text-[var(--muted)]">
          ✓
        </div>
        <p className="title-font mt-4 text-xl text-[var(--white)]">شكراً لك</p>
        <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">
          تم تسجيل اهتمامك بنجاح، وسيتابع معك فريق AL-ROWADs قريباً.
        </p>
      </div>
    );
  }

  if (showContactForm) {
    return (
      <form
        onSubmit={handleContactSubmit}
        className="soft-panel flex flex-col gap-4 rounded-[8px] px-5 py-6 text-right sm:px-7"
      >
        <div>
          <p className="title-font text-xl text-[var(--white)]">
            سجّل بياناتك
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">
            أدخل اسمك ورقم هاتفك ليتمكن فريق AL-ROWADs من التواصل معك.
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm font-bold text-[var(--muted)]">
          الاسم
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            maxLength={200}
            disabled={state === "submitting"}
            className="min-h-12 rounded-[8px] border border-[var(--border)] bg-[var(--surface-input)] px-4 py-3 font-medium text-[var(--white)] placeholder:text-[var(--muted-soft)] disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="اكتب اسمك"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-bold text-[var(--muted)]">
          رقم الهاتف
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            dir="ltr"
            required
            maxLength={32}
            disabled={state === "submitting"}
            className="min-h-12 rounded-[8px] border border-[var(--border)] bg-[var(--surface-input)] px-4 py-3 text-left font-medium text-[var(--white)] placeholder:text-[var(--muted-soft)] disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="+964 7XX XXX XXXX"
          />
        </label>

        <button
          type="submit"
          disabled={state === "submitting"}
          className="min-h-[56px] rounded-[8px] border border-[var(--button-primary-border)] bg-[var(--brand-orange)] px-6 py-4 text-lg font-black text-[var(--primary-contrast)] transition duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            boxShadow:
              state === "submitting"
                ? "var(--button-primary-shadow)"
                : "var(--button-primary-shadow-hover)",
            textShadow: "var(--button-text-shadow)"
          }}
        >
          {state === "submitting" ? "جارٍ تسجيل اهتمامك..." : "إرسال"}
        </button>

        {state === "error" ? (
          <p
            role="alert"
            className="rounded-[8px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-[var(--white)]"
          >
            تعذّر تسجيل بياناتك. تأكد من الاسم ورقم الهاتف وحاول مرة أخرى.
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleInterestClick}
        disabled={state === "submitting"}
        className="min-h-[64px] rounded-[8px] border border-[var(--button-primary-border)] bg-[var(--brand-orange)] px-6 py-4 text-lg font-black text-[var(--primary-contrast)] transition duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          boxShadow: state === "submitting" ? "var(--button-primary-shadow)" : "var(--button-primary-shadow-hover)",
          textShadow: "var(--button-text-shadow)"
        }}
      >
        {state === "submitting" ? "جارٍ تأكيد اهتمامك..." : "أنا مهتم!"}
      </button>

      {state === "error" ? (
        <p
          role="alert"
          className="rounded-[8px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-[var(--white)]"
        >
          تعذّر تسجيل اهتمامك الآن. حاول مرة أخرى بعد قليل.
        </p>
      ) : (
        <p className="text-center text-sm leading-7 text-[var(--muted-soft)]">
          {hasMappedLead
            ? "بعد الضغط على الزر سيتم تأكيد اهتمامك وإرسال الطلب إلى فريق المتابعة."
            : "بعد الضغط على الزر سنطلب اسمك ورقم هاتفك لإرسال الطلب إلى فريق المتابعة."}
        </p>
      )}
    </div>
  );
}
