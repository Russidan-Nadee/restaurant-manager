export const PROTEIN_OPTIONS = [
  { id: "chicken", label: "ไก่" },
  { id: "pork", label: "หมู" },
  { id: "beef", label: "เนื้อ" },
  { id: "shrimp", label: "กุ้ง" },
  { id: "squid", label: "หมึก" },
] as const;

export type ProteinId = (typeof PROTEIN_OPTIONS)[number]["id"];

export const SPECIAL_PRICE = 10;

export function isProteinId(value: unknown): value is ProteinId {
  return PROTEIN_OPTIONS.some(option => option.id === value);
}

export function getProteinLabel(value: string | null | undefined): string | null {
  return PROTEIN_OPTIONS.find(option => option.id === value)?.label ?? null;
}
