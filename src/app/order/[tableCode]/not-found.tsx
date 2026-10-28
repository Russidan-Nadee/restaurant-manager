import RestaurantBrand from "@/components/RestaurantBrand";
import styles from "../page.module.css";

export default function TableNotFound() {
  return (
    <main className={styles.page} lang="th">
      <div className={styles.content}>
        <header className={styles.header}>
          <RestaurantBrand />
          <h1 className={styles.title}>ไม่พบโต๊ะนี้</h1>
        </header>
        <p className={styles.feedback}>กรุณาสแกน QR ที่โต๊ะอีกครั้ง</p>
      </div>
    </main>
  );
}
