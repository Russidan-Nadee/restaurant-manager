import "server-only";
import { getDatabase } from "@/lib/db";
import type { AdminDiningTable } from "@/app/admin/tables/types";

export class TableInputError extends Error {}

function tableId(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new TableInputError("ไม่พบโต๊ะที่ต้องการแก้ไข");
  }
  return value;
}

export async function getAdminDiningTables(): Promise<AdminDiningTable[]> {
  const result = await getDatabase().query<AdminDiningTable>(
    'SELECT id, name, display_name AS "displayName" FROM restaurant_tables WHERE is_active = true AND name ~ $1 ORDER BY name ASC',
    ["^[0-9]{3}$"],
  );
  return result.rows;
}

export async function saveDiningTable(form: FormData): Promise<string> {
  const rawId = form.get("id");
  const rawName = form.get("display_name");
  if (typeof rawId !== "string" || typeof rawName !== "string" || rawName.trim().length > 100) {
    throw new TableInputError("ชื่อโต๊ะต้องไม่เกิน 100 ตัวอักษร");
  }
  const displayName = rawName.trim() || null;
  if (!rawId) {
    try {
      const result = await getDatabase().query<{ name: string }>(
        "INSERT INTO restaurant_tables (name, display_name) VALUES (lpad(nextval('restaurant_table_code_seq')::text, 3, '0'), $1) RETURNING name",
        [displayName],
      );
      return result.rows[0].name;
    } catch (error) {
      if ((error as { code?: string }).code === "2200H") throw new TableInputError("เลขโต๊ะครบช่วง 001–999 แล้ว ไม่สามารถเพิ่มโต๊ะได้");
      throw error;
    }
  }
  const id = tableId(rawId);
  const result = await getDatabase().query<{ name: string }>(
    "UPDATE restaurant_tables SET display_name = $2 WHERE id = $1 AND is_active = true RETURNING name", [id, displayName],
  );
  if (!result.rows[0]) throw new TableInputError("โต๊ะนี้ไม่มีอยู่ในรายการแล้ว กรุณาโหลดหน้าใหม่");
  return result.rows[0].name;
}

export async function retireDiningTable(form: FormData): Promise<string> {
  const id = tableId(form.get("id"));
  const client = await getDatabase().connect();
  try {
    await client.query("BEGIN");
    const selected = await client.query<{ name: string }>("SELECT name FROM restaurant_tables WHERE id = $1 AND is_active = true FOR UPDATE", [id]);
    if (!selected.rows[0]) throw new TableInputError("โต๊ะนี้ไม่มีอยู่ในรายการแล้ว กรุณาโหลดหน้าใหม่");
    const pending = await client.query<{ occupied: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM orders WHERE table_id = $1 AND status = ANY($2::text[])) AS occupied",
      [id, ["placed", "preparing", "ready"]],
    );
    if (pending.rows[0].occupied) throw new TableInputError("ลบโต๊ะไม่ได้ เพราะยังมีออร์เดอร์ค้างอยู่");
    await client.query("UPDATE restaurant_tables SET is_active = false WHERE id = $1", [id]);
    await client.query("COMMIT");
    return selected.rows[0].name;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}
