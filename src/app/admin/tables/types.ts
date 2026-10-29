import type { DiningTable } from "@/app/order/types";

export type AdminDiningTable = DiningTable & { displayName: string | null };
export type TableActionState = { success: boolean; message: string };
