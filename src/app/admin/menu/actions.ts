"use server";

import { revalidatePath } from "next/cache";
import { MenuInputError, parseMenuInput, saveMenuRecord, setMenuAvailability } from "@/lib/menu-management";
import { deleteMenuImage, uploadMenuImage } from "@/lib/menu-images";
import type { MenuActionState } from "./types";

function refreshMenuPages() {
  revalidatePath("/admin/menu");
  revalidatePath("/admin");
  revalidatePath("/order", "layout");
}

async function cleanUpImage(key: string | null): Promise<boolean> {
  try { await deleteMenuImage(key); return true; }
  catch { console.error("Unable to remove an unused menu image from storage."); return false; }
}

export async function saveMenuAction(_previous: MenuActionState, form: FormData): Promise<MenuActionState> {
  let uploadedKey: string | null = null;
  let previousImageUrl: string | null;
  try {
    const input = parseMenuInput(form);
    const imageEntry = form.get("image");
    const image = imageEntry === "" || (imageEntry instanceof File && imageEntry.size === 0 && imageEntry.name === "") ? null : imageEntry;
    const removeImage = form.get("remove_image");
    if (image !== null && !(image instanceof File)) throw new MenuInputError("ข้อมูลรูปภาพไม่ถูกต้อง");
    if (removeImage !== null && removeImage !== "on") throw new MenuInputError("ข้อมูลรูปภาพไม่ถูกต้อง");
    if (image instanceof File) {
      if (image.size === 0) throw new MenuInputError("ไฟล์รูปภาพว่าง กรุณาเลือกรูปใหม่หรือข้ามการเพิ่มรูป");
      uploadedKey = await uploadMenuImage(image);
    }
    const saved = await saveMenuRecord(input, { replace: uploadedKey !== null || removeImage === "on", url: uploadedKey });
    previousImageUrl = saved.previousImageUrl;
  } catch (error) {
    if (uploadedKey) await cleanUpImage(uploadedKey);
    if (error instanceof MenuInputError) return { success: false, message: error.message };
    console.error("Unable to save a menu item.");
    return { success: false, message: "บันทึกเมนูไม่ได้ กรุณาลองอีกครั้ง" };
  }
  const cleaned = await cleanUpImage(previousImageUrl);
  refreshMenuPages();
  return { success: true, message: cleaned ? "บันทึกเมนูแล้ว" : "บันทึกเมนูแล้ว แต่ลบไฟล์รูปเดิมไม่สำเร็จ" };
}

export async function setMenuAvailabilityAction(_previous: MenuActionState, form: FormData): Promise<MenuActionState> {
  try {
    const id = form.get("id");
    const active = form.get("active");
    if (typeof id !== "string" || (active !== "true" && active !== "false")) throw new MenuInputError("ข้อมูลเมนูไม่ถูกต้อง");
    await setMenuAvailability(id, active === "true");
  } catch (error) {
    if (error instanceof MenuInputError) return { success: false, message: error.message };
    console.error("Unable to change menu availability.");
    return { success: false, message: "เปลี่ยนสถานะไม่ได้ กรุณาลองอีกครั้ง" };
  }
  refreshMenuPages();
  return { success: true, message: "เปลี่ยนสถานะแล้ว" };
}
