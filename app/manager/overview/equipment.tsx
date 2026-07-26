import { getCurrentUser } from "@/lib/auth";
import { getEquipmentList } from "@/lib/record-queries";
import EquipmentListPage from "@/components/manager/EquipmentListPage";

export const dynamic = "force-dynamic";

export default async function ManagerEquipmentPage() {
  const user = await getCurrentUser();
  const equipmentList = await getEquipmentList(user!.companyId);

  return <EquipmentListPage equipmentList={equipmentList} />;
}