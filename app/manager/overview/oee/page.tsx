import { redirect } from "next/navigation";

import ManagerPerformanceKpiPage from "@/components/manager/ManagerPerformanceKpiPage";
import { getManagerKpiDashboard } from "@/lib/manager-kpi-queries";
import {
  computeResourceMetrics,
  ENERGY_TYPES,
  WATER_TYPES,
  getManagerAnalyticsFilterOptions,
  type ResourceMetricFilters,
} from "@/lib/manager queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const ago = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const id = (value?: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    building?: string;
    department?: string;
    line?: string;
    machine?: string;
  }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const from = params.from ?? ago(6);
  const to = params.to ?? ago(0);
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T23:59:59.999`);

  const filters: ResourceMetricFilters = {
    buildingId: id(params.building),
    departmentId: id(params.department),
    productionLineId: id(params.line),
    machineId: id(params.machine),
  };

  const [filterOptions, energy, water, gas, nitrogen, kpiDashboard] =
    await Promise.all([
      getManagerAnalyticsFilterOptions(session.companyId),
      computeResourceMetrics(session.companyId, ENERGY_TYPES, start, end, "kWh", filters),
      computeResourceMetrics(session.companyId, WATER_TYPES, start, end, "m³", filters),
      computeResourceMetrics(session.companyId, ["COMPRESSED_AIR"], start, end, "m³", filters),
      computeResourceMetrics(session.companyId, ["NITROGEN"], start, end, "m³", filters),
      getManagerKpiDashboard(session.companyId, start, end),
    ]);

  return (
    <ManagerPerformanceKpiPage
      metrics={{ energy, water, gas, nitrogen }}
      kpiDashboard={kpiDashboard}
      filterOptions={filterOptions}
      selectedFilters={filters}
      dateFrom={from}
      dateTo={to}
    />
  );
}
