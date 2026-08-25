"use client";

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Eye,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Trash2,
  Wrench,
  WifiOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import SensorDeleteDialog from "./SensorDeleteDialog";
import SensorDetail from "./SensorDetail";
import SensorDrawer from "./SensorDrawer";
import SensorTable from "./SensorTable";
import type {
  MachineOption,
  SensorItem,
  SensorTypeOption,
  SensorsApiResponse,
} from "./sensor-data";

const PAGE_SIZE = 7;

export default function SensorsPageClient() {
  const [sensors, setSensors] = useState<SensorItem[]>([]);
  const [machines, setMachines] = useState<MachineOption[]>([]);
  const [sensorTypes, setSensorTypes] = useState<SensorTypeOption[]>([]);

  const [selectedSensor, setSelectedSensor] = useState<SensorItem | null>(null);
  const [editingSensor, setEditingSensor] = useState<SensorItem | null>(null);
  const [deletingSensor, setDeletingSensor] = useState<SensorItem | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuId, setMenuId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [machineFilter, setMachineFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [summary, setSummary] = useState({
    total: 0,
    online: 0,
    offline: 0,
    maintenance: 0,
    fault: 0,
  });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/company/sensors", {
        cache: "no-store",
        credentials: "include",
      });

      const result = (await response.json()) as SensorsApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "ไม่สามารถโหลดข้อมูลเซนเซอร์ได้");
      }

      const nextSensors = result.data ?? [];
      setSensors(nextSensors);
      setMachines(result.machines ?? []);
      setSensorTypes(result.sensorTypes ?? []);
      setSummary(
        result.summary ?? {
          total: 0,
          online: 0,
          offline: 0,
          maintenance: 0,
          fault: 0,
        },
      );

      setSelectedSensor((current) => {
        if (!nextSensors.length) return null;
        if (!current) return nextSensors[0];
        return nextSensors.find((item) => item.id === current.id) ?? nextSensors[0];
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถโหลดข้อมูลเซนเซอร์ได้",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredSensors = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return sensors.filter((sensor) => {
      const matchesSearch =
        !keyword ||
        sensor.code.toLowerCase().includes(keyword) ||
        sensor.name.toLowerCase().includes(keyword) ||
        sensor.machine.name.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        sensor.connectionStatus === statusFilter;

      const matchesType =
        typeFilter === "ALL" ||
        String(sensor.type.id) === typeFilter;

      const matchesMachine =
        machineFilter === "ALL" ||
        String(sensor.machine.id) === machineFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesMachine
      );
    });
  }, [
    sensors,
    search,
    statusFilter,
    typeFilter,
    machineFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSensors.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const visibleSensors = filteredSensors.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  async function saveSensor(
    payload: Record<string, unknown>,
  ) {
    try {
      setBusy(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        editingSensor
          ? `/api/company/sensors/${editingSensor.id}`
          : "/api/company/sensors",
        {
          method: editingSensor ? "PATCH" : "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = (await response.json()) as SensorsApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "บันทึกเซนเซอร์ไม่สำเร็จ",
        );
      }

      setSuccess(
        result.message ?? "บันทึกเซนเซอร์เรียบร้อยแล้ว",
      );
      setDrawerOpen(false);
      setEditingSensor(null);
      setPage(1);
      await load();
      window.setTimeout(() => setSuccess(""), 3000);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "บันทึกเซนเซอร์ไม่สำเร็จ",
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deletingSensor) return;

    try {
      setBusy(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/company/sensors/${deletingSensor.id}`,
        {
          method: "DELETE",
          credentials: "include",
          cache: "no-store",
        },
      );

      const result = (await response.json()) as SensorsApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "ดำเนินการไม่สำเร็จ",
        );
      }

      setSuccess(
        result.message ?? "ดำเนินการเรียบร้อยแล้ว",
      );
      setDeletingSensor(null);
      setMenuId(null);
      await load();
      window.setTimeout(() => setSuccess(""), 3000);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ดำเนินการไม่สำเร็จ",
      );
    } finally {
      setBusy(false);
    }
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setMachineFilter("ALL");
    setPage(1);
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[1750px] px-1 pb-10 sm:px-0">
        <header className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-emerald-700 sm:px-4 sm:py-2 sm:text-[11px]">
              <Radio className="h-4 w-4" />
              Live Sensor Registry
            </div>

            <h1 className="mt-3 text-[30px] font-bold tracking-[-0.04em] text-[#182334] sm:text-[34px] lg:text-[36px]">
              เซนเซอร์
            </h1>

            <p className="mt-2 max-w-[850px] text-[12px] leading-6 text-[#7f8997] sm:text-[13px] lg:text-[14px]">
              จัดการเซนเซอร์จริงของบริษัท เชื่อมกับเครื่องจักรและโครงสร้างโรงงาน
              โดยประเภทเซนเซอร์อ้างอิงจาก Master Data ของ Platform Admin
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingSensor(null);
              setDrawerOpen(true);
            }}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#1f8f62] px-5 text-[12px] font-semibold text-white shadow-lg transition hover:bg-[#197a54] sm:w-auto sm:text-[13px]"
          >
            <Plus className="h-4 w-4" />
            เพิ่มเซนเซอร์
          </button>
        </header>

        {(error || success) && (
          <div
            className={`mt-5 rounded-[13px] border px-4 py-3 text-[13px] font-medium ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || success}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 xl:grid-cols-5">
          {(
            [
              {
                label: "เซนเซอร์ทั้งหมด",
                value: summary.total,
                Icon: Radio,
                iconClass: "bg-[#e8f5ed] text-[#2d8057]",
              },
              {
                label: "เชื่อมต่อปกติ",
                value: summary.online,
                Icon: CircleDot,
                iconClass: "bg-[#e8f1ff] text-[#4b6db0]",
              },
              {
                label: "ออฟไลน์",
                value: summary.offline,
                Icon: WifiOff,
                iconClass: "bg-[#fff4df] text-[#a06c17]",
              },
              {
                label: "บำรุงรักษา",
                value: summary.maintenance,
                Icon: Wrench,
                iconClass: "bg-[#f3efff] text-[#7256bd]",
              },
              {
                label: "ผิดปกติ",
                value: summary.fault,
                Icon: AlertTriangle,
                iconClass: "bg-[#fff0f0] text-[#c04e4e]",
              },
            ] satisfies Array<{
              label: string;
              value: number;
              Icon: LucideIcon;
              iconClass: string;
            }>
          ).map(({ label, value, Icon, iconClass }) => (
            <article
              key={label}
              className="rounded-[16px] border border-[#e2e8e5] bg-white p-3.5 shadow-[0_8px_24px_rgba(31,73,55,0.05)] transition sm:rounded-[18px] sm:p-4 lg:p-5 lg:hover:-translate-y-0.5 lg:hover:shadow-[0_14px_32px_rgba(31,73,55,0.08)]"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] sm:h-10 sm:w-10 sm:rounded-[11px] ${iconClass}`}
                >
                  <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                </span>

                <div>
                  <p className="text-[10px] font-medium text-[#778493] sm:text-[11px]">
                    {label}
                  </p>
                  <p className="mt-1 text-[22px] font-bold text-[#283548] sm:text-[24px]">
                    {value.toLocaleString("th-TH")}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 flex flex-col overflow-hidden rounded-[18px] border border-[#dfe7e3] bg-white shadow-[0_10px_32px_rgba(31,73,55,0.06)] xl:flex-row xl:rounded-[20px]">
          <div className="min-w-0 flex-1">
            <div className="border-b border-[#e7ebef] p-3 sm:p-4">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_1fr_1fr_auto] xl:gap-3">
                <div className="flex h-[44px] items-center gap-3 rounded-[10px] border border-[#dfe5eb] bg-white px-3 sm:col-span-2 sm:px-4 xl:col-span-1">
                  <Search className="h-3.5 w-3.5 text-[#8b96a4]" />
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="ค้นหารหัส ชื่อ หรือเครื่องจักร..."
                    className="min-w-0 flex-1 bg-transparent text-[12px] outline-none sm:text-[13px]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-[44px] min-w-0 rounded-[10px] border border-[#dfe5eb] bg-white px-3 text-[12px] font-medium text-[#596677] sm:px-4 sm:text-[13px]"
                >
                  <option value="ALL">ทุกสถานะ</option>
                  <option value="ONLINE">เชื่อมต่อ</option>
                  <option value="OFFLINE">ออฟไลน์</option>
                  <option value="MAINTENANCE">บำรุงรักษา</option>
                  <option value="FAULT">ผิดปกติ</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(event) => {
                    setTypeFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-[44px] min-w-0 rounded-[10px] border border-[#dfe5eb] bg-white px-3 text-[12px] font-medium text-[#596677] sm:px-4 sm:text-[13px]"
                >
                  <option value="ALL">ทุกประเภท</option>
                  {sensorTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>

                <select
                  value={machineFilter}
                  onChange={(event) => {
                    setMachineFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-[44px] min-w-0 rounded-[10px] border border-[#dfe5eb] bg-white px-3 text-[12px] font-medium text-[#596677] sm:px-4 sm:text-[13px]"
                >
                  <option value="ALL">ทุกเครื่องจักร</option>
                  {machines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#dfe5eb] bg-white px-4 text-[12px] font-medium text-[#596677] sm:text-[13px]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  ล้างตัวกรอง
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid min-h-[360px] place-items-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <SensorTable
                    sensors={visibleSensors}
                    startIndex={(currentPage - 1) * PAGE_SIZE}
                    selectedId={selectedSensor?.id ?? null}
                    menuId={menuId}
                    onSelect={setSelectedSensor}
                    onToggleMenu={(sensorId) =>
                      setMenuId((current) =>
                        current === sensorId ? null : sensorId,
                      )
                    }
                    onEdit={(sensor) => {
                      setEditingSensor(sensor);
                      setDrawerOpen(true);
                      setMenuId(null);
                    }}
                    onDelete={(sensor) => {
                      setDeletingSensor(sensor);
                      setMenuId(null);
                    }}
                  />
                </div>

                <div className="md:hidden">
                  <MobileSensorCards
                    sensors={visibleSensors}
                    selectedId={selectedSensor?.id ?? null}
                    onSelect={setSelectedSensor}
                    onEdit={(sensor) => {
                      setEditingSensor(sensor);
                      setDrawerOpen(true);
                    }}
                    onDelete={setDeletingSensor}
                  />
                </div>

                {visibleSensors.length === 0 && (
                  <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                    <Radio className="h-9 w-9 text-[#9aa4af]" />
                    <p className="mt-3 text-[15px] font-semibold text-[#566274]">
                      ยังไม่มีเซนเซอร์จริงในบริษัท
                    </p>
                    <p className="mt-1 text-[12px] text-[#9aa4af]">
                      กด “เพิ่มเซนเซอร์” เพื่อเชื่อมกับเครื่องจักรที่มีอยู่
                    </p>
                  </div>
                )}
              </>
            )}

            <footer className="flex flex-col gap-3 border-t border-[#e8ecf0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] text-[#7f8a98]">
                แสดง {visibleSensors.length} จาก{" "}
                {filteredSensors.length} รายการ
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setPage((value) =>
                      Math.max(1, value - 1),
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#dfe5eb] text-[#6f7b8a] disabled:opacity-35"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="min-w-[64px] text-center text-[12px] font-medium text-[#6f7b8a]">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((value) =>
                      Math.min(totalPages, value + 1),
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#dfe5eb] text-[#6f7b8a] disabled:opacity-35"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </footer>
          </div>

          <div className="hidden xl:block">
            <SensorDetail
              sensor={selectedSensor}
              onClose={() => setSelectedSensor(null)}
            />
          </div>
        </div>

        {selectedSensor && (
          <div className="mt-4 overflow-hidden rounded-[18px] border border-[#dfe7e3] bg-white xl:hidden">
            <SensorDetail
              sensor={selectedSensor}
              onClose={() => setSelectedSensor(null)}
            />
          </div>
        )}
      </section>

      <SensorDrawer
        key={`${editingSensor?.id ?? "new"}-${drawerOpen}`}
        open={drawerOpen}
        sensor={editingSensor}
        machines={machines}
        sensorTypes={sensorTypes}
        busy={busy}
        onClose={() => {
          setDrawerOpen(false);
          setEditingSensor(null);
        }}
        onSave={saveSensor}
      />

      <SensorDeleteDialog
        sensor={deletingSensor}
        busy={busy}
        onClose={() => setDeletingSensor(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );

}


function MobileSensorCards({
  sensors,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: {
  sensors: SensorItem[];
  selectedId: number | null;
  onSelect: (sensor: SensorItem) => void;
  onEdit: (sensor: SensorItem) => void;
  onDelete: (sensor: SensorItem) => void;
}) {
  if (!sensors.length) return null;

  return (
    <div className="space-y-3 p-3">
      {sensors.map((sensor) => {
        const selected = selectedId === sensor.id;

        return (
          <article
            key={sensor.id}
            className={`rounded-[16px] border p-4 transition ${
              selected
                ? "border-emerald-200 bg-emerald-50/45"
                : "border-[#e5eaed] bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(sensor)}
              className="w-full text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-[#334155]">
                    {sensor.name}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-[#8994a1]">
                    {sensor.code}
                  </p>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    sensor.connectionStatus === "ONLINE"
                      ? "bg-emerald-50 text-emerald-700"
                      : sensor.connectionStatus === "FAULT"
                        ? "bg-red-50 text-red-700"
                        : sensor.connectionStatus === "MAINTENANCE"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {sensor.connectionStatus === "ONLINE"
                    ? "เชื่อมต่อ"
                    : sensor.connectionStatus === "OFFLINE"
                      ? "ออฟไลน์"
                      : sensor.connectionStatus === "MAINTENANCE"
                        ? "บำรุงรักษา"
                        : "ผิดปกติ"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <MobileInfo label="ประเภท" value={sensor.type.name} />
                <MobileInfo label="Protocol" value={sensor.protocol || "-"} />
                <MobileInfo label="เครื่องจักร" value={sensor.machine.name} />
                <MobileInfo label="สายการผลิต" value={sensor.productionLine.name} />
              </div>
            </button>

            <div className="mt-3 flex gap-2 border-t border-[#edf0f2] pt-3">
              <button
                type="button"
                onClick={() => onSelect(sensor)}
                className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#eff7f3] px-3 text-[11px] font-semibold text-[#287554]"
              >
                <Eye className="h-3.5 w-3.5" />
                รายละเอียด
              </button>

              <button
                type="button"
                onClick={() => onEdit(sensor)}
                className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[#e1e6e9] px-3 text-[11px] font-semibold text-[#5b6777]"
              >
                <Pencil className="h-3.5 w-3.5" />
                แก้ไข
              </button>

              <button
                type="button"
                onClick={() => onDelete(sensor)}
                aria-label={`ลบ ${sensor.name}`}
                className="flex h-[38px] w-[42px] items-center justify-center rounded-[10px] border border-red-100 bg-red-50 text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MobileInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-[10px] bg-[#f7f9fa] px-3 py-2.5">
      <p className="text-[9px] font-medium text-[#98a1ac]">{label}</p>
      <p className="mt-0.5 truncate text-[11px] font-medium text-[#536174]">
        {value}
      </p>
    </div>
  );
}