import { getAdminDiningTables } from "@/lib/table-management";
import TableManager from "./TableManager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminTablesPage() {
  const tables = await getAdminDiningTables();
  return <TableManager tables={tables} />;
}
