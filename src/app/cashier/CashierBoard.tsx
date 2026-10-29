"use client";

import { useState } from "react";
import { Armchair } from "lucide-react";
import type { ServiceTable } from "@/lib/workflow-types";
import { formatAmount as amountLabel } from "./format";
import TableServiceDialog from "./TableServiceDialog";
import styles from "./page.module.css";

function FloorTable({ table, onSelect }: { table: ServiceTable; onSelect: () => void }) {
  return <li>
    <button type="button" className={[styles.floorTable, table.occupied ? styles.floorOccupied : styles.floorFree].join(" ")}
      disabled={!table.occupied} aria-haspopup={table.occupied ? "dialog" : undefined} aria-label={"โต๊ะ " + table.name + " " + table.statusLabel + " ยอดรวม " + amountLabel(table.totalAmount) + (table.occupied ? " ดูรายละเอียด" : "")} onClick={onSelect}>
      <span className={styles.tablePlan} aria-hidden="true">
        <span className={[styles.chair, styles.chairNorth].join(" ")} />
        <span className={[styles.chair, styles.chairEast].join(" ")} />
        <span className={[styles.chair, styles.chairSouth].join(" ")} />
        <span className={[styles.chair, styles.chairWest].join(" ")} />
        <span className={styles.tableSurface}><span className={styles.surfaceCaption}>โต๊ะ</span><span className={styles.surfaceNumber}>{table.name}</span></span>
      </span>
      <span className={styles.floorStatus}><span className={styles.floorDot} aria-hidden="true" />{table.statusLabel}</span>
      <span className={styles.floorAmount}>{amountLabel(table.totalAmount)}</span>
    </button>
  </li>;
}

export default function CashierBoard({ tables }: { tables: ServiceTable[] }) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const selectedTable = tables.find(table => table.id === selectedTableId);
  if (tables.length === 0) return <div className={styles.empty} role="status"><Armchair size={25} strokeWidth={1.75} aria-hidden="true" /><p>ยังไม่มีโต๊ะที่เปิดใช้งาน</p></div>;
  return <>
    <div className={styles.floorToolbar}>
      <p>เลือกโต๊ะเพื่อดูรายการและชำระเงิน</p>
      <div className={styles.legend} aria-label="สีสถานะโต๊ะ"><span><i className={styles.freeDot} aria-hidden="true" />ว่าง</span><span><i className={styles.busyDot} aria-hidden="true" />ใช้งานอยู่</span></div>
    </div>
    <ul className={styles.floorBoard} data-cashier-floor tabIndex={-1} aria-label="โต๊ะมองจากด้านบน">{tables.map(table => <FloorTable key={table.id} table={table} onSelect={() => setSelectedTableId(table.id)} />)}</ul>
    {selectedTable && <TableServiceDialog key={selectedTable.id} table={selectedTable} onClose={() => setSelectedTableId(null)} />}
  </>;
}
