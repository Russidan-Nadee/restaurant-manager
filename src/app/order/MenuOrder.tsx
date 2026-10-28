"use client";

import RestaurantBrand from "@/components/RestaurantBrand";
import { useRef, useState } from "react";
import MenuItemImage from "./MenuItemImage";
import { Armchair, Check, Plus, Send } from "lucide-react";
import { placeOrder } from "@/lib/orders";
import type { CartItem } from "@/lib/types";
import type { CustomerMenuItem, DiningTable } from "./types";
import styles from "./page.module.css";

const formatMoney = (cents: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(cents / 100);

export default function MenuOrder({ table, menu }: { table: DiningTable; menu: CustomerMenuItem[] }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState("");
  const sending = useRef(false);
  const cart: CartItem[] = menu.filter(item => (quantities[item.id] ?? 0) > 0).map(item => ({
    menuItemId: item.id, name: item.name, price: item.price, quantity: quantities[item.id],
  }));
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCents = cart.reduce((total, item) => total + Math.round(item.price * 100) * item.quantity, 0);

  function addItem(id: string) {
    if (sending.current) return;
    setError("");
    setConfirmedOrder("");
    setQuantities(current => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  }

  async function submitOrder() {
    if (sending.current || cart.length === 0) return;
    sending.current = true;
    setSubmitting(true);
    setError("");
    setConfirmedOrder("");
    try {
      const id = await placeOrder(table.id, cart);
      setConfirmedOrder(id);
      setQuantities({});
    } catch {
      setError("ส่งออร์เดอร์ไม่สำเร็จ กรุณาตรวจสอบรายการแล้วลองใหม่");
    } finally {
      sending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page} lang="th">
      <div className={styles.content}>
        <header className={styles.header}>
          <RestaurantBrand />
          <div className={styles.headingRow}>
            <h1 className={styles.title}>เมนูอาหาร</h1>
            <p className={styles.tableName}>
              <Armchair size={20} strokeWidth={1.75} aria-hidden="true" />โต๊ะ {table.name}
            </p>
          </div>
        </header>

        {confirmedOrder && <p className={styles.success} role="status">
          <Check size={20} strokeWidth={1.75} aria-hidden="true" />ส่งออร์เดอร์เข้าครัวแล้ว
        </p>}
        {error && <p className={styles.error} role="alert">{error}</p>}

        <ul className={styles.menu} aria-label="เมนูที่เปิดขาย">
          {menu.map(item => {
            return (
              <li key={item.id} className={styles.menuItem}>
                <MenuItemImage imageUrl={item.imageUrl} name={item.name} />
                <div className={styles.dish}>
                  <h2>{item.name}</h2>
                  {item.description && <p>{item.description}</p>}
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.price}>{formatMoney(Math.round(item.price * 100))}</span>
                  <button className={styles.addToCart} type="button" aria-label={"เพิ่ม " + item.name + " ลงตะกร้า"} disabled={submitting} onClick={() => addItem(item.id)}>
                    <Plus size={20} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {menu.length > 0 && <footer className={styles.summary}>
          <div>
            <p aria-live="polite" aria-atomic="true">{itemCount} รายการ</p>
            <strong>{formatMoney(totalCents)}</strong>
          </div>
          <button type="button" className={styles.submit} disabled={itemCount === 0 || submitting} onClick={submitOrder}>
            <Send size={20} strokeWidth={1.75} aria-hidden="true" />
            {submitting ? "กำลังส่งออร์เดอร์" : "ส่งออร์เดอร์"}
          </button>
        </footer>}
      </div>
    </main>
  );
}
