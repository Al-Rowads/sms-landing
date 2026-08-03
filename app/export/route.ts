import { loadLeadExportCsv } from "@/lib/codes";

export const runtime = "nodejs";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff"
};

export async function GET() {
  try {
    const csv = await loadLeadExportCsv();

    return new Response(csv, {
      headers: {
        ...NO_STORE_HEADERS,
        "Content-Disposition": 'attachment; filename="leads.csv"',
        "Content-Type": "text/csv; charset=utf-8"
      }
    });
  } catch (error) {
    console.error("Unable to export interested leads.", error);

    return new Response("Unable to export interested leads.", {
      status: 500,
      headers: {
        ...NO_STORE_HEADERS,
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }
}
