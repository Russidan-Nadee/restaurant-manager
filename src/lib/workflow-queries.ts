import "server-only";
import { getDatabase } from "@/lib/db";
import type { FoodWorkItem, ServiceTable, WorkflowStatus } from "@/lib/workflow-types";

export async function getWorkflowStatuses(): Promise<WorkflowStatus[]> {
  const result = await getDatabase().query<WorkflowStatus>(
    'SELECT s.id, s.scope, s.code, s.label, s.sort_order AS "sortOrder", s.is_required AS "isRequired", ' +
    '(s.sort_order = max(s.sort_order) OVER (PARTITION BY s.scope)) AS "isTerminal", ' +
    'CASE WHEN s.scope = \'table\' THEN EXISTS (SELECT 1 FROM restaurant_tables t WHERE t.status_id = s.id AND t.is_active) ' +
    'ELSE EXISTS (SELECT 1 FROM order_items i JOIN orders o ON o.id = i.order_id ' +
    'JOIN table_sessions ts ON ts.id = o.session_id WHERE i.status_id = s.id AND ts.closed_at IS NULL) END AS "inUse" ' +
    'FROM restaurant_statuses s WHERE s.deleted_at IS NULL ORDER BY s.scope, s.sort_order, s.id',
  );
  return result.rows;
}

export async function getFoodWorkItems(): Promise<FoodWorkItem[]> {
  const result = await getDatabase().query<Omit<FoodWorkItem, "createdAt"> & { createdAt: Date }>(
    'SELECT i.id, o.id AS "orderId", t.name AS "tableCode", i.name_snapshot AS name, i.quantity, ' +
    'i.protein_snapshot AS protein, i.is_special AS "isSpecial", i.subtotal::text AS "lineTotal", s.id AS "statusId", s.label AS "statusLabel", ' +
    'n.id AS "nextStatusId", n.label AS "nextStatusLabel", i.created_at AS "createdAt" ' +
    'FROM order_items i JOIN orders o ON o.id = i.order_id ' +
    'JOIN table_sessions ts ON ts.id = o.session_id AND ts.closed_at IS NULL ' +
    'JOIN restaurant_tables t ON t.id = ts.table_id JOIN restaurant_statuses s ON s.id = i.status_id ' +
    'LEFT JOIN LATERAL (SELECT id, label FROM restaurant_statuses ' +
    'WHERE scope = \'food\' AND deleted_at IS NULL AND sort_order > s.sort_order ORDER BY sort_order, id LIMIT 1) n ON true ' +
    'ORDER BY o.created_at, o.id, i.created_at, i.id',
  );
  return result.rows.map(item => ({ ...item, createdAt: item.createdAt.toISOString() }));
}

export async function getServiceTables(): Promise<ServiceTable[]> {
  const [statusRows, result, items] = await Promise.all([
    getWorkflowStatuses(),
    getDatabase().query<{ id: string; name: string; stateToken: string; statusId: string; sessionId: string | null; totalAmount: string }>(
      'SELECT t.id, t.name, t.state_token AS "stateToken", t.status_id AS "statusId", ts.id AS "sessionId", ' +
      'COALESCE((SELECT sum(o.total_amount) FROM orders o WHERE o.session_id = ts.id), 0)::text AS "totalAmount" FROM restaurant_tables t ' +
      'LEFT JOIN table_sessions ts ON ts.table_id = t.id AND ts.closed_at IS NULL ' +
      'WHERE t.is_active AND t.name ~ \'^[0-9]{3}$\' ORDER BY t.name',
    ),
    getFoodWorkItems(),
  ]);
  const statuses = statusRows.filter(status => status.scope === "table");
  const byTable = new Map<string, FoodWorkItem[]>();
  for (const item of items) {
    const group = byTable.get(item.tableCode) ?? [];
    group.push(item);
    byTable.set(item.tableCode, group);
  }
  return result.rows.map(table => {
    const index = statuses.findIndex(status => status.id === table.statusId);
    if (index < 0) throw new Error("Table status configuration is unavailable.");
    const status = statuses[index];
    const next = statuses[(index + 1) % statuses.length];
    const tableItems = byTable.get(table.name) ?? [];
    const blocked = status.code !== "free" && tableItems.some(item => item.nextStatusId !== null);
    return {
      ...table, statusLabel: status.label, occupied: status.code !== "free",
      nextStatusId: next.id, nextStatusLabel: next.label, canAdvance: !blocked,
      blockedReason: blocked ? "ยังมีอาหารที่ไม่จบรายการ" : null, items: tableItems,
    };
  });
}
