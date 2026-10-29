import "server-only";

import type { PoolClient } from "pg";

import { getDatabase } from "@/lib/db";
import { WorkflowInputError } from "@/lib/workflow-status-management";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PLAIN_MONEY_PATTERN = /^\d+(?:\.\d{1,2})?$/;
const CENTS_PER_UNIT = BigInt(100);

type TableRow = {
  id: string;
  state_token: string;
  status_code: string | null;
};

type SessionRow = { id: string };

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}

function uuidField(form: FormData, field: string, message: string): string {
  const value = form.get(field);
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new WorkflowInputError(message);
  }
  return value;
}

function expectedAmountField(form: FormData): bigint {
  const value = form.get("expected_total_amount");
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 40 ||
    !PLAIN_MONEY_PATTERN.test(value)
  ) {
    throw new WorkflowInputError("ยอดรวมไม่ถูกต้อง");
  }

  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * CENTS_PER_UNIT + BigInt(fraction.padEnd(2, "0"));
}

function moneyToCents(value: string): bigint {
  if (!PLAIN_MONEY_PATTERN.test(value)) throw new Error("Database total is not a supported monetary value.");
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * CENTS_PER_UNIT + BigInt(fraction.padEnd(2, "0"));
}

async function withPaymentTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getDatabase().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(16300509)");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original error and keep database details out of the UI.
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function checkoutTable(form: FormData): Promise<void> {
  const tableId = uuidField(form, "id", "ข้อมูลโต๊ะไม่ถูกต้อง กรุณาโหลดหน้าใหม่");
  const expectedSessionId = uuidField(form, "expected_session_id", "ไม่พบรอบบริการ กรุณาโหลดหน้าใหม่");
  const expectedStateToken = uuidField(form, "expected_state_token", "ข้อมูลโต๊ะเปลี่ยนไปแล้ว กรุณาโหลดหน้าใหม่");
  const expectedTotal = expectedAmountField(form);

  try {
    await withPaymentTransaction(async (client) => {
      const tableResult = await client.query<TableRow>(
        "SELECT t.id, t.state_token, st.code AS status_code " +
          "FROM restaurant_tables AS t " +
          "JOIN restaurant_statuses AS st ON st.id = t.status_id " +
          "  AND st.scope = 'table' AND st.deleted_at IS NULL " +
          "WHERE t.id = $1 AND t.is_active = true " +
          "FOR UPDATE OF t",
        [tableId],
      );
      const table = tableResult.rows[0];
      if (!table) throw new WorkflowInputError("ไม่พบโต๊ะที่ต้องการรับชำระเงิน กรุณาโหลดหน้าใหม่");
      if (table.state_token.toLowerCase() !== expectedStateToken.toLowerCase()) {
        throw new WorkflowInputError("โต๊ะเปลี่ยนไปแล้ว กรุณาโหลดหน้าใหม่");
      }
      if (table.status_code === "free") {
        throw new WorkflowInputError("โต๊ะนี้ว่างอยู่แล้ว กรุณาโหลดหน้าใหม่");
      }

      const sessionResult = await client.query<SessionRow>(
        "SELECT id FROM table_sessions " +
          "WHERE id = $1 AND table_id = $2 AND closed_at IS NULL " +
          "FOR UPDATE",
        [expectedSessionId, tableId],
      );
      const session = sessionResult.rows[0];
      if (!session) throw new WorkflowInputError("รอบบริการเปลี่ยนไปแล้ว กรุณาโหลดหน้าใหม่");

      const existingPayment = await client.query<{ id: string }>(
        "SELECT id FROM table_payments WHERE session_id = $1",
        [session.id],
      );
      if (existingPayment.rows[0]) {
        throw new WorkflowInputError("รอบบริการนี้รับชำระเงินไปแล้ว กรุณาโหลดหน้าใหม่");
      }

      const finalStatusResult = await client.query<{ id: string }>(
        "SELECT id FROM restaurant_statuses " +
          "WHERE scope = 'food' AND deleted_at IS NULL " +
          "ORDER BY sort_order DESC, id DESC LIMIT 1",
      );
      const finalStatusId = finalStatusResult.rows[0]?.id;
      if (!finalStatusId) throw new WorkflowInputError("ยังไม่มีสถานะอาหารที่ใช้งานอยู่");

      const pendingResult = await client.query<{ unfinished: boolean }>(
        "SELECT EXISTS (" +
          "SELECT 1 FROM order_items AS i " +
          "JOIN orders AS o ON o.id = i.order_id " +
          "WHERE o.session_id = $1 AND i.status_id IS DISTINCT FROM $2" +
          ") AS unfinished",
        [session.id, finalStatusId],
      );
      if (pendingResult.rows[0]?.unfinished) {
        throw new WorkflowInputError("ยังมีอาหารที่ไม่จบรายการ กรุณาจบรายการอาหารให้ครบก่อนรับชำระเงิน");
      }

      const totalResult = await client.query<{ total_amount: string }>(
        "SELECT COALESCE(sum(o.total_amount), 0)::text AS total_amount " +
          "FROM orders AS o WHERE o.session_id = $1",
        [session.id],
      );
      const actualTotal = totalResult.rows[0]?.total_amount;
      if (typeof actualTotal !== "string") throw new Error("Database total is unavailable.");
      if (moneyToCents(actualTotal) !== expectedTotal) {
        throw new WorkflowInputError("ยอดรวมเปลี่ยนไปแล้ว กรุณาโหลดหน้าใหม่เพื่อตรวจสอบยอดใหม่");
      }

      await client.query(
        "INSERT INTO table_payments (session_id, amount) VALUES ($1, $2)",
        [session.id, actualTotal],
      );
      await client.query("UPDATE orders SET status = $2 WHERE session_id = $1", [session.id, "paid"]);

      const closeResult = await client.query(
        "UPDATE table_sessions SET closed_at = now() " +
          "WHERE id = $1 AND closed_at IS NULL",
        [session.id],
      );
      if (closeResult.rowCount !== 1) {
        throw new WorkflowInputError("รอบบริการเปลี่ยนไปแล้ว กรุณาโหลดหน้าใหม่");
      }

      const freeStatusResult = await client.query<{ id: string }>(
        "SELECT id FROM restaurant_statuses " +
          "WHERE scope = 'table' AND code = 'free' AND deleted_at IS NULL " +
          "LIMIT 1",
      );
      const freeStatusId = freeStatusResult.rows[0]?.id;
      if (!freeStatusId) throw new WorkflowInputError("ไม่พบสถานะโต๊ะว่าง กรุณาติดต่อผู้ดูแลระบบ");

      const tableUpdate = await client.query(
        "UPDATE restaurant_tables SET status_id = $2, state_token = gen_random_uuid() " +
          "WHERE id = $1 AND is_active = true",
        [tableId, freeStatusId],
      );
      if (tableUpdate.rowCount !== 1) {
        throw new WorkflowInputError("โต๊ะเปลี่ยนไปแล้ว กรุณาโหลดหน้าใหม่");
      }
    });
  } catch (error) {
    if (error instanceof WorkflowInputError) throw error;
    if (isUniqueViolation(error)) {
      throw new WorkflowInputError("รอบบริการนี้รับชำระเงินไปแล้ว กรุณาโหลดหน้าใหม่");
    }
    throw error;
  }
}
