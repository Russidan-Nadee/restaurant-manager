import "server-only";
import { getDatabase } from "@/lib/db";
import { isProteinId } from "@/lib/menu-options";

export class MenuInputError extends Error {}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateMenuId(id: string) {
  if (!uuid.test(id)) throw new MenuInputError("ไม่พบเมนูที่ต้องการแก้ไข");
}

export function parseMenuInput(form: FormData) {
  const id = form.get("id");
  const name = form.get("name");
  const description = form.get("description");
  const price = form.get("price");
  const active = form.get("is_active");
  const proteins = form.getAll("protein_options");
  const special = form.get("special_available");
  if (typeof id !== "string") throw new MenuInputError("ข้อมูลเมนูไม่ถูกต้อง");
  if (id) validateMenuId(id);
  if (typeof name !== "string" || !name.trim() || name.trim().length > 200) {
    throw new MenuInputError("กรอกชื่อเมนูไม่เกิน 200 ตัวอักษร");
  }
  if (typeof description !== "string" || description.trim().length > 2000) {
    throw new MenuInputError("รายละเอียดต้องไม่เกิน 2,000 ตัวอักษร");
  }
  if (typeof price !== "string" || !/^(?:0|[1-9][0-9]{0,7})(?:\.[0-9]{1,2})?$/.test(price.trim())) {
    throw new MenuInputError("กรอกราคา 0 ถึง 99,999,999.99 บาท และทศนิยมไม่เกิน 2 ตำแหน่ง");
  }
  if (active !== null && active !== "on") throw new MenuInputError("สถานะเมนูไม่ถูกต้อง");
  if (!proteins.every(isProteinId) || new Set(proteins).size !== proteins.length) {
    throw new MenuInputError("ตัวเลือกเนื้อสัตว์ไม่ถูกต้อง กรุณาเลือกใหม่");
  }
  if (special !== null && special !== "on") throw new MenuInputError("ตัวเลือกพิเศษไม่ถูกต้อง");
  return {
    id, name: name.trim(), description: description.trim() || null, price: price.trim(),
    isActive: active === "on", proteinOptions: proteins, specialAvailable: special === "on",
  };
}

export async function saveMenuRecord(input: ReturnType<typeof parseMenuInput>, image: { replace: boolean; url: string | null }) {
  if (!input.id) {
    await getDatabase().query(
      "INSERT INTO menu_items (name, description, price, is_active, image_url, protein_options, special_available) VALUES ($1, $2, $3, $4, $5, $6::text[], $7)",
      [input.name, input.description, input.price, input.isActive, image.url, input.proteinOptions, input.specialAvailable],
    );
    return { previousImageUrl: null as string | null };
  }
  const client = await getDatabase().connect();
  try {
    await client.query("BEGIN");
    const previous = await client.query<{ image_url: string | null }>("SELECT image_url FROM menu_items WHERE id = $1 FOR UPDATE", [input.id]);
    if (!previous.rows[0]) throw new MenuInputError("เมนูนี้ไม่มีอยู่แล้ว กรุณาโหลดหน้าใหม่");
    await client.query(
      "UPDATE menu_items SET name = $2, description = $3, price = $4, is_active = $5, " +
      "image_url = CASE WHEN $6::boolean THEN $7::text ELSE image_url END, " +
      "protein_options = $8::text[], special_available = $9, updated_at = now() WHERE id = $1",
      [input.id, input.name, input.description, input.price, input.isActive, image.replace, image.url, input.proteinOptions, input.specialAvailable],
    );
    await client.query("COMMIT");
    return { previousImageUrl: image.replace ? previous.rows[0].image_url : null };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

export async function setMenuAvailability(id: string, isActive: boolean) {
  validateMenuId(id);
  const result = await getDatabase().query("UPDATE menu_items SET is_active = $2, updated_at = now() WHERE id = $1 RETURNING id", [id, isActive]);
  if (result.rowCount !== 1) throw new MenuInputError("เมนูนี้ไม่มีอยู่แล้ว กรุณาโหลดหน้าใหม่");
}
