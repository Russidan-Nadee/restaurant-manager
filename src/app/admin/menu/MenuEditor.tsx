"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { saveMenuAction } from "./actions";
import type { AdminMenuItem, MenuActionState } from "./types";
import styles from "./menu.module.css";

const initialState: MenuActionState = { success: false, message: "" };

export default function MenuEditor({ item, onClose }: { item: AdminMenuItem | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [state, save, pending] = useActionState(saveMenuAction, initialState);
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? item.price.toFixed(2) : "");
  const [active, setActive] = useState(item?.is_active ?? true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const imageUrl = preview || (removeImage ? null : item?.image_url);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    if (state.success) dialogRef.current?.querySelector<HTMLButtonElement>("[data-dialog-done]")?.focus();
  }, [state.success]);

  function selectImage(file: File | undefined) {
    setImageError("");
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024 || file.size === 0) {
      setImageError("เลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 3 MB");
      if (fileRef.current) fileRef.current.value = "";
      setSelectedFile(null);
      setPreview("");
      return;
    }
    setSelectedFile(file);
    setRemoveImage(false);
    setPreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setSelectedFile(null);
    setPreview("");
    setImageError("");
    setRemoveImage(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId} aria-modal="true"
      onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }}
      onClick={(event) => {
        if (pending || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}>
      <header className={styles.dialogHeader}>
        <h2 id={titleId}>{item ? "แก้ไขเมนู" : "เพิ่มเมนู"}</h2>
        <button type="button" className={styles.dialogClose} disabled={pending} aria-label="ปิดหน้าต่าง" onClick={onClose}>
          <X size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </header>
      {state.success ? (
    <div className={styles.editor}>
      <p role="status" className={styles.success}>{state.message}</p>
      <button data-dialog-done type="button" className={styles.primary} onClick={onClose}>เสร็จสิ้น</button>
    </div>
  ) : (
    <form className={styles.editor} action={(form) => {
      if (selectedFile) form.set("image", selectedFile);
      else form.delete("image");
      save(form);
    }} aria-label={item ? "แก้ไขเมนู" : "เพิ่มเมนู"} aria-busy={pending}>
      <fieldset disabled={pending}>
        <input type="hidden" name="id" value={item?.id ?? ""} />
        <div className={styles.fields}>
          <label className={styles.fullWidth}>ชื่อเมนู
            <input autoFocus name="name" value={name} onChange={event => setName(event.target.value)} required maxLength={200} />
          </label>
          <label className={styles.fullWidth}>รายละเอียด
            <textarea name="description" value={description} onChange={event => setDescription(event.target.value)} maxLength={2000} rows={3} />
          </label>
          <label>ราคา (บาท)
            <input name="price" type="number" inputMode="decimal" min="0" max="99999999.99" step="0.01" value={price} onChange={event => setPrice(event.target.value)} required />
          </label>
          <label className={styles.checkbox}>
            <input name="is_active" type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} />เปิดขาย
          </label>
          <div className={styles.fullWidth}>
            <label className={styles.fileLabel}>ภาพเมนู (ไม่บังคับ)
              <input ref={fileRef} name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => selectImage(event.target.files?.[0])} />
            </label>
            <p className={styles.hint}>ข้ามได้และเพิ่มรูปภายหลัง รองรับ JPG, PNG หรือ WebP ไม่เกิน 3 MB</p>
            <input type="hidden" name="remove_image" value={removeImage ? "on" : ""} disabled={!removeImage} />
            {imageUrl && <div className={styles.imageSelection}>
              <Image src={imageUrl} alt={name || "ภาพเมนูที่เลือก"} width={160} height={120} unoptimized className={styles.preview} />
              <button type="button" className={styles.secondary} onClick={clearImage}>ลบรูป</button>
            </div>}
            {removeImage && item?.image_url && <p className={styles.hint}>รูปเดิมจะถูกลบเมื่อกดบันทึก <button type="button" className={styles.textButton} onClick={() => setRemoveImage(false)}>คืนรูปเดิม</button></p>}
          </div>
        </div>
        {imageError && <p role="alert" className={styles.error}>{imageError} <button type="button" className={styles.textButton} onClick={() => setImageError("")}>ไม่ใช้รูปที่เลือก</button></p>}
        {state.message && <p role="alert" className={styles.error}>{state.message}</p>}
        <div className={styles.formActions}>
          <button type="submit" className={styles.primary} disabled={Boolean(imageError)}>{pending ? "กำลังบันทึก…" : "บันทึกเมนู"}</button>
          <button type="button" className={styles.secondary} onClick={onClose}>ยกเลิก</button>
        </div>
      </fieldset>
    </form>
      )}
    </dialog>
  );
}
