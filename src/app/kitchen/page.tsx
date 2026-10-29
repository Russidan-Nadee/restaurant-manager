import RestaurantBrand from "@/components/RestaurantBrand";
import { ClipboardList } from "lucide-react";
import { getFoodWorkItems } from "@/lib/workflow-queries";
import type { FoodWorkItem } from "@/lib/workflow-types";
import KitchenRefresh from "./KitchenRefresh";
import KitchenBoard from "./KitchenBoard";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function KitchenPage() {
  let items: FoodWorkItem[] = [];
  let unavailable = false;
  try { items = (await getFoodWorkItems()).filter(item => item.nextStatusId !== null); }
  catch { unavailable = true; }
  const updatedAt = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Bangkok" });
  return <main className={styles.page} lang="th">
    <KitchenRefresh />
    <div className={styles.content}>
      <header className={styles.header}>
        <div><RestaurantBrand /><h1 className={styles.title}><ClipboardList size={26} strokeWidth={1.75} aria-hidden="true" />ครัว</h1></div>
        <p className={styles.updated}>{unavailable ? "กำลังลองเชื่อมต่อใหม่" : "อัปเดตล่าสุด " + updatedAt}<span>อัปเดตอัตโนมัติทุก 5 วินาที</span></p>
      </header>
      {unavailable ? <p role="alert">โหลดออร์เดอร์ไม่ได้ กำลังลองเชื่อมต่อใหม่</p> : <KitchenBoard items={items} />}
    </div>
  </main>;
}
