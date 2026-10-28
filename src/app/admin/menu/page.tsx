import { getDatabase } from "@/lib/db";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AdminMenuItem = { id: string; name: string; category: string | null; price: number; is_active: boolean };

export default async function AdminMenuPage() {
  const result = await getDatabase().query<AdminMenuItem>(
    "SELECT m.id, m.name, c.name AS category, m.price::double precision AS price, m.is_active " +
    "FROM menu_items m LEFT JOIN categories c ON c.id = m.category_id " +
    "ORDER BY c.sort_order ASC NULLS LAST, c.name ASC, m.sort_order ASC, m.name ASC",
  );
  const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" });
  return (
    <section>
      <div className={styles.sectionHeading}><h1>เมนูอาหาร</h1><p>{result.rows.length} เมนู</p></div>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead><tr>
            <th scope="col">เมนู</th><th scope="col">หมวดหมู่</th>
            <th scope="col" className={styles.numeric}>ราคา</th><th scope="col">สถานะ</th>
          </tr></thead>
          <tbody>
            {result.rows.map(item => <tr key={item.id}>
              <th scope="row">{item.name}</th>
              <td>{item.category ?? "—"}</td>
              <td className={styles.numeric}>{money.format(item.price)}</td>
              <td><span className={item.is_active ? styles.active : styles.inactive}>{item.is_active ? "เปิดขาย" : "ปิดขาย"}</span></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
