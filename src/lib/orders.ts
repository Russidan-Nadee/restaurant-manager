import type { CartItem } from "@/lib/types";

export async function placeOrder(tableId: string, items: CartItem[]): Promise<string> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tableId,
      items: items.map(item => ({ menuItemId: item.menuItemId, quantity: item.quantity })),
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to place the order.");
  return result.id as string;
}
