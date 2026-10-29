"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { retireTableAction, saveTableAction } from "./actions";
import type { AdminDiningTable, TableActionState } from "./types";
import styles from "./tables.module.css";

const initialState: TableActionState = { success: false, message: "" };

export default function TableEditor({ table, mode, onClose }: {
  table: AdminDiningTable | null; mode: "save" | "delete"; onClose: () => void;
}) {
  const removing = mode === "delete";
  const [state, submit, pending] = useActionState(removing ? retireTableAction : saveTableAction, initialState);
  const [displayName, setDisplayName] = useState(table?.displayName ?? "");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const title = removing ? "ลบโต๊ะ " + table?.name : table ? "ตั้งชื่อโต๊ะ " + table.name : "เพิ่มโต๊ะ";

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
    if (state.success) dialogRef.current?.querySelector<HTMLButtonElement>("[data-table-done]")?.focus();
  }, [state.success]);

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId} aria-modal="true"
      onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }}
      onClick={(event) => {
        if (pending || event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}>
      <header className={styles.dialogHeader}>
        <h2 id={titleId}>{title}</h2>
        <button type="button" className={styles.close} disabled={pending} aria-label="ปิดหน้าต่าง" onClick={onClose}><X size={20} aria-hidden="true" /></button>
      </header>
      {state.success ? <div className={styles.dialogBody}>
        <p className={styles.formMessage} role="status">{state.message}</p>
        <button data-table-done type="button" className={styles.primary} onClick={onClose}>เสร็จสิ้น</button>
      </div> : <form action={submit} className={styles.dialogBody} aria-busy={pending}>
        <fieldset className={styles.formFields} disabled={pending}>
          <input type="hidden" name="id" value={table?.id ?? ""} />
          {removing ? <p className={styles.formMessage}>โต๊ะ {table?.name} จะถูกซ่อนออกจากรายการและ QR เดิมจะใช้สั่งอาหารไม่ได้ ประวัติออร์เดอร์ยังอยู่ หากมีออร์เดอร์ค้างจะลบโต๊ะไม่ได้</p> : <>
            <label className={styles.urlField}>ชื่อโต๊ะ (ไม่บังคับ)
              <input autoFocus type="text" name="display_name" value={displayName} placeholder={table?.name ?? "เลขโต๊ะอัตโนมัติ"}
                maxLength={100} onChange={(event) => setDisplayName(event.target.value)} />
            </label>
            <p className={styles.formHint}>ชื่อใช้เฉพาะใน admin ลูกค้าเห็นเลขโต๊ะเท่านั้น{table ? " และ QR เดิมยังใช้ได้" : " เลขโต๊ะใหม่จะกำหนดให้อัตโนมัติ"}</p>
          </>}
          {state.message && <p className={styles.formError} role="alert">{state.message}</p>}
          <div className={styles.dialogActions}>
            <button type="button" className={styles.secondary} autoFocus={removing} onClick={onClose}>ยกเลิก</button>
            <button type="submit" className={styles.primary}>{pending ? "กำลังบันทึก…" : removing ? "ลบโต๊ะ" : table ? "บันทึกชื่อ" : "เพิ่มโต๊ะ"}</button>
          </div>
        </fieldset>
      </form>}
    </dialog>
  );
}
