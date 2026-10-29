import { getDatabase } from "@/lib/db";
import { menuImageUrl } from "@/lib/menu-images";
import MenuManager from "./MenuManager";
import type { AdminMenuItem } from "./types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminMenuPage() {
  const result = await getDatabase().query<AdminMenuItem>(
    "SELECT m.id, m.name, m.description, m.image_url, c.name AS category, m.price::double precision AS price, m.is_active, m.protein_options, m.special_available " +
    "FROM menu_items m LEFT JOIN categories c ON c.id = m.category_id " +
    "ORDER BY c.sort_order ASC NULLS LAST, c.name ASC, m.sort_order ASC, m.name ASC",
  );
  return <MenuManager items={result.rows.map(item => ({ ...item, image_url: menuImageUrl(item.image_url) }))} />;
}
