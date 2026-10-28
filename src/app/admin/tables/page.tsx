import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getDiningTables } from "@/lib/menu";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminTablesPage() {
  const tables = await getDiningTables();
  return (
    <section>
      <div className={styles.sectionHeading}><h1>โต๊ะ</h1><p>{tables.length} โต๊ะ</p></div>
      <table className={styles.table}>
        <thead><tr><th scope="col">เลขโต๊ะ</th><th scope="col" className={styles.end}>หน้าสั่งอาหาร</th></tr></thead>
        <tbody>
          {tables.map(table => <tr key={table.id}>
            <th scope="row" className={styles.tableNumber}>{table.name}</th>
            <td className={styles.end}>
              <Link className={styles.orderLink} href={"/order/" + table.name}>เปิดหน้าสั่งอาหาร <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" /></Link>
            </td>
          </tr>)}
        </tbody>
      </table>
    </section>
  );
}
