export type AdminMenuItem = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  is_active: boolean;
  image_url: string | null;
};

export type MenuActionState = { success: boolean; message: string };
