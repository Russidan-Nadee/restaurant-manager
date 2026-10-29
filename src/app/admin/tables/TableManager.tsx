"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode } from "lucide-react";
import TableQRCode from "./TableQRCode";
import TableEditor from "./TableEditor";
import type { AdminDiningTable } from "./types";
import admin from "../page.module.css";
import styles from "./tables.module.css";

type ActiveDialog = { kind: "create" } | { kind: "edit" | "delete" | "qr"; table: AdminDiningTable } | null;

export default function TableManager({ tables }: { tables: AdminDiningTable[] }) {
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [baseUrl, setBaseUrl] = useState("");

  function openQr(table: AdminDiningTable) {
    setBaseUrl(current => current || window.location.origin);
    setDialog({ kind: "qr", table });
  }

  return (
    <section>
      <div className={admin.sectionHeading}>
        <div className={styles.heading}><h1>โต๊ะ</h1><p>{tables.length} โต๊ะ</p></div>
        <button type="button" className={styles.primary} onClick={() => setDialog({ kind: "create" })}>เพิ่มโต๊ะ</button>
      </div>
      <div className={admin.tableScroll}>
        <table className={[admin.table, admin.responsiveTable].join(" ")}>
          <thead><tr><th scope="col">เลขโต๊ะ</th><th scope="col">ชื่อโต๊ะ</th><th scope="col" className={admin.end}>จัดการ</th></tr></thead>
          <tbody>{tables.map(table => <tr key={table.id}>
            <th scope="row" className={admin.tableNumber} data-label="เลขโต๊ะ">{table.name}</th>
            <td className={admin.mobileFull} data-label="ชื่อโต๊ะ">
              {table.displayName ? <span className={styles.displayName}>{table.displayName}</span>
                : <span className={styles.unnamed}>{table.name}</span>}
            </td>
            <td className={admin.mobileFull}>
              <div className={styles.tableActions}>
                <button type="button" className={styles.primary} onClick={() => openQr(table)} aria-label={"ดู QR โต๊ะ " + table.name}>
                  <QrCode size={18} strokeWidth={1.75} aria-hidden="true" />ดู QR
                </button>
                <button type="button" className={styles.secondary} onClick={() => setDialog({ kind: "edit", table })} aria-label={"ตั้งชื่อโต๊ะ " + table.name}>ตั้งชื่อ</button>
                <Link className={styles.secondary} href={"/order/" + table.name}>หน้าสั่งอาหาร</Link>
                <button type="button" className={[styles.secondary, styles.deleteButton].join(" ")} onClick={() => setDialog({ kind: "delete", table })} aria-label={"ลบโต๊ะ " + table.name}>ลบ</button>
              </div>
            </td>
          </tr>)}</tbody>
        </table>
      </div>
      {dialog?.kind === "qr" && <TableQRCode key={dialog.table.id} table={dialog.table} baseUrl={baseUrl} onBaseUrlChange={setBaseUrl} onClose={() => setDialog(null)} />}
      {dialog?.kind === "create" && <TableEditor key="new" table={null} mode="save" onClose={() => setDialog(null)} />}
      {(dialog?.kind === "edit" || dialog?.kind === "delete") && <TableEditor key={dialog.kind + dialog.table.id} table={dialog.table} mode={dialog.kind === "delete" ? "delete" : "save"} onClose={() => setDialog(null)} />}
    </section>
  );
}
