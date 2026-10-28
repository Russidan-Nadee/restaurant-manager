import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  const result = await getDatabase().query<{ tables: number; menu_items: number; orders: number }>(
    `SELECT
      (SELECT count(*)::int FROM restaurant_tables) AS tables,
      (SELECT count(*)::int FROM menu_items WHERE is_active = true) AS menu_items,
      (SELECT count(*)::int FROM orders) AS orders`,
  );
  const summary = result.rows[0];
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-8 px-6 py-20">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Restaurant Manager</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">Menus, tables and orders in one place.</p>
      </div>
      <dl className="grid gap-4 sm:grid-cols-3">
        {[["Tables", summary.tables], ["Available menu items", summary.menu_items], ["Orders", summary.orders]].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <dt className="text-sm text-zinc-600 dark:text-zinc-400">{label}</dt>
            <dd className="mt-2 text-3xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      {summary.menu_items === 0 && <p className="text-sm text-zinc-600 dark:text-zinc-400">No menu items yet.</p>}
    </main>
  );
}
