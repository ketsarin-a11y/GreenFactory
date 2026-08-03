import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getEquipmentList } from "@/lib/record-queries";
import EquipmentListPage from "@/components/manager/EquipmentListPage";

export const dynamic = "force-dynamic";

export default async function ManagerEquipmentPage() {
  const session = await getSession();

  if (!session || session.roleName !== "MANAGER" || !session.companyId) {
    redirect("/login");
  }
  const equipmentList = await getEquipmentList(session.companyId!);

  return <EquipmentListPage equipmentList={equipmentList} />;
}


