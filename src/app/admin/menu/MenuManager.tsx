"use client";

import { useOptimistic, useState, useTransition } from "react";
import Image from "next/image";
import { setMenuAvailabilityAction } from "./actions";
import MenuEditor from "./MenuEditor";
import type { AdminMenuItem } from "./types";
import admin from "../page.module.css";
import styles from "./menu.module.css";

const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" });

function AvailabilityControl({ item, disabled }: { item: AdminMenuItem; disabled: boolean }) {
  const [active, setActive] = useOptimistic(item.is_active);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function changeAvailability(next: boolean) {
    if (disabled || pending) return;
    const form = new FormData();
    form.set("id", item.id);
    form.set("active", String(next));
    startTransition(async () => {
      setActive(next);
      setError("");
      try {
        const result = await setMenuAvailabilityAction({ success: false, message: "" }, form);
        if (!result.success) setError(result.message);
      } catch {
        setError("เปลี่ยนสถานะไม่ได้ กรุณาลองอีกครั้ง");
      }
    });
  }

  return (
    <div aria-busy={pending}>
      <label className={styles.availability}>
        <input type="checkbox" className={styles.availabilityInput} checked={active}
          disabled={disabled || pending} aria-label={"เปิดขาย " + item.name}
          onChange={(event) => changeAvailability(event.target.checked)} />
        <span role="status">{pending ? "กำลังบันทึก…" : active ? "เปิดขาย" : "ปิดขาย"}</span>
      </label>
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>
  );
}

export default function MenuManager({ items }: { items: AdminMenuItem[] }) {
  const [editor, setEditor] = useState<AdminMenuItem | null | undefined>(undefined);
  const editing = editor !== undefined;
  return (
    <section>
      <div className={admin.sectionHeading}>
        <div className={styles.title}><h1>เมนูอาหาร</h1><p>{items.length} เมนู</p></div>
        <button type="button" className={styles.primary} disabled={editing} onClick={() => setEditor(null)}>เพิ่มเมนู</button>
      </div>
      {editing && <MenuEditor key={editor?.id ?? "new"} item={editor ?? null} onClose={() => setEditor(undefined)} />}
      <div className={admin.tableScroll}>
        <table className={[admin.table, admin.responsiveTable].join(" ")}>
          <thead><tr>
            <th scope="col">เมนู</th><th scope="col">หมวดหมู่</th>
            <th scope="col" className={admin.numeric}>ราคา</th><th scope="col">สถานะ</th><th scope="col">จัดการ</th>
          </tr></thead>
          <tbody>{items.map(item => <tr key={item.id}>
            <th scope="row"><div className={styles.item}>
              {item.image_url && <Image src={item.image_url} alt={item.name} width={64} height={64} unoptimized className={styles.thumbnail} />}
              <div>{item.name}{item.description && <p className={styles.description}>{item.description}</p>}</div>
            </div></th>
            <td data-label="หมวดหมู่">{item.category ?? "—"}</td>
            <td className={admin.numeric} data-label="ราคา">{money.format(item.price)}</td>
            <td data-label="สถานะ"><AvailabilityControl item={item} disabled={editing} /></td>
            <td className={admin.mobileActions}><div className={styles.rowActions}>
              <button type="button" className={styles.secondary} disabled={editing} onClick={() => setEditor(item)} aria-label={"แก้ไข " + item.name}>แก้ไข</button>
            </div></td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
