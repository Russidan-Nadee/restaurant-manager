"use client";

import { useActionState } from "react";
import { Check, UtensilsCrossed } from "lucide-react";
import type { FoodWorkItem, WorkflowActionState } from "@/lib/workflow-types";
import { advanceFoodAction } from "@/app/actions/workflow";
import styles from "./page.module.css";

const initialActionState: WorkflowActionState = { success: false, message: "" };

function FoodLine({ item }: { item: FoodWorkItem }) {
  const [state, formAction, pending] = useActionState(advanceFoodAction, initialActionState);
  const canAdvance = Boolean(item.nextStatusId && item.nextStatusLabel);
  const options = [item.protein, item.isSpecial ? "พิเศษ" : null].filter(Boolean).join(" · ");

  return (
    <li className={styles.item}>
      <div className={styles.itemMain}>
        <span className={styles.tableCode}>{item.tableCode}</span>
        <div className={styles.itemCopy}>
          <h2>{item.name}</h2>
          {options && <p>{options}</p>}
        </div>
      </div>
      <div className={styles.itemQuantity}>
        <span>จำนวน</span>
        <strong>{item.quantity}</strong>
      </div>
      <div className={styles.itemStatus}>
        <span className={styles.statusLabel}>{item.statusLabel}</span>
        {item.nextStatusLabel && <span className={styles.nextLabel}>ถัดไป: {item.nextStatusLabel}</span>}
      </div>
      {canAdvance ? (
        <form action={formAction} className={styles.actionForm} aria-busy={pending}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="expected_status_id" value={item.statusId} />
          <input type="hidden" name="target_status_id" value={item.nextStatusId ?? ""} />
          <button type="submit" className={styles.actionButton} disabled={pending}>

            {pending ? "กำลังบันทึก" : item.nextStatusLabel}
</button>
        </form>
      ) : (
        <span className={styles.terminalLabel}><Check size={17} strokeWidth={1.75} aria-hidden="true" />สถานะสุดท้าย</span>
      )}
      {state.message && <p className={state.success ? styles.actionSuccess : styles.actionError} role={state.success ? "status" : "alert"}>{state.message}</p>}
    </li>
  );
}

export default function KitchenBoard({ items }: { items: FoodWorkItem[] }) {
  if (items.length === 0) {
    return (
      <div className={styles.empty} role="status">
        <UtensilsCrossed size={24} strokeWidth={1.75} aria-hidden="true" />
        <p>ยังไม่มีรายการอาหารที่ต้องดำเนินการ</p>
      </div>
    );
  }

  return (
    <ul className={styles.board} aria-label="รายการอาหารในครัว">
      {items.map((item) => <FoodLine key={item.id} item={item} />)}
    </ul>
  );
}
