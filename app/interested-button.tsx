"use client";

import { useState } from "react";

type InterestedButtonProps = {
  code: string;
};

type SubmissionState = "idle" | "submitting" | "success" | "error";

export default function InterestedButton({ code }: InterestedButtonProps) {
  const [state, setState] = useState<SubmissionState>("idle");

  async function handleSubmit() {
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
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setState("success");
    } catch {
      setState("error");
    }
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
        <p className="mt-4 text-xl font-extrabold text-[var(--white)]">شكراً لك</p>
        <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">
          تم تسجيل اهتمامك بنجاح، وسيتابع معك فريق AL-ROWADs قريباً.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleSubmit}
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
          بعد الضغط على الزر سيتم تأكيد اهتمامك وإرسال الطلب إلى فريق المتابعة.
        </p>
      )}
    </div>
  );
}
