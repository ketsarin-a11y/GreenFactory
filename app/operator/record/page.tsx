import { redirect } from "next/navigation";

import RecordPage from "@/components/operator/Recordpage";
import {
  getMachineList,
  getResourceTypeList,
  getTodayUsageTotals,
} from "@/lib/record-queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

interface OperatorRecordPageProps {
  searchParams: Promise<{
    machineId?: string;
    scanId?: string;

    // รองรับลิงก์เก่าชั่วคราว
    equipment?: string;
    category?: string;
  }>;
}

function parsePositiveInt(value?: string) {
  if (!value) return null;

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : null;
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

  if (session.companyId === null) {
    throw new Error("Operator account does not have a companyId");
  }

  const params = await searchParams;

  const initialMachineId =
    parsePositiveInt(params.machineId) ??
    parsePositiveInt(params.equipment);

  const initialQrScanId =
    params.scanId?.trim() || null;

  const initialResourceCode =
    params.category?.trim().toUpperCase() || null;

  const [machineList, resourceTypes, todayTotals] =
    await Promise.all([
      getMachineList(session.companyId),
      getResourceTypeList(),
      getTodayUsageTotals(session.companyId),
    ]);

  const fullName = `${session.firstName ?? ""} ${
    session.lastName ?? ""
  }`.trim();

  return (
    <RecordPage
      machineList={machineList}
      resourceTypes={resourceTypes}
      todayTotals={todayTotals}
      currentUser={{
        id: session.userId,
        name: fullName || session.email,
      }}
      initialMachineId={initialMachineId}
      initialQrScanId={initialQrScanId}
      initialResourceCode={initialResourceCode}
    />
  );
}