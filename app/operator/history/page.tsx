import { redirect } from "next/navigation";

import HistoryPage from "@/components/operator/HistoryPage";
import {
  getAllHistoryRecords,
  getHistoryFilterOptions,
} from "@/lib/History queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OperatorHistoryPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.roleName !== "OPERATOR") {
    redirect("/");
  }

  if (!session.companyId) {
    throw new Error("Operator account does not have a companyId");
  }

  const [records, filterOptions] = await Promise.all([
    getAllHistoryRecords(session.companyId),
    getHistoryFilterOptions(session.companyId),
  ]);

  return (
    <HistoryPage
      records={records}
      filterOptions={filterOptions}
      currentUserId={session.userId}
    />
  );
}