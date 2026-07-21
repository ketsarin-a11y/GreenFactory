import { getCurrentUser } from "@/lib/auth";
import { getEquipmentList } from "@/lib/record-queries";
import ScanPage from "@/components/operator/ScanPage";

export const dynamic = "force-dynamic";

export default async function OperatorScanPage() {
  const user = await getCurrentUser();
  const equipmentList = await getEquipmentList(user!.companyId);

  return <ScanPage equipmentList={equipmentList} />;
}