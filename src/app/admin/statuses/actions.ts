"use server";

import { revalidatePath } from "next/cache";

import {
  addWorkflowStatus,
  moveWorkflowStatus,
  removeWorkflowStatus,
  WorkflowInputError,
} from "@/lib/workflow-status-management";
import type { WorkflowActionState } from "@/lib/workflow-types";

function refreshWorkflowPages(): void {
  revalidatePath("/admin/statuses");
  revalidatePath("/admin");
  revalidatePath("/kitchen");
  revalidatePath("/cashier");
}

export async function addStatusAction(
  _previous: WorkflowActionState,
  form: FormData,
): Promise<WorkflowActionState> {
  try {
    await addWorkflowStatus(form);
  } catch (error) {
    if (error instanceof WorkflowInputError) return { success: false, message: error.message };
    console.error("Unable to add a workflow status.");
    return { success: false, message: "เพิ่มสถานะไม่ได้ กรุณาลองอีกครั้ง" };
  }
  refreshWorkflowPages();
  return { success: true, message: "เพิ่มสถานะแล้ว" };
}

export async function removeStatusAction(
  _previous: WorkflowActionState,
  form: FormData,
): Promise<WorkflowActionState> {
  try {
    await removeWorkflowStatus(form);
  } catch (error) {
    if (error instanceof WorkflowInputError) return { success: false, message: error.message };
    console.error("Unable to remove a workflow status.");
    return { success: false, message: "ลบสถานะไม่ได้ กรุณาลองอีกครั้ง" };
  }
  refreshWorkflowPages();
  return { success: true, message: "ลบสถานะแล้ว" };
}

export async function moveStatusAction(
  _previous: WorkflowActionState,
  form: FormData,
): Promise<WorkflowActionState> {
  try {
    await moveWorkflowStatus(form);
  } catch (error) {
    if (error instanceof WorkflowInputError) return { success: false, message: error.message };
    console.error("Unable to move a workflow status.");
    return { success: false, message: "จัดลำดับสถานะไม่ได้ กรุณาลองอีกครั้ง" };
  }
  refreshWorkflowPages();
  return { success: true, message: "จัดลำดับสถานะแล้ว" };
}
