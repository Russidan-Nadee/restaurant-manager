import { Armchair, ClipboardList, Clock, UtensilsCrossed } from "lucide-react";
import { getDatabase } from "@/lib/db";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Summary = { today_orders: number; waiting_orders: number; active_menu: number; tables: number };
type RecentOrder = {
  id: string; table_name: string; status: string; created_at: Date;
  items: { name: string; quantity: number }[];
};
const statusLabels: Record<string, string> = { placed: "รอรับออร์เดอร์", preparing: "กำลังทำ", ready: "พร้อมเสิร์ฟ" };

export default async function AdminOverviewPage() {
  const database = getDatabase();
  const [summaryResult, ordersResult] = await Promise.all([
    database.query<Summary>(
      "SELECT " +
      "(SELECT count(*)::int FROM orders WHERE created_at >= (date_trunc(\'day\', now() AT TIME ZONE \'Asia/Bangkok\') AT TIME ZONE \'Asia/Bangkok\') " +
      "AND created_at < ((date_trunc(\'day\', now() AT TIME ZONE \'Asia/Bangkok\') + interval \'1 day\') AT TIME ZONE \'Asia/Bangkok\')) AS today_orders, " +
      "(SELECT count(*)::int FROM orders WHERE status = \'placed\') AS waiting_orders, " +
      "(SELECT count(*)::int FROM menu_items WHERE is_active = true) AS active_menu, " +
      "(SELECT count(*)::int FROM restaurant_tables) AS tables",
    ),
    database.query<RecentOrder>(
      "SELECT o.id, t.name AS table_name, o.status, o.created_at, " +
      "jsonb_agg(jsonb_build_object(\'name\', i.name_snapshot, \'quantity\', i.quantity) ORDER BY i.created_at, i.id) AS items " +
      "FROM (SELECT id, table_id, status, created_at FROM orders ORDER BY created_at DESC, id DESC LIMIT 10) o " +
      "JOIN restaurant_tables t ON t.id = o.table_id JOIN order_items i ON i.order_id = o.id " +
      "GROUP BY o.id, t.name, o.status, o.created_at ORDER BY o.created_at DESC, o.id DESC",
    ),
  ]);
  const summary = summaryResult.rows[0];
  const metrics = [
    { label: "ออร์เดอร์วันนี้", value: summary.today_orders, Icon: ClipboardList },
    { label: "รอทำ", value: summary.waiting_orders, Icon: Clock },
    { label: "เมนูเปิดขาย", value: summary.active_menu, Icon: UtensilsCrossed },
    { label: "โต๊ะทั้งหมด", value: summary.tables, Icon: Armchair },
  ];
  const time = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <section>
      <div className={styles.sectionHeading}>
        <h1 lang="en">Overview</h1>
        <p>ข้อมูล ณ {time.format(new Date())}</p>
      </div>
      <dl className={styles.metrics}>
        {metrics.map(({ label, value, Icon }) => <div key={label} className={styles.metric}>
          <dt><Icon size={20} strokeWidth={1.75} aria-hidden="true" />{label}</dt>
          <dd>{value}</dd>
        </div>)}
      </dl>
      <section className={styles.recentOrders}>
        <div className={styles.sectionHeading}><h2>ออร์เดอร์ล่าสุด</h2></div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead><tr>
              <th scope="col">เวลา</th><th scope="col">โต๊ะ</th>
              <th scope="col">รายการอาหาร</th><th scope="col">สถานะ</th>
            </tr></thead>
            <tbody>
              {ordersResult.rows.map(order => <tr key={order.id}>
                <td className={styles.orderTime}>{time.format(new Date(order.created_at))}</td>
                <th scope="row" className={styles.tableNumber}>{order.table_name}</th>
                <td><ul className={styles.orderItems}>
                  {order.items.map((item, index) => <li key={index}><strong>{item.quantity}</strong> × {item.name}</li>)}
                </ul></td>
                <td className={styles.orderStatus}>{statusLabels[order.status] ?? order.status}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
