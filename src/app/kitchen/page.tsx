import RestaurantBrand from "@/components/RestaurantBrand";
import { ClipboardList } from "lucide-react";
import { getDatabase } from "@/lib/db";
import KitchenRefresh from "./KitchenRefresh";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type KitchenOrder = {
  id: string;
  table_name: string;
  items: { id: string; name: string; quantity: number }[];
};

export default async function KitchenPage() {
  let orders: KitchenOrder[] = [];
  let unavailable = false;
  try {
    const result = await getDatabase().query<KitchenOrder>(
      "SELECT o.id, t.name AS table_name, " +
      "jsonb_agg(jsonb_build_object('id', i.id, 'name', i.name_snapshot, 'quantity', i.quantity) ORDER BY i.created_at, i.id) AS items " +
      "FROM orders o JOIN restaurant_tables t ON t.id = o.table_id " +
      "JOIN order_items i ON i.order_id = o.id " +
      "WHERE o.status = ANY($1::text[]) " +
      "GROUP BY o.id, t.name, o.created_at ORDER BY o.created_at ASC, o.id ASC",
      [["placed", "preparing"]],
    );
    orders = result.rows;
  } catch {
    unavailable = true;
  }
  const updatedAt = new Date().toLocaleTimeString("th-TH", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Bangkok",
  });

  return (
    <main className={styles.page} lang="th">
      <KitchenRefresh />
      <div className={styles.content}>
        <header className={styles.header}>
          <div>
            <RestaurantBrand />
            <h1 className={styles.title}>
              <ClipboardList size={26} strokeWidth={1.75} aria-hidden="true" />
              ครัว
            </h1>
          </div>
          <p className={styles.updated}>
            {unavailable ? "กำลังลองเชื่อมต่อใหม่" : "อัปเดตล่าสุด " + updatedAt}
            <span>อัปเดตอัตโนมัติทุก 5 วินาที</span>
          </p>
        </header>

        <table className={styles.orders}>
          <caption className={styles.srOnly}>รายการอาหารที่รอทำและกำลังทำ แยกตามออร์เดอร์และโต๊ะ</caption>
          <thead>
            <tr>
              <th scope="col" className={styles.tableColumn}>โต๊ะ</th>
              <th scope="col">เมนู</th>
              <th scope="col" className={styles.quantityColumn}>จำนวน</th>
            </tr>
          </thead>
          {orders.map(order => (
            <tbody key={order.id}>
              {order.items.map((item, index) => (
                <tr key={item.id}>
                  {index === 0 && (
                    <th scope="rowgroup" rowSpan={order.items.length} className={styles.tableNumber}>
                      {order.table_name}
                    </th>
                  )}
                  <td className={styles.menuName}>{item.name}</td>
                  <td className={styles.quantity}>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          ))}
          {orders.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={3} className={styles.empty}>
                  {unavailable ? <p role="alert">โหลดออร์เดอร์ไม่ได้ กำลังลองเชื่อมต่อใหม่</p> : "ยังไม่มีออร์เดอร์เข้าครัว"}
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </main>
  );
}
