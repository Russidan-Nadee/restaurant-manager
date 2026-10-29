"use server";

import { revalidatePath } from "next/cache";
import { retireDiningTable, saveDiningTable, TableInputError } from "@/lib/table-management";
import type { TableActionState } from "./types";

function refreshTablePages() {
  revalidatePath("/admin/tables");
  revalidatePath("/admin");
  revalidatePath("/order", "layout");
  revalidatePath("/cashier");
}

export async function saveTableAction(_previous: TableActionState, form: FormData): Promise<TableActionState> {
  let code: string;
  try { code = await saveDiningTable(form); }
  catch (error) {
    if (error instanceof TableInputError) return { success: false, message: error.message };
    console.error("Unable to save a dining table.");
    return { success: false, message: "บันทึกโต๊ะไม่ได้ กรุณาลองอีกครั้ง" };
  }
  refreshTablePages();
  return { success: true, message: "บันทึกโต๊ะ " + code + " แล้ว" };
}

export async function retireTableAction(_previous: TableActionState, form: FormData): Promise<TableActionState> {
  let code: string;
  try { code = await retireDiningTable(form); }
  catch (error) {
    if (error instanceof TableInputError) return { success: false, message: error.message };
    console.error("Unable to retire a dining table.");
    return { success: false, message: "ลบโต๊ะไม่ได้ กรุณาลองอีกครั้ง" };
  }
  refreshTablePages();
  return { success: true, message: "ลบโต๊ะ " + code + " ออกจากรายการแล้ว" };
}
