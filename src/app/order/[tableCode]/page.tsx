import { notFound } from "next/navigation";
import { getAvailableMenu, getDiningTable } from "@/lib/menu";
import MenuOrder from "../MenuOrder";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function TableOrderPage({ params }: { params: Promise<{ tableCode: string }> }) {
  const { tableCode } = await params;
  const table = await getDiningTable(tableCode);
  if (!table) notFound();
  const menu = await getAvailableMenu();
  return <MenuOrder table={table} menu={menu} />;
}
