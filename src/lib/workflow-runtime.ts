import "server-only";
import type { PoolClient } from "pg";
import { getDatabase } from "@/lib/db";
import { WorkflowInputError } from "@/lib/workflow-status-management";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function idField(form: FormData, key: string): string {
  const value = form.get(key);
  if (typeof value !== "string" || !uuid.test(value)) throw new WorkflowInputError("ข้อมูลสถานะไม่ถูกต้อง กรุณาโหลดหน้าใหม่");
  return value;
}
async function transaction(work: (client: PoolClient) => Promise<void>) {
  const client = await getDatabase().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(16300509)");
    await work(client);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}
type Status = { id: string; code: string | null; sort_order: number };
async function statuses(client: PoolClient, scope: "table" | "food") {
  return (await client.query<Status>("SELECT id, code, sort_order FROM restaurant_statuses WHERE scope = $1 AND deleted_at IS NULL ORDER BY sort_order, id", [scope])).rows;
}
const stale = () => new WorkflowInputError("สถานะเปลี่ยนไปแล้ว กรุณาโหลดหน้าใหม่");

export async function advanceFood(form: FormData): Promise<void> {
  const id = idField(form, "id");
  const expected = idField(form, "expected_status_id");
  const target = idField(form, "target_status_id");
  await transaction(async client => {
    const selected = await client.query<{ status_id: string; order_id: string }>(
      "SELECT i.status_id, i.order_id FROM order_items i JOIN orders o ON o.id = i.order_id " +
      "JOIN table_sessions ts ON ts.id = o.session_id AND ts.closed_at IS NULL " +
      "WHERE i.id = $1 FOR UPDATE OF i", [id],
    );
    const item = selected.rows[0];
    if (!item || item.status_id !== expected) throw stale();
    const flow = await statuses(client, "food");
    const current = flow.findIndex(status => status.id === expected);
    if (current < 0 || flow[current + 1]?.id !== target) throw stale();
    await client.query("UPDATE order_items SET status_id = $2 WHERE id = $1", [id, target]);
    const orderItems = await client.query<{ status_id: string }>("SELECT status_id FROM order_items WHERE order_id = $1", [item.order_id]);
    const final = flow[flow.length - 1];
    const readyIndex = flow.findIndex(status => status.code === "ready");
    const complete = orderItems.rows.every(line => line.status_id === final.id);
    const allReady = orderItems.rows.every(line => flow.findIndex(status => status.id === line.status_id) >= readyIndex);
    await client.query("UPDATE orders SET status = $2 WHERE id = $1", [item.order_id, complete && final.code !== "ready" ? "served" : allReady ? "ready" : "placed"]);
  });
}

export async function advanceTable(form: FormData): Promise<void> {
  const id = idField(form, "id");
  const expected = idField(form, "expected_status_id");
  const target = idField(form, "target_status_id");
  const expectedToken = idField(form, "expected_state_token");
  const expectedSession = form.get("expected_session_id");
  if (typeof expectedSession !== "string" || (expectedSession !== "" && !uuid.test(expectedSession))) throw stale();
  await transaction(async client => {
    const selected = await client.query<{ status_id: string; state_token: string }>("SELECT status_id, state_token FROM restaurant_tables WHERE id = $1 AND is_active FOR UPDATE", [id]);
    if (selected.rows[0]?.status_id !== expected || selected.rows[0]?.state_token !== expectedToken) throw stale();
    const session = (await client.query<{ id: string }>("SELECT id FROM table_sessions WHERE table_id = $1 AND closed_at IS NULL FOR UPDATE", [id])).rows[0];
    if ((session?.id ?? "") !== expectedSession) throw stale();
    const flow = await statuses(client, "table");
    const current = flow.findIndex(status => status.id === expected);
    if (current < 0 || flow[(current + 1) % flow.length]?.id !== target) throw stale();
    if (flow[current].code === "free") {
      if (session) throw stale();
      await client.query("INSERT INTO table_sessions (table_id) VALUES ($1)", [id]);
    } else {
      if (!session) throw stale();
      const food = await statuses(client, "food");
      const pending = await client.query<{ unfinished: boolean }>(
        "SELECT EXISTS (SELECT 1 FROM order_items i JOIN orders o ON o.id = i.order_id WHERE o.session_id = $1 AND i.status_id <> $2) AS unfinished",
        [session.id, food[food.length - 1].id],
      );
      if (pending.rows[0].unfinished) throw new WorkflowInputError("ยังมีอาหารที่ไม่จบรายการ กรุณาจบรายการอาหารให้ครบก่อน");
      if (flow.find(status => status.id === target)?.code === "free") {
        throw new WorkflowInputError("กรุณาบันทึกชำระเงินเพื่อปิดโต๊ะ");
      }
    }
    await client.query("UPDATE restaurant_tables SET status_id = $2, state_token = gen_random_uuid() WHERE id = $1", [id, target]);
  });
}
