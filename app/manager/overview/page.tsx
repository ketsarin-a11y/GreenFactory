
import { redirect } from "next/navigation";
import ManagerAnalyticsPage from "@/components/manager/ManagerAnalyticsPage";
import {
  computeResourceMetrics,
  ENERGY_TYPES,
  WATER_TYPES,
  getManagerAnalyticsFilterOptions,
  type ResourceMetricFilters,
} from "@/lib/manager queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function parseOptionalId(value?: string) {
  if (!value) return undefined;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

interface ManagerAnalyticsRouteProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    building?: string;
    department?: string;
    line?: string;
    machine?: string;
  }>;
}

export default async function ManagerAnalyticsRoute({
  searchParams,
}: ManagerAnalyticsRouteProps) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.roleName !== "MANAGER") redirect("/");
  if (!session.companyId) redirect("/");

  const params = await searchParams;

  const fromStr = params.from ?? defaultDate(6);
  const toStr = params.to ?? defaultDate(0);

  const startDate = new Date(`${fromStr}T00:00:00`);
  const endDate = new Date(`${toStr}T23:59:59`);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    startDate > endDate
  ) {
    redirect("/manager/overview");
  }

  const filters: ResourceMetricFilters = {
    buildingId: parseOptionalId(params.building),
    departmentId: parseOptionalId(params.department),
    productionLineId: parseOptionalId(params.line),
    machineId: parseOptionalId(params.machine),
  };

  const companyId = session.companyId;

  const [
    filterOptions,
    energy,
    water,
    compressedAir,
    gas,
    steam,
    nitrogen,
    diesel,
  ] = await Promise.all([
    getManagerAnalyticsFilterOptions(companyId),
    computeResourceMetrics(
      companyId,
      ENERGY_TYPES,
      startDate,
      endDate,
      "kWh",
      filters,
    ),
    computeResourceMetrics(
      companyId,
      WATER_TYPES,
      startDate,
      endDate,
      "m³",
      filters,
    ),
    computeResourceMetrics(
      companyId,
      ["COMPRESSED_AIR"],
      startDate,
      endDate,
      "m³",
      filters,
    ),
    computeResourceMetrics(
      companyId,
      ["GAS"],
      startDate,
      endDate,
      "m³",
      filters,
    ),
    computeResourceMetrics(
      companyId,
      ["STEAM"],
      startDate,
      endDate,
      "kg",
      filters,
    ),
    computeResourceMetrics(
      companyId,
      ["NITROGEN"],
      startDate,
      endDate,
      "m³",
      filters,
    ),
    computeResourceMetrics(
      companyId,
      ["DIESEL"],
      startDate,
      endDate,
      "L",
      filters,
    ),
  ]);

  return (
    <ManagerAnalyticsPage
      resources={{
        energy,
        water,
        compressedAir,
        gas,
        steam,
        nitrogen,
        diesel,
      }}
      filterOptions={filterOptions}
      selectedFilters={filters}
      dateFrom={fromStr}
      dateTo={toStr}
    />
  );
}
