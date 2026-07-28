import { redirect } from "next/navigation";

import RecordPage from "@/components/operator/Recordpage";
import {
  getEquipmentList,
  getTodayUsageTotals,
} from "@/lib/record-queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

interface OperatorRecordPageProps {
  searchParams: Promise<{
    equipment?: string;
    category?: string;
  }>;
}

export default async function OperatorRecordPage({
  searchParams,
}: OperatorRecordPageProps) {
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

  const params = await searchParams;

  const parsedEquipmentId = params.equipment
    ? Number(params.equipment)
    : null;

  const initialEquipmentId =
    parsedEquipmentId !== null && Number.isFinite(parsedEquipmentId)
      ? parsedEquipmentId
      : null;

  const initialResourceType = params.category
    ? params.category.toUpperCase()
    : null;

  const [equipmentList, todayTotals] = await Promise.all([
    getEquipmentList(session.companyId),
    getTodayUsageTotals(session.companyId),
  ]);

  const fullName = `${session.firstName ?? ""} ${
    session.lastName ?? ""
  }`.trim();

  return (
    <RecordPage
      equipmentList={equipmentList}
      todayTotals={todayTotals}
      currentUser={{
        id: session.userId,
        name: fullName || session.email,
      }}
      initialEquipmentId={initialEquipmentId}
      initialResourceType={initialResourceType}
    />
  );
}