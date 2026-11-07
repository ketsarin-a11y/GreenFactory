import { PageHeader } from "@/components/app/page-header";
import { Pagination, pageParam } from "@/components/data/pagination";
import { UrlFilters } from "@/components/data/url-filters";
import { CONNECTION } from "@/components/data/status-badge";
import { SummaryStrip } from "@/components/company/summary-strip";
import { LiveRefresh } from "@/components/company/live-refresh";
import { requireTenantUser } from "@/server/auth/current-user";
import { connectionSummary, machineOptions, sensorsWithStatus } from "@/server/queries/company/sensors";
import { sensorTypeOptions } from "@/server/queries/company/options";
import { fmtNum, num } from "@/lib/format";
import { bkkDay } from "@/lib/time";
import { SensorsView, type SensorRow } from "./_components/sensors-view";

const PAGE = 15;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export default async function Page({ searchParams }: PageProps<"/company/sensors">) {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const q = str(sp.q), type = Number(str(sp.type)) || undefined, machine = Number(str(sp.machine)) || undefined, conn = str(sp.connection);
  const [all, machines, types] = await Promise.all([sensorsWithStatus(user), machineOptions(user), sensorTypeOptions()]);
  const summary = connectionSummary(all);
  const needle = q?.toLowerCase();
  const filtered = all.filter((s) =>
    (!needle || [s.sensorCode, s.sensorName, s.serialNumber, s.manufacturer, s.machine.machineCode, s.machine.machineName].some((v) => v?.toLowerCase().includes(needle))) &&
    (!type || s.sensorTypeId === type) && (!machine || s.machineId === machine) && (!conn || s.connection === conn));
  const day = (d: Date | null) => (d ? bkkDay(d) : null);
  const rows: SensorRow[] = filtered.slice((page - 1) * PAGE, page * PAGE).map((s) => ({
    id: s.sensorId, machineId: s.machineId, sensorTypeId: s.sensorTypeId, sensorCode: s.sensorCode, sensorName: s.sensorName,
    serialNumber: s.serialNumber, manufacturer: s.manufacturer, protocol: s.protocol, connectionAddress: s.connectionAddress, dataTopic: s.dataTopic,
    samplingIntervalSeconds: s.samplingIntervalSeconds, installationDate: day(s.installationDate), lastCalibrationDate: day(s.lastCalibrationDate),
    nextCalibrationDate: day(s.nextCalibrationDate), status: s.status, connection: s.connection, typeName: s.sensorType.sensorTypeName,
    machineCode: s.machine.machineCode, machineName: s.machine.machineName, factory: s.machine.productionLine.department.building.factory.factoryName,
    lastConnectedAt: s.lastConnectedAt?.toISOString() ?? null,
    hasToken: s.ingestTokenHash !== null,
    latest: s.latest && { raw: num(s.latest.rawValue), processed: s.latest.processedValue === null ? null : num(s.latest.processedValue), unit: s.latest.unit.symbol, quality: s.latest.qualityStatus, measuredAt: s.latest.measuredAt.toISOString() },
  }));
  const withToken = all.filter((s) => s.ingestTokenHash !== null).length;

  return (
    <>
      <LiveRefresh seconds={30} />
      <PageHeader title="เซนเซอร์ IoT" description="สถานะคำนวณจากเวลาที่เซนเซอร์ส่งข้อมูลล่าสุดเทียบกับรอบการอ่านค่า หน้านี้อัปเดตเองทุก 30 วินาที" />
      <SummaryStrip
        items={[
          { label: "เชื่อมต่อ", value: fmtNum(summary.ONLINE), unit: `จาก ${fmtNum(summary.total)} ตัว` },
          { label: "ออฟไลน์", value: fmtNum(summary.OFFLINE), tone: summary.OFFLINE ? "attention" : "default" },
          { label: "ผิดปกติ", value: fmtNum(summary.FAULT), tone: summary.FAULT ? "attention" : "default" },
          { label: "บำรุงรักษาหรือปิดใช้งาน", value: fmtNum(summary.MAINTENANCE) },
          { label: "มี token อุปกรณ์", value: fmtNum(withToken), unit: `จาก ${fmtNum(summary.total)} ตัว` },
        ]}
      />
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: "ค้นหารหัส ชื่อ หมายเลข หรือเครื่องจักร" },
          { type: "select", name: "connection", label: "การเชื่อมต่อ", options: Object.entries(CONNECTION).map(([value, [, label]]) => ({ value, label })) },
          { type: "select", name: "type", label: "ประเภท", options: types },
          { type: "select", name: "machine", label: "เครื่องจักร", options: machines.map(({ value, label }) => ({ value, label })) },
        ]}
      />
      <SensorsView rows={rows} machines={machines} types={types} hasMachines={machines.some((m) => !m.inactive)} appUrl={process.env.NEXT_PUBLIC_APP_URL ?? null} />
      <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE)} total={filtered.length} params={sp} pathname="/company/sensors" />
    </>
  );
}
