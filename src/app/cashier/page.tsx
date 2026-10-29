import { Wallet } from "lucide-react";
import RestaurantBrand from "@/components/RestaurantBrand";
import LiveRefresh from "@/components/LiveRefresh";
import { getServiceTables } from "@/lib/workflow-queries";
import CashierBoard from "./CashierBoard";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CashierPage() {
  const tables = await getServiceTables();
  const updatedAt = new Date().toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit" });
  return <main className={styles.page} lang="th">
    <LiveRefresh />
    <div className={styles.content}>
      <header className={styles.header}>
        <div><RestaurantBrand /><h1><Wallet size={24} strokeWidth={1.75} aria-hidden="true" />แคชเชียร์</h1></div>
        <p className={styles.updated}>อัปเดตล่าสุด {updatedAt}</p>
      </header>
      <CashierBoard tables={tables} />
    </div>
  </main>;
}
