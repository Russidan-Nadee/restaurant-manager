import type { ProteinId } from "@/lib/menu-options";

export type AdminMenuItem = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  is_active: boolean;
  image_url: string | null;
  protein_options: ProteinId[];
  special_available: boolean;
};

export type MenuActionState = { success: boolean; message: string };
