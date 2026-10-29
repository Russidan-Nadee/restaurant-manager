import RestaurantBrand from "@/components/RestaurantBrand";
import Link from "next/link";
import { Armchair } from "lucide-react";
import { getDiningTables } from "@/lib/menu";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function OrderPage() {
  const tables = await getDiningTables();
  return (
    <main className={styles.page} lang="th">
      <div className={styles.content}>
        <header className={styles.header}>
          <RestaurantBrand />
          <h1 className={styles.title}>เลือกโต๊ะ</h1>
        </header>
        <nav className={styles.tables} aria-label="เลือกโต๊ะสำหรับสั่งอาหาร">
          {tables.map(table => (
            <Link key={table.id} href={"/order/" + table.name} className={styles.tableLink}>
              <Armchair size={22} strokeWidth={1.75} aria-hidden="true" />
              <span>โต๊ะ {table.name}</span>

</Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
