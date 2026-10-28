import { Armchair, Wallet } from "lucide-react";
import RestaurantBrand from "@/components/RestaurantBrand";
import LiveRefresh from "@/components/LiveRefresh";
import { getDatabase } from "@/lib/db";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CashierTable = { id: string; name: string; occupied: boolean };

export default async function CashierPage() {
  const result = await getDatabase().query<CashierTable>(
    "SELECT t.id, t.name, EXISTS (SELECT 1 FROM orders o " +
    "WHERE o.table_id = t.id AND o.status = ANY($1::text[])) AS occupied " +
    "FROM restaurant_tables t WHERE t.name ~ $2 ORDER BY t.name ASC",
    [["placed", "preparing", "ready"], "^[0-9]{3}$"],
  );
  const updatedAt = new Date().toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit" });
  return (
    <main className={styles.page} lang="th">
      <LiveRefresh />
      <div className={styles.content}>
        <header className={styles.header}>
          <div>
            <RestaurantBrand />
            <h1><Wallet size={24} strokeWidth={1.75} aria-hidden="true" />แคชเชียร์</h1>
          </div>
          <p className={styles.updated}>อัปเดตล่าสุด {updatedAt}</p>
        </header>
        <div className={styles.legend}>
          <span><i className={styles.freeDot} />ว่าง</span>
          <span><i className={styles.busyDot} />มีลูกค้า</span>
        </div>
        <ul className={styles.grid} aria-label="สถานะโต๊ะ">
          {result.rows.map(table => <li key={table.id} className={table.occupied ? styles.busy : styles.free}>
            <span className={styles.tableIcon}><Armchair size={25} strokeWidth={1.75} aria-hidden="true" /></span>
            <h2><span>โต๊ะ</span>{table.name}</h2>
            <p className={styles.status}>{table.occupied ? "มีลูกค้า" : "ว่าง"}</p>
          </li>)}
        </ul>
        <p className={styles.note}>สถานะอิงจากออร์เดอร์ที่ยังไม่ปิด</p>
      </div>
    </main>
  );
}
