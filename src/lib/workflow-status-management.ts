import "server-only";

import type { PoolClient } from "pg";

import { getDatabase } from "@/lib/db";
import type { StatusScope } from "@/lib/workflow-types";

const WORKFLOW_STATUS_LOCK_KEY = 16_300_509;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type WorkflowStatusRow = {
  id: string;
  scope: StatusScope;
  code: string | null;
  label: string;
  sort_order: number;
  is_required: boolean;
};

export class WorkflowInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowInputError";
  }
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}

function parseScope(value: FormDataEntryValue | null): StatusScope {
  if (value !== "table" && value !== "food") {
    throw new WorkflowInputError("ประเภทสถานะไม่ถูกต้อง");
  }
  return value;
}

function parseUuid(value: FormDataEntryValue | null, missingMessage: string): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new WorkflowInputError(missingMessage);
  }
  return value;
}

function parseOptionalUuid(value: FormDataEntryValue | null, invalidMessage: string): string | null {
  if (value === null || value === "") return null;
  return parseUuid(value, invalidMessage);
}

function parseLabel(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    throw new WorkflowInputError("ชื่อสถานะต้องมีความยาว 1–60 ตัวอักษร");
  }
  const label = value.trim();
  const labelLength = Array.from(label).length;
  if (labelLength < 1 || labelLength > 60) {
    throw new WorkflowInputError("ชื่อสถานะต้องมีความยาว 1–60 ตัวอักษร");
  }
  return label;
}

function parseDirection(value: FormDataEntryValue | null): "up" | "down" {
  if (value !== "up" && value !== "down") {
    throw new WorkflowInputError("ทิศทางการจัดลำดับไม่ถูกต้อง");
  }
  return value;
}

async function withWorkflowTransaction<T>(operation: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getDatabase().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [WORKFLOW_STATUS_LOCK_KEY]);
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original failure and keep database details out of the UI.
    }
    throw error;
  } finally {
    client.release();
  }
}

async function loadActiveStatuses(client: PoolClient, scope: StatusScope): Promise<WorkflowStatusRow[]> {
  const result = await client.query<WorkflowStatusRow>(
    "SELECT id, scope, code, label, sort_order, is_required " +
      "FROM restaurant_statuses " +
      "WHERE scope = $1 AND deleted_at IS NULL " +
      "ORDER BY sort_order ASC, id ASC " +
      "FOR UPDATE",
    [scope],
  );
  return result.rows;
}

async function findActiveStatus(client: PoolClient, id: string): Promise<WorkflowStatusRow | null> {
  const result = await client.query<WorkflowStatusRow>(
    "SELECT id, scope, code, label, sort_order, is_required " +
      "FROM restaurant_statuses " +
      "WHERE id = $1 AND deleted_at IS NULL " +
      "FOR UPDATE",
    [id],
  );
  return result.rows[0] ?? null;
}

async function renumberActiveStatuses(client: PoolClient, scope: StatusScope): Promise<void> {
  const rows = await loadActiveStatuses(client, scope);
  for (const [index, row] of rows.entries()) {
    const sortOrder = sortOrderFor(scope, index);
    if (row.sort_order === sortOrder) continue;
    await client.query("UPDATE restaurant_statuses SET sort_order = $2 WHERE id = $1", [row.id, sortOrder]);
  }
}

function sortOrderFor(scope: StatusScope, index: number): number {
  return scope === "food" ? (index + 1) * 100 : index * 100;
}

async function renumberStatusesInOrder(client: PoolClient, scope: StatusScope, ids: string[]): Promise<void> {
  for (const [index, id] of ids.entries()) {
    await client.query("UPDATE restaurant_statuses SET sort_order = $2 WHERE id = $1", [id, sortOrderFor(scope, index)]);
  }
}

function sameLabel(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

function isProtectedStatus(status: WorkflowStatusRow): boolean {
  if (status.is_required) return true;
  if (status.scope === "table") return status.code === "free" || status.code === "occupied";
  return status.code === "waiting" || status.code === "ready";
}

function isValidAddAnchor(scope: StatusScope, status: WorkflowStatusRow): boolean {
  if (scope === "table") return status.code === "occupied" || (status.code === null && !status.is_required);
  return status.code === "waiting" || status.code === "ready" || (status.code === null && !status.is_required);
}

function defaultInsertIndex(scope: StatusScope, rows: WorkflowStatusRow[]): number {
  if (scope === "table") return rows.length;

  const readyIndex = rows.findIndex((row) => row.code === "ready");
  return readyIndex >= 0 ? readyIndex + 1 : rows.length;
}


async function statusIsInUse(client: PoolClient, scope: StatusScope, id: string): Promise<boolean> {
  if (scope === "table") {
    const result = await client.query<{ in_use: boolean }>(
      "SELECT EXISTS (" +
        "SELECT 1 FROM restaurant_tables " +
        "WHERE id IS NOT NULL AND is_active = true AND status_id = $1" +
        ") AS in_use",
      [id],
    );
    return result.rows[0]?.in_use ?? false;
  }

  const result = await client.query<{ in_use: boolean }>(
    "SELECT EXISTS (" +
      "SELECT 1 " +
      "FROM order_items AS oi " +
      "JOIN orders AS o ON o.id = oi.order_id " +
      "JOIN table_sessions AS ts ON ts.id = o.session_id " +
      "WHERE oi.status_id = $1 AND ts.closed_at IS NULL" +
      ") AS in_use",
    [id],
  );
  return result.rows[0]?.in_use ?? false;
}

async function hasUnfinishedFood(client: PoolClient, rows: WorkflowStatusRow[]): Promise<boolean> {
  const finalStatusId = rows[rows.length - 1]?.id ?? null;
  const result = await client.query<{ unfinished: boolean }>(
    "SELECT EXISTS (" +
      "SELECT 1 " +
      "FROM order_items AS oi " +
      "JOIN orders AS o ON o.id = oi.order_id " +
      "JOIN table_sessions AS ts ON ts.id = o.session_id " +
      "WHERE ts.closed_at IS NULL " +
      "AND oi.status_id IS DISTINCT FROM $1" +
      ") AS unfinished",
    [finalStatusId],
  );
  return result.rows[0]?.unfinished ?? false;
}

function unfinishedFoodMessage(): WorkflowInputError {
  return new WorkflowInputError("มีอาหารค้างอยู่ กรุณาจบรายการก่อนปรับขั้นตอน");
}

function finalFoodInUseMessage(): WorkflowInputError {
  return new WorkflowInputError("มีอาหารที่ใช้สถานะสุดท้ายอยู่ กรุณาปิดโต๊ะก่อนปรับขั้นตอน");
}

async function insertPositionedStatus(
  client: PoolClient,
  scope: StatusScope,
  label: string,
  rows: WorkflowStatusRow[],
  insertionIndex: number,
): Promise<void> {
  const result = await client.query<{ id: string }>(
    "INSERT INTO restaurant_statuses " +
      "(id, scope, code, label, sort_order, is_required, deleted_at) " +
      "VALUES (gen_random_uuid(), $1, NULL, $2, $3, false, NULL) RETURNING id",
    [scope, label, sortOrderFor(scope, rows.length)],
  );
  const insertedId = result.rows[0]?.id;
  if (!insertedId) throw new Error("Unable to create workflow status.");
  const orderedIds = rows.map((row) => row.id);
  orderedIds.splice(insertionIndex, 0, insertedId);
  await renumberStatusesInOrder(client, scope, orderedIds);
}

export async function addWorkflowStatus(form: FormData): Promise<void> {
  const scope = parseScope(form.get("scope"));
  const label = parseLabel(form.get("label"));
  const afterId = parseOptionalUuid(form.get("after_id"), "ตำแหน่งสถานะเดิมไม่ถูกต้อง");

  try {
    await withWorkflowTransaction(async (client) => {
      const rows = await loadActiveStatuses(client, scope);
      if (rows.some((row) => sameLabel(row.label, label))) {
        throw new WorkflowInputError("มีสถานะชื่อนี้อยู่แล้ว");
      }
      if (scope === "food" && (await hasUnfinishedFood(client, rows))) {
        throw unfinishedFoodMessage();
      }

      let insertionIndex = defaultInsertIndex(scope, rows);
      if (afterId !== null) {
        const anchorIndex = rows.findIndex((row) => row.id === afterId);
        if (anchorIndex < 0) {
          throw new WorkflowInputError("ตำแหน่งสถานะเดิมเปลี่ยนไปแล้ว กรุณาโหลดหน้าใหม่");
        }
        const anchor = rows[anchorIndex];
        if (!isValidAddAnchor(scope, anchor)) {
          throw new WorkflowInputError(
            scope === "table"
              ? "สถานะโต๊ะใหม่ต้องอยู่หลังสถานะว่างและมีลูกค้า"
              : "ตำแหน่งสถานะอาหารไม่ถูกต้อง กรุณาโหลดหน้าใหม่",
          );
        }
        insertionIndex = anchorIndex + 1;
      }

      if (scope === "food" && insertionIndex === rows.length) {
        const finalStatus = rows[rows.length - 1];
        if (finalStatus && (await statusIsInUse(client, scope, finalStatus.id))) {
          throw finalFoodInUseMessage();
        }
      }

      await insertPositionedStatus(client, scope, label, rows, insertionIndex);
    });
  } catch (error) {
    if (error instanceof WorkflowInputError) throw error;
    if (isUniqueViolation(error)) throw new WorkflowInputError("มีสถานะชื่อนี้อยู่แล้ว");
    throw error;
  }
}

export async function removeWorkflowStatus(form: FormData): Promise<void> {
  const id = parseUuid(form.get("id"), "ไม่พบสถานะที่ต้องการลบ กรุณาโหลดหน้าใหม่");

  await withWorkflowTransaction(async (client) => {
    const selected = await findActiveStatus(client, id);
    if (!selected) throw new WorkflowInputError("ไม่พบสถานะที่ต้องการลบ กรุณาโหลดหน้าใหม่");

    const rows = await loadActiveStatuses(client, selected.scope);
    if (!rows.some((row) => row.id === id)) {
      throw new WorkflowInputError("ข้อมูลสถานะเปลี่ยนไปแล้ว กรุณาโหลดหน้าใหม่");
    }
    if (isProtectedStatus(selected)) {
      throw new WorkflowInputError("ไม่สามารถลบสถานะเริ่มต้นของระบบได้");
    }
    if (selected.scope === "food" && (await hasUnfinishedFood(client, rows))) {
      throw unfinishedFoodMessage();
    }
    if (await statusIsInUse(client, selected.scope, id)) {
      throw new WorkflowInputError(
        selected.scope === "table"
          ? "ลบสถานะไม่ได้ เพราะมีโต๊ะที่ใช้งานสถานะนี้อยู่"
          : "ลบสถานะไม่ได้ เพราะมีรายการอาหารที่กำลังดำเนินการอยู่",
      );
    }

    const result = await client.query(
      "UPDATE restaurant_statuses SET deleted_at = now() " +
        "WHERE id = $1 AND deleted_at IS NULL",
      [id],
    );
    if (result.rowCount !== 1) {
      throw new WorkflowInputError("ข้อมูลสถานะเปลี่ยนไปแล้ว กรุณาโหลดหน้าใหม่");
    }
    await renumberActiveStatuses(client, selected.scope);
  });
}

function isMovableTarget(scope: StatusScope, target: WorkflowStatusRow): boolean {
  if (scope === "table") return target.code === null && !target.is_required;
  return target.code === "ready" || (target.code === null && !target.is_required);
}

export async function moveWorkflowStatus(form: FormData): Promise<void> {
  const id = parseUuid(form.get("id"), "ไม่พบสถานะที่ต้องการจัดลำดับ");
  const direction = parseDirection(form.get("direction"));
  const expectedNeighborId = parseUuid(
    form.get("expected_neighbor_id"),
    "ข้อมูลตำแหน่งสถานะไม่ถูกต้อง กรุณาโหลดหน้าใหม่",
  );

  await withWorkflowTransaction(async (client) => {
    const selected = await findActiveStatus(client, id);
    if (!selected) throw new WorkflowInputError("ไม่พบสถานะที่ต้องการจัดลำดับ กรุณาโหลดหน้าใหม่");
    if (selected.code !== null || selected.is_required) {
      throw new WorkflowInputError("ไม่สามารถย้ายสถานะเริ่มต้นของระบบได้");
    }

    const rows = await loadActiveStatuses(client, selected.scope);
    const selectedIndex = rows.findIndex((row) => row.id === id);
    if (selectedIndex < 0) {
      throw new WorkflowInputError("ข้อมูลสถานะเปลี่ยนไปแล้ว กรุณาโหลดหน้าใหม่");
    }

    const neighborIndex = direction === "up" ? selectedIndex - 1 : selectedIndex + 1;
    if (neighborIndex < 0 || neighborIndex >= rows.length) {
      throw new WorkflowInputError(
        direction === "up" ? "สถานะนี้อยู่บนสุดของรายการแล้ว" : "สถานะนี้อยู่ล่างสุดของรายการแล้ว",
      );
    }

    const neighbor = rows[neighborIndex];
    if (neighbor.id !== expectedNeighborId) {
      throw new WorkflowInputError("ข้อมูลตำแหน่งสถานะเปลี่ยนไปแล้ว กรุณาโหลดหน้าใหม่");
    }
    if (!isMovableTarget(selected.scope, neighbor)) {
      throw new WorkflowInputError(
        selected.scope === "table"
          ? "สถานะโต๊ะเริ่มต้นต้องอยู่ด้านบนและไม่สามารถสลับตำแหน่งได้"
          : "สถานะอาหารนี้ไม่สามารถย้ายข้ามสถานะรอทำได้",
      );
    }
    if (selected.scope === "food" && (selectedIndex === rows.length - 1 || neighborIndex === rows.length - 1)) {
      const finalStatus = rows[rows.length - 1];
      if (finalStatus && (await statusIsInUse(client, selected.scope, finalStatus.id))) {
        throw finalFoodInUseMessage();
      }
    }
    if (selected.scope === "food" && (await hasUnfinishedFood(client, rows))) {
      throw unfinishedFoodMessage();
    }

    const reordered = [...rows];
    [reordered[selectedIndex], reordered[neighborIndex]] = [reordered[neighborIndex], reordered[selectedIndex]];
    for (const [index, row] of reordered.entries()) {
      const sortOrder = sortOrderFor(selected.scope, index);
      if (row.sort_order === sortOrder) continue;
      await client.query("UPDATE restaurant_statuses SET sort_order = $2 WHERE id = $1", [row.id, sortOrder]);
    }
  });
}
