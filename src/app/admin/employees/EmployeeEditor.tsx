"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Employee, EmployeeDraft } from "./types";
import styles from "./employees.module.css";

export default function EmployeeEditor({ employee, onSave, onClose }: { employee: Employee | null; onSave: (draft: EmployeeDraft) => void; onClose: () => void }) {
  const [name, setName] = useState(employee?.name ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [jobTitle, setJobTitle] = useState(employee?.job_title ?? "");
  const [active, setActive] = useState(employee?.is_active ?? true);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  return <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
    <header className={styles.dialogHeader}>
      <h2 id={titleId}>{employee ? "แก้ไขพนักงาน" : "เพิ่มพนักงาน"}</h2>
      <button type="button" className={styles.closeButton} onClick={onClose} aria-label="ปิดหน้าต่างพนักงาน"><X size={20} strokeWidth={1.75} aria-hidden="true" /></button>
    </header>
    <form className={styles.editorForm} onSubmit={event => {
      event.preventDefault();
      if (!name.trim() || name.trim().length > 200 || phone.trim().length > 50 || jobTitle.trim().length > 100) {
        setError("กรอกชื่อพนักงาน และตรวจสอบความยาวข้อมูลให้ถูกต้อง");
        return;
      }
      onSave({ name: name.trim(), phone: phone.trim() || null, job_title: jobTitle.trim() || null, is_active: active });
    }}>
      <div className={styles.editorBody}>
        <fieldset className={styles.fields}>
          <label className={styles.fullWidth}>ชื่อพนักงาน (จำเป็น)
            <input autoFocus value={name} onChange={event => setName(event.target.value)} required maxLength={200} autoComplete="off" />
          </label>
          <label>เบอร์โทร <span className={styles.optional}>ไม่บังคับ</span>
            <input type="tel" inputMode="tel" value={phone} onChange={event => setPhone(event.target.value)} maxLength={50} autoComplete="off" />
          </label>
          <label>ตำแหน่ง <span className={styles.optional}>ไม่บังคับ</span>
            <input value={jobTitle} onChange={event => setJobTitle(event.target.value)} maxLength={100} autoComplete="off" />
          </label>
          <label className={[styles.availability, styles.fullWidth].join(" ")}>
            <input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} /><span>ทำงานอยู่</span>
          </label>
        </fieldset>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
      <footer className={styles.editorFooter}>
        <button type="button" className={styles.secondary} onClick={onClose}>ยกเลิก</button>
        <button type="submit" className={styles.primary}>บันทึกตัวอย่าง</button>
      </footer>
    </form>
  </dialog>;
}
