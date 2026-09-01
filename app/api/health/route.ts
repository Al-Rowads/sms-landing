export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return new Response("ok\n", {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
