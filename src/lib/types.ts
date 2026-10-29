import type { ProteinId } from "@/lib/menu-options";

export type RestaurantTable = {
  id: string;
  name: string;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type MenuItem = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  protein_options: ProteinId[];
  special_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  table_id: string;
  status: string;
  total_amount: number;
  note: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name_snapshot: string;
  price_snapshot: number;
  protein_snapshot: string | null;
  is_special: boolean;
  special_price_snapshot: number;
  quantity: number;
  subtotal: number;
  created_at: string;
};

export type OrderWithItems = Order & { order_items: OrderItem[] };

export type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  protein?: ProteinId | null;
  isSpecial?: boolean;
};
