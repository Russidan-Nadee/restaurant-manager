"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { getProteinLabel } from "@/lib/menu-options";
import type { CartItem } from "@/lib/types";
import styles from "./page.module.css";

const formatMoney = (cents: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(cents / 100);

export default function OrderReviewDialog({ tableNumber, items, submitting, error, trigger, onClose, onConfirm, preview = false }: {
  tableNumber: string;
  preview?: boolean;
  items: CartItem[];
  submitting: boolean;
  error: string;
  trigger: HTMLButtonElement | null;

  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      const target = trigger?.isConnected && !trigger.disabled ? trigger : document.querySelector<HTMLElement>("[data-order-summary]");
      if (target?.isConnected) target.focus({ preventScroll: true });
    };
  }, [trigger]);

  return <dialog ref={dialogRef} className={styles.reviewDialog} aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); if (!submitting) onClose(); }}
    onClick={event => {
      if (submitting || event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
    <header className={styles.reviewHeader}>
      <div>
        <p>โต๊ะ {tableNumber}</p>
        <h2 id={titleId}>ตรวจสอบออร์เดอร์</h2>
        <p id={descriptionId}>{preview ? "ทวนรายการตัวอย่าง ไม่มีการส่งออร์เดอร์จริง" : "ทวนรายการก่อนส่งเข้าครัว"}</p>
      </div>
      <button type="button" className={styles.reviewClose} disabled={submitting} onClick={onClose} aria-label="ปิดสรุปออร์เดอร์">
        <X size={22} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </header>
    <div className={styles.reviewBody}>
      <div className={styles.reviewColumns} aria-hidden="true"><span>รายการอาหาร</span><span>จำนวน</span><span>รวม</span></div>
      <ul className={styles.reviewList} aria-label={preview ? "รายการตัวอย่างที่เลือก" : "รายการที่จะส่งเข้าครัว"}>
        {items.map(item => {
          const options = [getProteinLabel(item.protein), item.isSpecial ? "พิเศษ" : "ธรรมดา"].filter(Boolean).join(" · ");
          return <li key={JSON.stringify([item.menuItemId, item.protein ?? null, item.isSpecial === true])} className={styles.reviewLine}>
            <div className={styles.reviewDish}>
              <h3>{item.name}</h3>
              <p>{options}</p>
              <span>{formatMoney(Math.round(item.price * 100))} / ที่</span>
            </div>
            <span className={styles.reviewQuantity} aria-label={"จำนวน " + item.quantity}>{item.quantity}</span>
            <strong className={styles.reviewAmount}>{formatMoney(Math.round(item.price * 100) * item.quantity)}</strong>
          </li>;
        })}
      </ul>
    </div>
    <footer className={styles.reviewFooter} aria-busy={submitting}>
      <div className={styles.reviewTotal}><div><span>ยอดรวม</span><small>{itemCount} ที่ · {items.length} รายการ</small></div><strong>{formatMoney(totalCents)}</strong></div>
      {error && <p className={styles.dialogError} role="alert">{error}</p>}
      {submitting && <p className={styles.reviewProgress} role="status">กำลังส่งออร์เดอร์เข้าครัว</p>}
      <div className={styles.reviewActions}>
        <button type="button" className={styles.reviewBack} autoFocus disabled={submitting} onClick={onClose}>กลับไปแก้ไข</button>
        <button type="button" className={styles.submit} disabled={submitting} onClick={onConfirm}>{submitting ? "กำลังส่งออร์เดอร์" : "ยืนยันส่งออร์เดอร์"}</button>
      </div>
    </footer>
  </dialog>;
}
