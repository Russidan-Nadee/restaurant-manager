import { getDatabase } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getDatabase().query("SELECT 1");
    return Response.json({ status: "ok", services: { postgres: "ok" } }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ status: "unavailable", services: { postgres: "unavailable" } }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
