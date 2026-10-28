"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode } from "lucide-react";
import type { DiningTable } from "@/app/order/types";
import TableQRCode from "./TableQRCode";
import admin from "../page.module.css";
import styles from "./tables.module.css";

export default function TableManager({ tables }: { tables: DiningTable[] }) {
  const [selected, setSelected] = useState<DiningTable | null>(null);
  const [baseUrl, setBaseUrl] = useState("");

  function openQr(table: DiningTable) {
    setBaseUrl(current => current || window.location.origin);
    setSelected(table);
  }

  return (
    <section>
      <div className={admin.sectionHeading}><h1>โต๊ะ</h1><p>{tables.length} โต๊ะ</p></div>
      <div className={admin.tableScroll}>
        <table className={[admin.table, admin.responsiveTable].join(" ")}>
          <thead><tr><th scope="col">เลขโต๊ะ</th><th scope="col" className={admin.end}>จัดการ</th></tr></thead>
          <tbody>{tables.map(table => <tr key={table.id}>
            <th scope="row" className={admin.tableNumber} data-label="โต๊ะ">{table.name}</th>
            <td className={admin.mobileFull}>
              <div className={styles.tableActions}>
                <button type="button" className={styles.primary} onClick={() => openQr(table)} aria-label={"ดู QR โต๊ะ " + table.name}>
                  <QrCode size={18} strokeWidth={1.75} aria-hidden="true" />ดู QR
                </button>
                <Link className={styles.secondary} href={"/order/" + table.name}>หน้าสั่งอาหาร</Link>
              </div>
            </td>
          </tr>)}</tbody>
        </table>
      </div>
      {selected && <TableQRCode key={selected.id} table={selected} baseUrl={baseUrl} onBaseUrlChange={setBaseUrl} onClose={() => setSelected(null)} />}
    </section>
  );
}
