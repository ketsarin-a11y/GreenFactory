import { getCurrentUser } from "@/lib/auth";
import { getEquipmentList, getTodayUsageTotals } from "@/lib/record-queries";
import RecordPage from "@/components/operator/Recordpage";

export const dynamic = "force-dynamic";

interface OperatorRecordPageProps {
  searchParams: Promise<{ equipment?: string; category?: string }>;
}

export default async function OperatorRecordPage({ searchParams }: OperatorRecordPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const initialEquipmentId = params.equipment ? Number(params.equipment) : null;
  // category มาจากปุ่มในการ์ด "งานที่ต้องบันทึกวันนี้" ที่หน้าแรก เช่น "electricity", "water"
  const initialResourceType = params.category ? params.category.toUpperCase() : null;

  const [equipmentList, todayTotals] = await Promise.all([
    getEquipmentList(user!.companyId),
    getTodayUsageTotals(user!.companyId),
  ]);

  return (
    <RecordPage
      equipmentList={equipmentList}
      todayTotals={todayTotals}
      currentUser={{ id: user!.id, name: user!.name }}
      initialEquipmentId={Number.isFinite(initialEquipmentId) ? initialEquipmentId : null}
      initialResourceType={initialResourceType}
    />
  );
}