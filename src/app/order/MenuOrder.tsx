"use client";

import RestaurantBrand from "@/components/RestaurantBrand";
import { useRef, useState } from "react";
import MenuItemImage from "./MenuItemImage";
import OrderReviewDialog from "./OrderReviewDialog";
import MenuItemDialog, { MAX_ITEM_QUANTITY } from "./MenuItemDialog";
import { Armchair, Check, Minus, Plus, Send } from "lucide-react";
import { placeOrder } from "@/lib/orders";
import { getProteinLabel, SPECIAL_PRICE, type ProteinId } from "@/lib/menu-options";
import type { CartItem } from "@/lib/types";
import type { CustomerMenuItem, DiningTable } from "./types";
import styles from "./page.module.css";

const formatMoney = (cents: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(cents / 100);
const lineKey = (item: Pick<CartItem, "menuItemId" | "protein" | "isSpecial">) => JSON.stringify([item.menuItemId, item.protein ?? null, item.isSpecial === true]);
const variantLabel = (item: CartItem) => [getProteinLabel(item.protein), item.isSpecial ? "พิเศษ" : "ธรรมดา"].filter(Boolean).join(" · ");

export default function MenuOrder({ table, menu }: { table: DiningTable; menu: CustomerMenuItem[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CustomerMenuItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState("");
  const sending = useRef(false);
  const [reviewItems, setReviewItems] = useState<CartItem[] | null>(null);
  const [dialogTrigger, setDialogTrigger] = useState<HTMLButtonElement | null>(null);
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCents = cart.reduce((total, item) => total + Math.round(item.price * 100) * item.quantity, 0);

  function openItem(item: CustomerMenuItem, trigger: HTMLButtonElement) {
    if (sending.current) return;
    setDialogTrigger(trigger);
    setSelectedItem(item);
  }

  function addItem(protein: ProteinId | null, isSpecial: boolean, quantity: number): string | null {
    if (sending.current || !selectedItem) return "กรุณารอส่งออร์เดอร์ให้เสร็จ";
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY) return "จำนวนอาหารไม่ถูกต้อง";
    const newItem: CartItem = {
      menuItemId: selectedItem.id, name: selectedItem.name,
      price: selectedItem.price + (isSpecial ? SPECIAL_PRICE : 0), quantity, protein, isSpecial,
    };
    const key = lineKey(newItem);
    const existing = cart.find(item => lineKey(item) === key);
    if (existing && existing.quantity > MAX_ITEM_QUANTITY - quantity) return "จำนวนรายการนี้เกินจำนวนสูงสุดที่รับได้";
    setCart(current => {
      const match = current.find(item => lineKey(item) === key);
      if (match) return current.map(item => lineKey(item) === key ? { ...item, quantity: item.quantity + quantity } : item);
      return [...current, newItem];
    });
    setError("");
    setConfirmedOrder("");
    setSelectedItem(null);
    return null;
  }

  function changeQuantity(key: string, change: -1 | 1) {
    if (sending.current) return;
    setCart(current => current.flatMap(item => {
      if (lineKey(item) !== key) return [item];
      const quantity = item.quantity + change;
      if (quantity > MAX_ITEM_QUANTITY) return [item];
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
    setError("");
    setConfirmedOrder("");
  }

  function reviewOrder(trigger: HTMLButtonElement) {
    if (sending.current || selectedItem || cart.length === 0) return;
    setDialogTrigger(trigger);
    setError("");
    setReviewItems(cart.map(item => ({ ...item })));
  }

  function closeReview() {
    if (sending.current) return;
    setReviewItems(null);
    setError("");
  }

  async function submitOrder() {
    if (sending.current || selectedItem || !reviewItems?.length) return;
    sending.current = true;
    setSubmitting(true);
    setError("");
    setConfirmedOrder("");
    try {
      const id = await placeOrder(table.id, reviewItems);
      setConfirmedOrder(id);
      setCart([]);
      setReviewItems(null);
    } catch {
      setError("ส่งออร์เดอร์ไม่สำเร็จ กรุณาตรวจสอบรายการแล้วลองใหม่");
    } finally {
      sending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page} lang="th">
      <div className={`${styles.content} ${styles.menuContent}`}>
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
        {error && !reviewItems && <p className={styles.error} role="alert">{error}</p>}

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
                  <button className={styles.addToCart} type="button" aria-label={"เพิ่ม " + item.name + " ลงตะกร้า"} aria-haspopup="dialog" disabled={submitting} onClick={event => openItem(item, event.currentTarget)}>
                    <Plus size={20} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {cart.length > 0 && <section className={styles.cart} aria-labelledby="cart-title" aria-busy={submitting}>
          <h2 id="cart-title">รายการที่เลือก</h2>
          <ul className={styles.cartList}>
            {cart.map(item => {
              const key = lineKey(item);
              const variant = variantLabel(item);
              const identity = `${item.name} (${variant})`;
              return <li key={key} className={styles.cartLine}>
                <div className={styles.cartDish}>
                  <h3>{item.name}</h3>
                  <p>{variant}</p>
                  <span className={styles.cartPrice}>{formatMoney(Math.round(item.price * 100) * item.quantity)}</span>
                </div>
                <div className={styles.quantityControl}>
                  <button type="button" className={styles.quantityButton} aria-label={`ลดจำนวน ${identity}`} disabled={submitting} onClick={() => changeQuantity(key, -1)}>
                    <Minus size={18} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                  <output className={styles.quantityValue} aria-label={`จำนวน ${identity}`} aria-live="polite">{item.quantity}</output>
                  <button type="button" className={styles.quantityButton} aria-label={`เพิ่มจำนวน ${identity}`} disabled={submitting || item.quantity >= MAX_ITEM_QUANTITY} onClick={() => changeQuantity(key, 1)}>
                    <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </div>
              </li>;
            })}
          </ul>
        </section>}

        {menu.length > 0 && <footer className={styles.summary}>
          <div data-order-summary tabIndex={-1} aria-label="สรุปออร์เดอร์">
            <p aria-live="polite" aria-atomic="true">{itemCount} รายการ</p>
            <strong>{formatMoney(totalCents)}</strong>
          </div>
          <button type="button" className={styles.submit} aria-haspopup="dialog" disabled={itemCount === 0 || submitting} onClick={event => reviewOrder(event.currentTarget)}>
            <Send size={20} strokeWidth={1.75} aria-hidden="true" />
            {submitting ? "กำลังส่งออร์เดอร์" : "ส่งออร์เดอร์"}
          </button>
        </footer>}
      </div>
      {reviewItems && <OrderReviewDialog tableNumber={table.name} items={reviewItems} submitting={submitting} error={error} trigger={dialogTrigger} onClose={closeReview} onConfirm={submitOrder} />}
      {selectedItem && <MenuItemDialog key={selectedItem.id} item={selectedItem} trigger={dialogTrigger} disabled={submitting} onClose={() => setSelectedItem(null)} onConfirm={addItem} />}
    </main>
  );
}
