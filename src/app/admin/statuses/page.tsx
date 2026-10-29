import { getWorkflowStatuses } from "@/lib/workflow-queries";
import StatusManager from "./StatusManager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminStatusesPage() {
  return <StatusManager statuses={await getWorkflowStatuses()} />;
}
