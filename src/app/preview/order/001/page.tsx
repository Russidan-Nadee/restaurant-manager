import { notFound } from "next/navigation";
import { getAvailableMenu, getDiningTable } from "@/lib/menu";
import MenuOrderPreview from "../MenuOrderPreview";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function OrderPreviewPage() {
  const [table, menu] = await Promise.all([getDiningTable("001"), getAvailableMenu()]);
  if (!table) notFound();
  return <MenuOrderPreview table={{ id: "preview-001", name: table.name }} menu={menu} />;
}
