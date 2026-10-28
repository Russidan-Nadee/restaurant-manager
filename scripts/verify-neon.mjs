import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createDatabaseClient } from "./database-client.mjs";

const baseArgument = process.argv.indexOf("--base-url");
const baseUrl = baseArgument === -1 ? "http://127.0.0.1:3102" : process.argv[baseArgument + 1];
const client = createDatabaseClient();
const tableId = randomUUID();
const categoryId = randomUUID();
const menuId = randomUUID();
const unavailableId = randomUUID();
let connected = false;
const postOrder = body => fetch(new URL("/api/orders", baseUrl), {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

try {
  await client.connect();
  connected = true;
  const health = await fetch(new URL("/api/health", baseUrl));
  assert.equal(health.status, 200);
  assert.equal((await health.json()).services.postgres, "ok");
  console.log("PASS HTTP health -> app -> Neon PostgreSQL");

  await client.query("INSERT INTO restaurant_tables (id, name) VALUES ($1, $2)", [tableId, "Neon verification " + tableId]);
  await client.query("INSERT INTO categories (id, name) VALUES ($1, 'Neon verification')", [categoryId]);
  await client.query("INSERT INTO menu_items (id, category_id, name, price, is_active) VALUES ($1, $2, 'Neon test meal', 125.50, true), ($3, $2, 'Neon unavailable meal', 50, false)", [menuId, categoryId, unavailableId]);

  const home = await fetch(baseUrl);
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.match(html, /Restaurant Manager/);
  const expected = await client.query("SELECT (SELECT count(*)::int FROM restaurant_tables) AS tables, (SELECT count(*)::int FROM menu_items WHERE is_active) AS menu_items, (SELECT count(*)::int FROM orders) AS orders");
  const renderedCounts = [...html.matchAll(/<dd[^>]*>(\d+)<\/dd>/g)].map(match => Number(match[1]));
  assert.deepEqual(renderedCounts, [expected.rows[0].tables, expected.rows[0].menu_items, expected.rows[0].orders]);
  console.log("PASS homepage renders restaurant data from Neon");

  const response = await postOrder({ tableId, items: [{ menuItemId: menuId, quantity: 2, price: 0.01 }] });
  assert.equal(response.status, 201);
  const orderId = (await response.json()).id;
  const saved = await client.query("SELECT total_amount FROM orders WHERE id = $1 AND table_id = $2", [orderId, tableId]);
  assert.equal(Number(saved.rows[0].total_amount), 251);
  const items = await client.query("SELECT name_snapshot, price_snapshot, quantity, subtotal FROM order_items WHERE order_id = $1", [orderId]);
  assert.equal(items.rows.length, 1);
  assert.equal(Number(items.rows[0].price_snapshot), 125.50);
  assert.equal(items.rows[0].quantity, 2);
  assert.equal(Number(items.rows[0].subtotal), 251);
  assert.equal(items.rows[0].name_snapshot, "Neon test meal");
  console.log("PASS HTTP order -> DB write/read: quantity 2 x DB price 125.50 = 251.00; supplied price ignored");

  for (const [label, order] of [
    ["empty cart", { tableId, items: [] }],
    ["invalid quantity", { tableId, items: [{ menuItemId: menuId, quantity: 0 }] }],
    ["unavailable menu", { tableId, items: [{ menuItemId: menuId, quantity: 1 }, { menuItemId: unavailableId, quantity: 1 }] }],
    ["unknown table", { tableId: randomUUID(), items: [{ menuItemId: menuId, quantity: 1 }] }],
  ]) {
    const rejected = await postOrder(order);
    assert.equal(rejected.status, 400, label);
    console.log("PASS rejects " + label);
  }
  const malformed = await fetch(new URL("/api/orders", baseUrl), {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
  });
  assert.equal(malformed.status, 400);
  const count = await client.query("SELECT count(*)::int AS total FROM orders WHERE table_id = $1", [tableId]);
  assert.equal(count.rows[0].total, 1);
  console.log("PASS malformed JSON rejected; rejected orders leave no partial writes");

  await client.query("UPDATE menu_items SET name = 'Renamed meal', price = 200 WHERE id = $1", [menuId]);
  const snapshot = await client.query("SELECT name_snapshot, price_snapshot FROM order_items WHERE order_id = $1", [orderId]);
  assert.equal(snapshot.rows[0].name_snapshot, "Neon test meal");
  assert.equal(Number(snapshot.rows[0].price_snapshot), 125.50);
  console.log("PASS historical item name/price preserved after menu changes");
} catch (error) {
  console.error("Neon verification failed:", error.code || error.name, error.message);
  process.exitCode = 1;
} finally {
  if (connected) {
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM orders WHERE table_id = $1", [tableId]);
      await client.query("DELETE FROM menu_items WHERE id = ANY($1::uuid[])", [[menuId, unavailableId]]);
      await client.query("DELETE FROM categories WHERE id = $1", [categoryId]);
      await client.query("DELETE FROM restaurant_tables WHERE id = $1", [tableId]);
      await client.query("COMMIT");
      console.log("PASS verification fixtures removed");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("Fixture cleanup failed:", error.code || error.name);
      process.exitCode = 1;
    }
  }
  await client.end();
}
