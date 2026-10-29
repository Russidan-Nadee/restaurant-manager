import type { ProteinId } from "@/lib/menu-options";

export type DiningTable = { id: string; name: string };
export type CustomerMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  proteinOptions: ProteinId[];
  specialAvailable: boolean;
};
