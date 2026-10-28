"use client";
import RestaurantBrand from "@/components/RestaurantBrand";
import styles from "./page.module.css";

export default function OrderError({ reset }: { reset: () => void }) {
  return (
    <main className={styles.page} lang="th">
      <div className={styles.content}>
        <header className={styles.header}>
          <RestaurantBrand />
          <h1 className={styles.title} role="alert">โหลดข้อมูลไม่ได้</h1>
        </header>
        <div className={styles.feedback}>
          <button type="button" className={styles.submit} onClick={reset}>ลองอีกครั้ง</button>
        </div>
      </div>
    </main>
  );
}
