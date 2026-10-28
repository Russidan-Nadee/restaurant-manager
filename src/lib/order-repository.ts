import "server-only";
import { getDatabase } from "@/lib/db";

type OrderItemInput = { menuItemId: string; quantity: number };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class InvalidOrderError extends Error {}

export async function createOrder(tableId: unknown, items: unknown): Promise<string> {
  if (typeof tableId !== "string" || !uuidPattern.test(tableId)) {
    throw new InvalidOrderError("A valid table is required.");
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new InvalidOrderError("Add at least one menu item.");
  }
  const orderItems: OrderItemInput[] = items.map((item: unknown) => {
    if (typeof item !== "object" || item === null) throw new InvalidOrderError("Invalid menu item.");
    const entry = item as Record<string, unknown>;
    if (typeof entry.menuItemId !== "string" || !uuidPattern.test(entry.menuItemId)
      || typeof entry.quantity !== "number" || !Number.isSafeInteger(entry.quantity) || entry.quantity <= 0) {
      throw new InvalidOrderError("Menu items need a valid ID and a positive whole quantity.");
    }
    return { menuItemId: entry.menuItemId, quantity: entry.quantity };
  });
  try {
    const result = await getDatabase().query<{ id: string }>(
      "SELECT public.place_order($1::uuid, $2::jsonb) AS id",
      [tableId, JSON.stringify(orderItems.map(item => ({ menu_item_id: item.menuItemId, quantity: item.quantity })))],
    );
    return result.rows[0].id;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code && ["P0001", "23503", "23514", "23502", "22P02", "22003"].includes(code)) {
      throw new InvalidOrderError("The order could not be placed. Check the table, quantities and menu availability.");
    }
    throw error;
  }
}
