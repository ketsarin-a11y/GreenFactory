import { redirect } from "next/navigation";

import ScanPage from "@/components/operator/ScanPage";
import { getEquipmentList } from "@/lib/record-queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OperatorScanPage() {
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

  const equipmentList = await getEquipmentList(session.companyId);

  return <ScanPage equipmentList={equipmentList} />;
}