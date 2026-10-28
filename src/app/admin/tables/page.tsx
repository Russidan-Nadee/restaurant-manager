import { getDiningTables } from "@/lib/menu";
import TableManager from "./TableManager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminTablesPage() {
  const tables = await getDiningTables();
  return <TableManager tables={tables} />;
}
