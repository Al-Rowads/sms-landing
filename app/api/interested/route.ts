import { NextResponse } from "next/server";
import { appendResult, lookupByCode, normalizeCode } from "@/lib/codes";

export const runtime = "nodejs";

type InterestedRequest = {
  code?: unknown;
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

  const code = normalizeCode(body.code);
  const lead = code ? await lookupByCode(code) : null;

  const result = await appendResult({
    name: lead?.name ?? "",
    phone: lead?.phone ?? "",
    code,
    timestamp: new Date().toISOString()
  });

  return NextResponse.json({
    ok: true,
    recorded: result.appended,
    code
  });
}
