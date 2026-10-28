"use client";
import styles from "./page.module.css";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section role="alert">
      <h1>โหลดข้อมูลไม่ได้</h1>
      <button type="button" className={styles.retry} onClick={reset}>ลองอีกครั้ง</button>
    </section>
  );
}
