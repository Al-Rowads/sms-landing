import { NextResponse } from "next/server";
import {
  appendResult,
  lookupByCode,
  normalizeCode,
  normalizeName,
  normalizePhone
} from "@/lib/codes";

export const runtime = "nodejs";

type InterestedRequest = {
  code?: unknown;
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

  if (body.name !== undefined && typeof body.name !== "string") {
    return NextResponse.json({ error: "The name field must be a string." }, { status: 400 });
  }

  if (body.phone !== undefined && typeof body.phone !== "string") {
    return NextResponse.json({ error: "The phone field must be a string." }, { status: 400 });
  }

  const code = normalizeCode(body.code);
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
      timestamp: new Date().toISOString()
    },
    { deduplicateBy: lead ? "code" : "phone" }
  );

  return NextResponse.json({
    ok: true,
    recorded: result.appended,
    code
  });
}
