"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Wallet, X } from "lucide-react";
import type { FoodWorkItem, ServiceTable, WorkflowActionState } from "@/lib/workflow-types";
import { advanceTableAction } from "@/app/actions/workflow";
import { checkoutTableAction } from "./actions";
import { formatAmount } from "./format";
import styles from "./page.module.css";

const initialAction: WorkflowActionState = { success: false, message: "" };
type Review = { sessionId: string; stateToken: string; amount: string; key: string };
type PaymentFeedback = WorkflowActionState & { reviewKey: string };
const initialPayment: PaymentFeedback = { ...initialAction, reviewKey: "" };

function BillLine({ item }: { item: FoodWorkItem }) {
  const options = [item.protein, item.isSpecial ? "พิเศษ" : null].filter(Boolean).join(" · ");
  return <li className={styles.receiptLine}>
    <div className={styles.receiptDish}>
      <strong>{item.name}</strong>
      {options && <span className={styles.receiptOptions}>{options}</span>}
      <span className={styles.receiptStatus}>{item.statusLabel}</span>
    </div>
    <span className={styles.receiptQuantity} aria-label={"จำนวน " + item.quantity}>{item.quantity}</span>
    <span className={styles.receiptAmount}>{formatAmount(item.lineTotal)}</span>
  </li>;
}

export default function TableServiceDialog({ table, onClose }: { table: ServiceTable; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const hintId = useId();
  const [review, setReview] = useState<Review | null>(null);
  const [tableState, changeTable, changingTable] = useActionState(advanceTableAction, initialAction);
  const [payment, pay, paying] = useActionState(async (_previous: PaymentFeedback, form: FormData): Promise<PaymentFeedback> => {
    const reviewKey = String(form.get("review_key") ?? "");
    try { return { ...await checkoutTableAction(initialAction, form), reviewKey }; }
    catch { return { success: false, message: "ยืนยันผลรับชำระเงินไม่ได้ กรุณาตรวจสอบสถานะโต๊ะก่อนลองใหม่", reviewKey }; }
  }, initialPayment);
  const pending = paying || changingTable;
  const succeeded = payment.success;
  const staleReview = review !== null && (table.sessionId !== review.sessionId || table.stateToken !== review.stateToken || table.totalAmount !== review.amount);
  const unfinished = table.items.filter(item => item.nextStatusId !== null).length;
  const canPay = table.occupied && table.canAdvance && table.sessionId !== null;
  const canChangeTable = table.occupied && table.nextStatusLabel !== "ว่าง";
  const displayedAmount = review?.amount ?? table.totalAmount;
  const paymentError = review && payment.reviewKey === review.key && !payment.success ? payment.message : "";

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
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected && !previousFocus.matches(":disabled")) {
        previousFocus.focus({ preventScroll: true });
      } else {
        document.querySelector<HTMLElement>("[data-cashier-floor]")?.focus({ preventScroll: true });
      }
    };
  }, []);

  useEffect(() => {
    if (succeeded) dialogRef.current?.querySelector<HTMLButtonElement>("[data-payment-done]")?.focus();
    else if (review) dialogRef.current?.querySelector<HTMLElement>("[data-review-hint]")?.focus();
  }, [review, succeeded]);

  function startReview() {
    if (pending || !canPay || !table.sessionId) return;
    setReview({ sessionId: table.sessionId, stateToken: table.stateToken, amount: table.totalAmount,
      key: JSON.stringify([table.sessionId, table.stateToken, table.totalAmount]) });
  }

  return <dialog ref={dialogRef} className={styles.serviceDialog} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}
    onClick={event => {
      if (pending || event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
    <header className={styles.serviceHeader}>
      <h2 id={titleId}>โต๊ะ <span>{table.name}</span></h2>
      <button type="button" className={styles.serviceClose} disabled={pending} onClick={onClose} aria-label="ปิดบิลโต๊ะ"><X size={21} strokeWidth={1.75} aria-hidden="true" /></button>
    </header>

    <div className={styles.serviceScroll}>
      {succeeded ? <div className={styles.paymentSuccess} role="status">
        <span className={styles.successMark}><Check size={28} strokeWidth={1.75} aria-hidden="true" /></span>
        <h3>รับชำระเงินแล้ว</h3>
        <p>บันทึกยอดและปิดรอบลูกค้าเรียบร้อย</p>
      </div> : <section aria-label="รายการอาหารในบิล">
        <div className={styles.receiptHeading}><h3>รายการอาหาร</h3><span>{table.items.length} รายการ</span></div>
        {table.items.length > 0 ? <>
          <div className={styles.receiptColumns} aria-hidden="true"><span>รายการ</span><span>จำนวน</span><span>รวม</span></div>
          <ol className={styles.receiptList}>{table.items.map(item => <BillLine key={item.id} item={item} />)}</ol>
        </> : <p className={styles.receiptEmpty}>{table.occupied ? "ยังไม่มีรายการอาหาร" : "รอบลูกค้านี้ปิดแล้ว"}</p>}
      </section>}
    </div>

    <footer className={styles.serviceFooter}>
      <div className={styles.receiptTotal}><span>{succeeded ? "รับชำระแล้ว" : "ยอดรวม"}</span><strong>{formatAmount(displayedAmount)}</strong></div>
      {succeeded ? <button data-payment-done type="button" className={styles.servicePrimary} onClick={onClose}>กลับไปหน้าโต๊ะ</button> : <>
        {review ? <p id={hintId} data-review-hint tabIndex={-1} className={styles.reviewHint}>
          {staleReview ? "ยอดหรือรอบลูกค้าเปลี่ยนไป กรุณากลับไปตรวจรายการอีกครั้ง" : "ยืนยันเมื่อได้รับเงินครบแล้ว โต๊ะจะเปลี่ยนเป็นว่าง"}
        </p> : !canPay && <p id={hintId} className={styles.waitingHint}>
          {!table.occupied ? "รอบลูกค้านี้ปิดแล้ว" : unfinished > 0 ? "เหลืออาหารอีก " + unfinished + " รายการที่ยังไม่จบ" : table.blockedReason}
        </p>}
        {paymentError && !paying && <p className={styles.serviceError} role="alert">{paymentError}</p>}
        {tableState.message && <p className={styles.serviceFeedback} role={tableState.success ? "status" : "alert"}>{tableState.message}</p>}

        {!review && canChangeTable && <details className={styles.secondaryActions}>
          <summary>ตัวเลือกโต๊ะ<ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" /></summary>
          <form action={changeTable} aria-busy={changingTable}>
            <input type="hidden" name="id" value={table.id} />
            <input type="hidden" name="expected_status_id" value={table.statusId} />
            <input type="hidden" name="target_status_id" value={table.nextStatusId} />
            <input type="hidden" name="expected_session_id" value={table.sessionId ?? ""} />
            <input type="hidden" name="expected_state_token" value={table.stateToken} />
            <button type="submit" className={styles.serviceSecondary} disabled={pending || !table.canAdvance}>{changingTable ? "กำลังบันทึก…" : "เปลี่ยนเป็น " + table.nextStatusLabel}</button>
          </form>
        </details>}

        <div className={styles.serviceActions}>
          {review ? <>
            <button type="button" className={styles.serviceSecondary} disabled={pending} onClick={() => setReview(null)}>กลับ</button>
            <form action={pay} className={styles.paymentForm} aria-busy={paying}>
              <input type="hidden" name="id" value={table.id} />
              <input type="hidden" name="expected_session_id" value={review.sessionId} />
              <input type="hidden" name="expected_state_token" value={review.stateToken} />
              <input type="hidden" name="expected_total_amount" value={review.amount} />
              <input type="hidden" name="review_key" value={review.key} />
              <button type="submit" className={styles.servicePrimary} aria-describedby={hintId} disabled={pending || !canPay || staleReview}>{paying ? "กำลังบันทึก…" : "ยืนยันรับเงิน"}</button>
            </form>
          </> : <button type="button" className={styles.servicePrimary} aria-describedby={!canPay ? hintId : undefined} disabled={pending || !canPay} onClick={startReview}>
            <Wallet size={20} strokeWidth={1.75} aria-hidden="true" />ชำระเงิน
          </button>}
        </div>
      </>}
    </footer>
  </dialog>;
}
