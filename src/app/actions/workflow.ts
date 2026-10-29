"use server";

import { revalidatePath } from "next/cache";
import { advanceFood, advanceTable } from "@/lib/workflow-runtime";
import { WorkflowInputError } from "@/lib/workflow-status-management";
import type { WorkflowActionState } from "@/lib/workflow-types";

async function change(operation: (form: FormData) => Promise<void>, form: FormData): Promise<WorkflowActionState> {
  try { await operation(form); }
  catch (error) {
    if (error instanceof WorkflowInputError) return { success: false, message: error.message };
    console.error("Unable to advance a restaurant workflow.");
    return { success: false, message: "เปลี่ยนสถานะไม่ได้ กรุณาลองอีกครั้ง" };
  }
  for (const route of ["/admin", "/admin/statuses", "/admin/tables", "/kitchen", "/cashier"]) revalidatePath(route);
  revalidatePath("/order", "layout");
  return { success: true, message: "เปลี่ยนสถานะแล้ว" };
}
export async function advanceFoodAction(_previous: WorkflowActionState, form: FormData): Promise<WorkflowActionState> {
  return change(advanceFood, form);
}
export async function advanceTableAction(_previous: WorkflowActionState, form: FormData): Promise<WorkflowActionState> {
  return change(advanceTable, form);
}
