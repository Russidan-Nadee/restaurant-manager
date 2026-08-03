import { getBrowserSupabase } from "@/lib/supabase/client";
import type { CartItem } from "@/lib/types";

export async function placeOrder(tableId: string, items: CartItem[]) {
  const supabase = getBrowserSupabase();
  const { data, error } = await supabase.rpc("place_order", {
    p_table_id: tableId,
    p_items: items.map((item) => ({
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
    })),
  });

  if (error) throw new Error(error.message);
  return data as string;
}
