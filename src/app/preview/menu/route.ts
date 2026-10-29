import { NextResponse } from "next/server";
import { getDiningTables } from "@/lib/menu";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const tables = await getDiningTables();
  const path = tables[0] ? `/order/${tables[0].name}` : "/order";
  const response = NextResponse.redirect(new URL(path, request.url));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
