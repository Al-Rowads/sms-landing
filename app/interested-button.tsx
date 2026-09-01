"use client";

import { type FormEvent, useState } from "react";
import type { CourseId } from "@/lib/course-ids";

type InterestedButtonProps = {
  code: string;
  course: CourseId;
  hasMappedLead: boolean;
};

type SubmissionState = "idle" | "submitting" | "success" | "error";

type InterestedPayload = {
  code: string;
  course: CourseId;
  name?: string;
  phone?: string;
};

export default function InterestedButton({
  code,
  course,
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
      void submitInterest({ code, course });
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
      course,
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? "")
    });
  }

  if (state === "success") {
    return (
      <div aria-live="polite" className="interest-state interest-success">
        <div className="interest-status-icon">✓</div>
        <p className="interest-state-title">شكراً لك</p>
        <p className="interest-state-copy">
          تم تسجيل اهتمامك بنجاح، وسيتابع معك فريق AL-ROWADs قريباً.
        </p>
      </div>
    );
  }

  if (showContactForm) {
    return (
      <form onSubmit={handleContactSubmit} className="interest-form">
        <div className="interest-form-heading">
          <p>سجّل بياناتك</p>
          <span>
            أدخل اسمك ورقم هاتفك ليتمكن فريق AL-ROWADs من التواصل معك.
          </span>
        </div>

        <label className="interest-field">
          الاسم
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            maxLength={200}
            disabled={state === "submitting"}
            placeholder="اكتب اسمك"
          />
        </label>

        <label className="interest-field">
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
            placeholder="+964 7XX XXX XXXX"
          />
        </label>

        <button
          type="submit"
          disabled={state === "submitting"}
          className="interest-submit"
        >
          {state === "submitting" ? "جارٍ تسجيل اهتمامك..." : "إرسال الطلب"}
        </button>

        {state === "error" ? (
          <p role="alert" className="interest-error">
            تعذّر تسجيل بياناتك. تأكد من الاسم ورقم الهاتف وحاول مرة أخرى.
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <div className="interest-cta-wrap">
      <button
        type="button"
        onClick={handleInterestClick}
        disabled={state === "submitting"}
        className="interest-submit interest-submit-large"
      >
        {state === "submitting" ? "جارٍ تأكيد اهتمامك..." : "أنا مهتم!"}
      </button>

      {state === "error" ? (
        <p role="alert" className="interest-error">
          تعذّر تسجيل اهتمامك الآن. حاول مرة أخرى بعد قليل.
        </p>
      ) : (
        <p className="interest-helper">
          {hasMappedLead
            ? "بعد الضغط على الزر سيتم تأكيد اهتمامك وإرسال الطلب إلى فريق المتابعة."
            : "بعد الضغط على الزر سنطلب اسمك ورقم هاتفك لإرسال الطلب إلى فريق المتابعة."}
        </p>
      )}
    </div>
  );
}
