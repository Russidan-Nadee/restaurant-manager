"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, LockKeyhole, Plus, Trash2, X } from "lucide-react";
import type { WorkflowActionState, WorkflowStatus, StatusScope } from "@/lib/workflow-types";
import { addStatusAction, moveStatusAction, removeStatusAction } from "./actions";
import styles from "./statuses.module.css";

const initialActionState: WorkflowActionState = { success: false, message: "" };

function sortStatuses(statuses: WorkflowStatus[], scope: StatusScope) {
  return statuses
    .filter((status) => status.scope === scope)
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function defaultAfterId(statuses: WorkflowStatus[], scope: StatusScope) {
  const scoped = sortStatuses(statuses, scope);
  const anchorCode = scope === "table" ? "occupied" : "ready";
  return scoped.find((status) => status.code === anchorCode)?.id ?? scoped.at(-1)?.id ?? "";
}

function addOptions(statuses: WorkflowStatus[], scope: StatusScope) {
  return sortStatuses(statuses, scope).filter((status) => {
    if (scope === "table") return status.code === "occupied" || status.code === null;
    return status.code !== "served";
  });
}

function canSwap(status: WorkflowStatus, neighbor: WorkflowStatus | undefined) {
  if (!neighbor) return false;
  if (neighbor.code === "served") return false;
  if (!neighbor.isRequired) return true;
  return status.scope === "food" && neighbor.code === "ready";
}

function NativeDialog({
  open,
  title,
  children,
  onClose,
  dialogClassName,
  pending = false,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  dialogClassName?: string;
  pending?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      dialog.querySelector<HTMLElement>("input:not([type=hidden]), select, button")?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open]);

  function close() {
    if (!pending) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={[styles.dialog, dialogClassName].filter(Boolean).join(" ")}
      aria-labelledby="status-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        const dialog = dialogRef.current;
        if (!dialog || pending) return;
        const bounds = dialog.getBoundingClientRect();
        const insideDialog = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
        if (!insideDialog) close();
      }}
    >
      <div className={styles.dialogHeader}>
        <h2 id="status-dialog-title">{title}</h2>
        <button type="button" className={styles.iconButton} onClick={close} disabled={pending} aria-label="ปิด">
          <X size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function AddStatusDialog({
  statuses,
  open,
  onClose,
}: {
  statuses: WorkflowStatus[];
  open: boolean;
  onClose: () => void;
}) {
  const [scope, setScope] = useState<StatusScope>("table");
  const options = useMemo(() => addOptions(statuses, scope), [statuses, scope]);
  const [afterId, setAfterId] = useState(() => defaultAfterId(statuses, "table"));
  const [state, formAction, pending] = useActionState(addStatusAction, initialActionState);
  const resultRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.success) resultRef.current?.focus();
  }, [state.success]);

  function changeScope(nextScope: StatusScope) {
    setScope(nextScope);
    setAfterId(defaultAfterId(statuses, nextScope));
  }

  return (
    <NativeDialog open={open} title="เพิ่มสถานะ" onClose={onClose} pending={pending}>
      <form action={formAction} className={styles.dialogBody}>
        <fieldset disabled={pending} className={styles.fieldset}>
          <label className={styles.field}>
            <span>ประเภทสถานะ</span>
            <select name="scope" value={scope} onChange={(event) => changeScope(event.target.value as StatusScope)}>
              <option value="table">โต๊ะ</option>
              <option value="food">อาหาร</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>ชื่อสถานะ</span>
            <input name="label" type="text" required maxLength={60} placeholder="เช่น กำลังเสิร์ฟ" />
          </label>
          <label className={styles.field}>
            <span>เพิ่มต่อจาก</span>
            <select name="after_id" value={afterId} onChange={(event) => setAfterId(event.target.value)} disabled={options.length === 0}>
              {options.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
            </select>
            <small>สถานะใหม่จะอยู่ถัดจากสถานะที่เลือก</small>
          </label>
        </fieldset>
        {state.message && <p ref={resultRef} tabIndex={-1} className={state.success ? styles.success : styles.error} role={state.success ? "status" : "alert"}>{state.message}</p>}
        <div className={styles.dialogActions}>
          <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={pending}>ยกเลิก</button>
          <button type="submit" className={styles.primaryButton} disabled={pending || state.success || options.length === 0}>
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            {pending ? "กำลังบันทึก" : state.success ? "บันทึกแล้ว" : "เพิ่มสถานะ"}
          </button>
        </div>
      </form>
    </NativeDialog>
  );
}

function RemoveStatusDialog({
  status,
  open,
  onClose,
}: {
  status: WorkflowStatus;
  open: boolean;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(removeStatusAction, initialActionState);

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  return (
    <NativeDialog open={open} title="ยืนยันการลบสถานะ" onClose={onClose} pending={pending}>
      <form action={formAction} className={styles.dialogBody}>
        <input type="hidden" name="id" value={status.id} />
        <p className={styles.confirmCopy}>
          ต้องการลบสถานะ <strong>{status.label}</strong> หรือไม่ สถานะจะไม่ใช้กับรายการใหม่ แต่ประวัติเดิมจะยังคงอยู่
        </p>
        {state.message && <p className={state.success ? styles.success : styles.error} role={state.success ? "status" : "alert"}>{state.message}</p>}
        <div className={styles.dialogActions}>
          <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={pending}>ยกเลิก</button>
          <button type="submit" className={styles.dangerButton} disabled={pending}>
            <Trash2 size={18} strokeWidth={1.75} aria-hidden="true" />
            {pending ? "กำลังลบ" : "ยืนยันการลบ"}
          </button>
        </div>
      </form>
    </NativeDialog>
  );
}

function MoveButton({
  status,
  direction,
  neighbor,
}: {
  status: WorkflowStatus;
  direction: "up" | "down";
  neighbor: WorkflowStatus | undefined;
}) {
  const [state, formAction, pending] = useActionState(moveStatusAction, initialActionState);
  const enabled = status.code === null && canSwap(status, neighbor);
  const label = direction === "up" ? `เลื่อน ${status.label} ขึ้น` : `เลื่อน ${status.label} ลง`;
  const Icon = direction === "up" ? ChevronUp : ChevronDown;

  return (
    <form action={formAction} className={styles.moveForm} aria-busy={pending}>
      <input type="hidden" name="id" value={status.id} />
      <input type="hidden" name="direction" value={direction} />
      <input type="hidden" name="expected_neighbor_id" value={neighbor?.id ?? ""} />
      <button type="submit" className={styles.iconButton} disabled={!enabled || pending} aria-label={label} title={label}>
        <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
      </button>
      {state.message && !state.success && <span className={styles.inlineError} role="alert">{state.message}</span>}
    </form>
  );
}

function StatusRow({ status, statuses }: { status: WorkflowStatus; statuses: WorkflowStatus[] }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const index = statuses.findIndex((candidate) => candidate.id === status.id);
  const previous = index > 0 ? statuses[index - 1] : undefined;
  const next = index >= 0 && index < statuses.length - 1 ? statuses[index + 1] : undefined;
  const locked = status.isRequired;
  const usageLabel = status.inUse ? "กำลังใช้งาน" : "ยังไม่ถูกใช้";

  return (
    <li className={styles.statusRow}>
      <div className={styles.statusIdentity}>
        <div className={styles.statusLabelLine}>
          <strong>{status.label}</strong>
          {locked && <span className={styles.requiredBadge}><LockKeyhole size={14} strokeWidth={1.75} aria-hidden="true" />จำเป็น</span>}
        </div>
        <p>{status.isRequired ? "สถานะหลัก" : status.code === "served" ? "สถานะเสริม" : "สถานะกำหนดเอง"}</p>
      </div>
      <div className={styles.statusMeta}>
        <span className={status.isTerminal ? styles.terminalBadge : styles.cycleBadge}>
          {status.isTerminal ? (status.scope === "table" ? "กลับสู่ว่าง" : "จุดสิ้นสุด") : "อยู่ในลำดับ"}
        </span>
        <span className={status.inUse ? styles.inUseBadge : styles.idleBadge}>{usageLabel}</span>
      </div>
      <div className={styles.statusActions}>
        {status.isTerminal ? <span className={styles.actionHint}>{status.scope === "table" ? "ก้าวถัดไปกลับสู่ว่าง" : "สถานะสุดท้าย"}</span> : status.scope === "table" ? <span className={styles.actionHint}>ลำดับสุดท้ายจะกลับไปที่ว่าง</span> : <span className={styles.actionHint}>ไปสถานะถัดไปตามลำดับ</span>}
        {status.code === null && (
          <div className={styles.moveActions}>
            <MoveButton status={status} direction="up" neighbor={previous} />
            <MoveButton status={status} direction="down" neighbor={next} />
          </div>
        )}
        <button
          type="button"
          className={styles.removeButton}
          disabled={locked || status.inUse}
          onClick={() => setConfirmOpen(true)}
          title={locked ? "สถานะจำเป็นลบไม่ได้" : status.inUse ? "สถานะที่กำลังใช้งานลบไม่ได้" : `ลบ ${status.label}`}
        >
          <Trash2 size={17} strokeWidth={1.75} aria-hidden="true" />
          ลบ
        </button>
        {locked && <span className={styles.actionHint}>สถานะจำเป็นลบหรือย้ายไม่ได้</span>}
        {!locked && status.inUse && <span className={styles.actionHint}>กำลังใช้งาน จึงลบไม่ได้</span>}
      </div>
      {confirmOpen && <RemoveStatusDialog status={status} open onClose={() => setConfirmOpen(false)} />}
    </li>
  );
}

function StatusGroup({
  scope,
  statuses,
}: {
  scope: StatusScope;
  statuses: WorkflowStatus[];
}) {
  const heading = scope === "table" ? "สถานะโต๊ะ" : "สถานะอาหาร";
  const description = scope === "table"
    ? "ลำดับสถานะโต๊ะจะวนกลับไปที่สถานะว่างเมื่อก้าวผ่านสถานะสุดท้าย"
    : "อาหารจะเดินไปตามลำดับ และสถานะสุดท้ายจะไม่เดินต่อ";

  return (
    <section className={styles.group} aria-labelledby={`${scope}-status-heading`}>
      <div className={styles.groupHeading}>
        <div>
          <h2 id={`${scope}-status-heading`}>{heading}</h2>
          <p>{description}</p>
        </div>
        <span className={styles.count}>{statuses.length} สถานะ</span>
      </div>
      {statuses.length > 0 ? (
        <ol className={styles.statusList} aria-label={heading}>{statuses.map((status) => <StatusRow key={status.id} status={status} statuses={statuses} />)}</ol>
      ) : (
        <p className={styles.empty}>ยังไม่มีสถานะในกลุ่มนี้</p>
      )}
    </section>
  );
}

export default function StatusManager({ statuses }: { statuses: WorkflowStatus[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const tableStatuses = useMemo(() => sortStatuses(statuses, "table"), [statuses]);
  const foodStatuses = useMemo(() => sortStatuses(statuses, "food"), [statuses]);

  return (
    <section className={styles.manager}>
      <div className={styles.managerToolbar}>
        <div>
          <h1>สถานะ</h1>
          <p>เพิ่มสถานะกำหนดเองได้ตามการทำงานของร้าน และลบได้เมื่อไม่มีรายการใช้งานอยู่ การเปลี่ยนลำดับอาหารจะทำได้เมื่อรายการอาหารที่กำลังดำเนินการเสร็จสิ้นแล้ว</p>
        </div>
        <button type="button" className={styles.primaryButton} onClick={() => setAddOpen(true)}>
          <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
          เพิ่มสถานะ
        </button>
      </div>
      <StatusGroup scope="table" statuses={tableStatuses} />
      <StatusGroup scope="food" statuses={foodStatuses} />
      {addOpen && <AddStatusDialog statuses={statuses} open onClose={() => setAddOpen(false)} />}
    </section>
  );
}
