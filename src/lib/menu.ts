import "server-only";
import { menuImageUrl } from "@/lib/menu-images";
import { getDatabase } from "@/lib/db";
import type { CustomerMenuItem, DiningTable } from "@/app/order/types";

export async function getDiningTables(): Promise<DiningTable[]> {
  const result = await getDatabase().query<DiningTable>(
    "SELECT id, name FROM restaurant_tables WHERE name ~ $1 ORDER BY name ASC",
    ["^[0-9]{3}$"],
  );
  return result.rows;
}

export async function getDiningTable(code: string): Promise<DiningTable | null> {
  if (!/^[0-9]{3}$/.test(code)) return null;
  const result = await getDatabase().query<DiningTable>(
    "SELECT id, name FROM restaurant_tables WHERE name = $1 LIMIT 1", [code],
  );
  return result.rows[0] ?? null;
}

export async function getAvailableMenu(): Promise<CustomerMenuItem[]> {
  const result = await getDatabase().query<CustomerMenuItem>(
    "SELECT m.id, m.name, m.description, m.price::double precision AS price, m.image_url AS \"imageUrl\" " +
    "FROM menu_items m LEFT JOIN categories c ON c.id = m.category_id " +
    "WHERE m.is_active = true ORDER BY c.sort_order ASC NULLS LAST, c.name ASC, m.sort_order ASC, m.name ASC",
  );
  return result.rows.map(item => ({ ...item, imageUrl: menuImageUrl(item.imageUrl) }));
}
