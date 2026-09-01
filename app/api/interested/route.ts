import { NextResponse } from "next/server";
import {
  appendResult,
  DEFAULT_COURSE_ID,
  lookupByCode,
  normalizeCode,
  normalizeName,
  normalizePhone
} from "@/lib/codes";
import { isCourseId } from "@/lib/course-ids";

export const runtime = "nodejs";

type InterestedRequest = {
  code?: unknown;
  course?: unknown;
  name?: unknown;
  phone?: unknown;
};

export async function POST(request: Request) {
  let body: InterestedRequest;

  try {
    body = (await request.json()) as InterestedRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (body.code !== undefined && typeof body.code !== "string") {
    return NextResponse.json({ error: "The code field must be a string." }, { status: 400 });
  }

  if (body.course !== undefined && typeof body.course !== "string") {
    return NextResponse.json(
      { error: "The course field must be a string." },
      { status: 400 }
    );
  }

  if (body.name !== undefined && typeof body.name !== "string") {
    return NextResponse.json({ error: "The name field must be a string." }, { status: 400 });
  }

  if (body.phone !== undefined && typeof body.phone !== "string") {
    return NextResponse.json({ error: "The phone field must be a string." }, { status: 400 });
  }

  const code = normalizeCode(body.code);
  const course =
    typeof body.course === "string" ? body.course.trim() : DEFAULT_COURSE_ID;

  if (!isCourseId(course)) {
    return NextResponse.json({ error: "Unknown course." }, { status: 400 });
  }

  const lead = code ? await lookupByCode(code) : null;
  const name = lead?.name ?? normalizeName(body.name);
  const phone = lead?.phone ?? normalizePhone(body.phone);

  if (!lead) {
    if (!name || name.length > 200) {
      return NextResponse.json(
        { error: "A name of no more than 200 characters is required." },
        { status: 400 }
      );
    }

    const phoneDigitCount = phone.replace(/\D/gu, "").length;

    if (phoneDigitCount < 7 || phoneDigitCount > 15) {
      return NextResponse.json(
        { error: "A valid phone number containing 7 to 15 digits is required." },
        { status: 400 }
      );
    }
  }

  const result = await appendResult(
    {
      name,
      phone,
      code,
      course,
      timestamp: new Date().toISOString()
    },
    { deduplicateBy: lead ? "code" : "phone" }
  );

  return NextResponse.json({
    ok: true,
    recorded: result.appended,
    code,
    course
  });
}
