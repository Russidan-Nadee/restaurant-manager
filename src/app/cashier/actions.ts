"use server";

import { revalidatePath } from "next/cache";

import { checkoutTable } from "@/lib/table-payments";
import { WorkflowInputError } from "@/lib/workflow-status-management";
import type { WorkflowActionState } from "@/lib/workflow-types";

function refreshCashierPages(): void {
  revalidatePath("/cashier");
  revalidatePath("/kitchen");
  revalidatePath("/admin");
  revalidatePath("/admin/statuses");
  revalidatePath("/admin/tables");
  revalidatePath("/order", "layout");
}

export async function checkoutTableAction(
  _previous: WorkflowActionState,
  form: FormData,
): Promise<WorkflowActionState> {
  try {
    await checkoutTable(form);
  } catch (error) {
    if (error instanceof WorkflowInputError) return { success: false, message: error.message };
    console.error("Unable to complete a table checkout.");
    return { success: false, message: "รับชำระเงินไม่ได้ กรุณาลองอีกครั้ง" };
  }
  refreshCashierPages();
  return { success: true, message: "รับชำระเงินและปิดโต๊ะแล้ว" };
}
