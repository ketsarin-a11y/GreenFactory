import { getCurrentUser } from "@/lib/auth";
import { getAllHistoryRecords, getHistoryFilterOptions } from "@/lib/History queries";
import HistoryPage from "@/components/operator/HistoryPage";

export const dynamic = "force-dynamic";

export default async function OperatorHistoryPage() {
  const user = await getCurrentUser();

  const [records, filterOptions] = await Promise.all([
    getAllHistoryRecords(user!.companyId),
    getHistoryFilterOptions(user!.companyId),
  ]);

  return <HistoryPage records={records} filterOptions={filterOptions} currentUserId={user!.id} />;
}