"use client";
import RestaurantBrand from "@/components/RestaurantBrand";
import LiveRefresh from "@/components/LiveRefresh";
import styles from "./page.module.css";

export default function CashierError() {
  return (
    <main className={styles.page} lang="th">
      <LiveRefresh />
      <div className={styles.content}>
        <header className={styles.header}><div><RestaurantBrand /><h1>แคชเชียร์</h1></div></header>
        <p className={styles.note} role="alert">โหลดสถานะโต๊ะไม่ได้ กำลังลองเชื่อมต่อใหม่</p>
      </div>
    </main>
  );
}
