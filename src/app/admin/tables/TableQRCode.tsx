"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import type { DiningTable } from "@/app/order/types";
import styles from "./tables.module.css";

function orderLink(baseUrl: string, tableName: string): { url: string; error: string } {
  try {
    const base = new URL(baseUrl.trim());
    if (!["https:", "http:"].includes(base.protocol) || base.username || base.password || base.origin.length > 300) {
      return { url: "", error: "กรอก URL เว็บไซต์ร้านที่ขึ้นต้นด้วย https:// หรือ http://" };
    }
    const host = base.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost") || host.startsWith("127.") || host === "[::1]" || host === "0.0.0.0") {
      return { url: "", error: "มือถือเปิด localhost ไม่ได้ กรุณาใส่โดเมนร้าน หรือ IP ของเครื่องในเครือข่ายเดียวกัน" };
    }
    return { url: new URL("/order/" + encodeURIComponent(tableName), base.origin).href, error: "" };
  } catch { return { url: "", error: "กรอก URL เว็บไซต์ร้านที่ขึ้นต้นด้วย https:// หรือ http://" }; }
}

export default function TableQRCode({ table, baseUrl, onBaseUrlChange, onClose }: {
  table: DiningTable; baseUrl: string; onBaseUrlChange: (value: string) => void; onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleId = useId();
  const [feedback, setFeedback] = useState("");
  const link = orderLink(baseUrl, table.name);

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

  function download() {
    if (!canvasRef.current || !link.url) return;
    try {
      const anchor = document.createElement("a");
      anchor.href = canvasRef.current.toDataURL("image/png");
      anchor.download = "table-" + table.name + "-qr.png";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch { setFeedback("ดาวน์โหลดไม่ได้ กรุณาลองอีกครั้ง"); }
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(link.url); setFeedback("คัดลอกลิงก์แล้ว"); }
    catch { setFeedback("คัดลอกอัตโนมัติไม่ได้ สามารถเลือกคัดลอกจากช่องลิงก์ด้านล่าง"); }
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId} aria-modal="true"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}>
      <header className={styles.dialogHeader}>
        <h2 id={titleId}>QR โต๊ะ {table.name}</h2>
        <button type="button" className={styles.close} aria-label="ปิดหน้าต่าง QR" onClick={onClose}><X size={20} aria-hidden="true" /></button>
      </header>
      <div className={styles.dialogBody}>
        <label className={styles.urlField}>URL เว็บไซต์ร้าน
          <input type="url" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={baseUrl} maxLength={300}
            onChange={(event) => { onBaseUrlChange(event.target.value); setFeedback(""); }} />
        </label>
        {link.error ? <p className={styles.notice} role="status">{link.error}</p> : <>
          <div className={styles.qrSheet}>
            <p className={styles.brand}>Your name Restaurant</p>
            <p className={styles.tableCode}>โต๊ะ {table.name}</p>
            <QRCodeCanvas ref={canvasRef} value={link.url} size={1024} marginSize={4} level="M" bgColor="#ffffff" fgColor="#000000"
              title={"สแกนสั่งอาหาร โต๊ะ " + table.name} role="img" className={styles.qrCanvas} />
            <p className={styles.scanHint}>สแกนเพื่อสั่งอาหาร</p>
          </div>
          <div className={styles.dialogActions}>
            <button type="button" className={styles.primary} onClick={download}>ดาวน์โหลด PNG</button>
            <button type="button" className={styles.secondary} onClick={copyLink}>คัดลอกลิงก์</button>
          </div>
          <label className={styles.urlField}>ลิงก์สั่งอาหารโต๊ะนี้
            <input readOnly value={link.url} onFocus={(event) => event.target.select()} />
          </label>
        </>}
        {feedback && <p className={styles.feedback} role="status">{feedback}</p>}
      </div>
    </dialog>
  );
}
