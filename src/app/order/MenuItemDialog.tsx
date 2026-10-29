"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { PROTEIN_OPTIONS, SPECIAL_PRICE, type ProteinId } from "@/lib/menu-options";
import type { CustomerMenuItem } from "./types";
import MenuItemImage from "./MenuItemImage";
import styles from "./page.module.css";

export const MAX_ITEM_QUANTITY = 2_147_483_647;
const formatMoney = (cents: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(cents / 100);

export default function MenuItemDialog({ item, trigger, disabled, onClose, onConfirm }: {
  item: CustomerMenuItem;
  trigger: HTMLButtonElement | null;
  disabled: boolean;
  onClose: () => void;
  onConfirm: (protein: ProteinId | null, isSpecial: boolean, quantity: number) => string | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const proteinName = useId();
  const [protein, setProtein] = useState<ProteinId | null>(null);
  const [isSpecial, setIsSpecial] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const proteinOptions = PROTEIN_OPTIONS.filter(option => item.proteinOptions.includes(option.id));
  const needsProtein = proteinOptions.length > 0;
  const unitCents = Math.round(item.price * 100) + (isSpecial ? SPECIAL_PRICE * 100 : 0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const returnFocusTo = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (returnFocusTo?.isConnected) returnFocusTo.focus({ preventScroll: true });
    };
  }, [trigger]);

  function confirm() {
    if (disabled || (needsProtein && !protein)) return;
    setError(onConfirm(protein, isSpecial, quantity) ?? "");
  }

  return (
    <dialog ref={dialogRef} className={styles.itemDialog} aria-labelledby={titleId} onCancel={event => {
      event.preventDefault();
      if (!disabled) onClose();
    }} onClick={event => {
      if (event.target !== event.currentTarget || disabled) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
      <div className={styles.dialogContent}>
      <div className={styles.dialogMedia}>
        <MenuItemImage imageUrl={item.imageUrl} name={item.name} />
        <button type="button" className={styles.dialogClose} aria-label="ปิดหน้าต่างเลือกอาหาร" autoFocus disabled={disabled} onClick={onClose}>
          <X size={22} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
      <div className={styles.dialogBody}>
        <div className={styles.dialogHeading}>
          <h2 id={titleId}>{item.name}</h2>
          <span className={styles.price}>{formatMoney(Math.round(item.price * 100))}</span>
        </div>
        {item.description && <p className={styles.dialogDescription}>{item.description}</p>}

        {needsProtein && <fieldset className={styles.optionGroup} disabled={disabled}>
          <legend>เลือกเนื้อสัตว์ <span>จำเป็นต้องเลือก 1 อย่าง</span></legend>
          <div className={styles.proteinOptions}>
            {proteinOptions.map(option => <label key={option.id} className={styles.optionChoice}>
              <input type="radio" name={proteinName} value={option.id} checked={protein === option.id} required onChange={() => { setProtein(option.id); setError(""); }} />
              <span>{option.label}</span>
            </label>)}
          </div>
        </fieldset>}

        {item.specialAvailable && <fieldset className={styles.optionGroup} disabled={disabled}>
          <legend>เพิ่มพิเศษ</legend>
          <label className={styles.specialChoice}>
            <input type="checkbox" checked={isSpecial} onChange={event => { setIsSpecial(event.target.checked); setError(""); }} />
            <span>พิเศษ</span>
            <strong>+{formatMoney(SPECIAL_PRICE * 100)} / จาน</strong>
          </label>
        </fieldset>}

        <div className={styles.dialogQuantity}>
          <span>จำนวน</span>
          <div className={styles.quantityControl}>
            <button type="button" className={styles.quantityButton} aria-label="ลดจำนวนอาหาร" disabled={disabled || quantity <= 1} onClick={() => { setQuantity(current => Math.max(1, current - 1)); setError(""); }}>
              <Minus size={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <output className={styles.quantityValue} aria-label="จำนวนอาหาร" aria-live="polite">{quantity}</output>
            <button type="button" className={styles.quantityButton} aria-label="เพิ่มจำนวนอาหาร" disabled={disabled || quantity >= MAX_ITEM_QUANTITY} onClick={() => { setQuantity(current => Math.min(MAX_ITEM_QUANTITY, current + 1)); setError(""); }}>
              <Plus size={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      </div>
      <div className={styles.dialogFooter}>
        {needsProtein && !protein && <p className={styles.optionHint}>กรุณาเลือกเนื้อสัตว์ก่อนเพิ่มลงตะกร้า</p>}
        {error && <p className={styles.dialogError} role="alert">{error}</p>}
        <button type="button" className={styles.confirmItem} disabled={disabled || (needsProtein && !protein)} onClick={confirm}>
          <span>เพิ่มลงตะกร้า</span>
          <strong>{formatMoney(unitCents * quantity)}</strong>
        </button>
      </div>
    </dialog>
  );
}
