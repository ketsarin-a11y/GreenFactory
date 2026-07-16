"use client";

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Download,
  Plus,
  Radio,
  RefreshCw,
  Search,
  WifiOff,
} from "lucide-react";
import { useMemo, useState } from "react";

import SensorDeleteDialog from "./SensorDeleteDialog";
import SensorDetail from "./SensorDetail";
import SensorDrawer from "./SensorDrawer";
import SensorTable from "./SensorTable";
import {
  initialSensors,
  sensorTypes,
  type SensorItem,
} from "./sensor-data";

const PAGE_SIZE = 7;

export default function SensorsPageClient() {
  const [sensors, setSensors] = useState<SensorItem[]>(initialSensors);
  const [selectedSensor, setSelectedSensor] =
    useState<SensorItem | null>(initialSensors[0]);
  const [editingSensor, setEditingSensor] = useState<SensorItem | null>(null);
  const [deletingSensor, setDeletingSensor] =
    useState<SensorItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [machineFilter, setMachineFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const machineOptions = useMemo(
    () => Array.from(new Set(sensors.map((sensor) => sensor.machine))),
    [sensors],
  );

  const filteredSensors = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return sensors.filter((sensor) => {
      const matchesSearch =
        !keyword ||
        sensor.code.toLowerCase().includes(keyword) ||
        sensor.name.toLowerCase().includes(keyword) ||
        sensor.machine.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || sensor.status === statusFilter;

      const matchesType =
        typeFilter === "ALL" || sensor.type === typeFilter;

      const matchesMachine =
        machineFilter === "ALL" || sensor.machine === machineFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesMachine
      );
    });
  }, [sensors, search, statusFilter, typeFilter, machineFilter]);

  const totals = useMemo(
    () => ({
      all: sensors.length,
      online: sensors.filter((sensor) => sensor.status === "ONLINE").length,
      offline: sensors.filter((sensor) => sensor.status === "OFFLINE").length,
      fault: sensors.filter((sensor) => sensor.status === "FAULT").length,
    }),
    [sensors],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSensors.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const visibleSensors = filteredSensors.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function saveSensor(sensor: SensorItem) {
    setSensors((current) => {
      const exists = current.some((item) => item.id === sensor.id);

      if (exists) {
        return current.map((item) =>
          item.id === sensor.id ? sensor : item,
        );
      }

      return [sensor, ...current];
    });

    setSelectedSensor(sensor);
    setEditingSensor(null);
    setDrawerOpen(false);
    setPage(1);
  }

  function confirmDelete() {
    if (!deletingSensor) return;

    setSensors((current) =>
      current.filter((sensor) => sensor.id !== deletingSensor.id),
    );

    if (selectedSensor?.id === deletingSensor.id) {
      setSelectedSensor(null);
    }

    setDeletingSensor(null);
    setMenuId(null);
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
      <section className="mx-auto w-full max-w-[1750px]">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#182334] sm:text-[32px]">
              เซนเซอร์
            </h1>
            <p className="mt-2 text-[10px] text-[#7f8997]">
              จัดการเซนเซอร์ที่เชื่อมต่อกับเครื่องจักรและจุดตรวจภายในโรงงาน
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-[10px] border border-[#dfe5eb] bg-white px-4 text-[9px] font-medium text-[#596677]"
            >
              <Download className="h-3.5 w-3.5" />
              ส่งออก
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingSensor(null);
                setDrawerOpen(true);
              }}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-[10px] bg-[#1f8f62] px-4 text-[9px] font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              เพิ่มเซนเซอร์
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["เซนเซอร์ทั้งหมด", totals.all, Radio, "bg-[#e8f5ed] text-[#2d8057]"],
            ["เชื่อมต่อปกติ", totals.online, CircleDot, "bg-[#e8f1ff] text-[#4b6db0]"],
            ["ออฟไลน์", totals.offline, WifiOff, "bg-[#fff4df] text-[#a06c17]"],
            ["ผิดปกติ", totals.fault, AlertTriangle, "bg-[#fff0f0] text-[#c04e4e]"],
          ].map(([label, value, Icon, iconClass]) => (
            <article
              key={String(label)}
              className="rounded-[17px] border border-[#e0e5ea] bg-white p-4 shadow-[0_8px_28px_rgba(28,43,61,0.035)]"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${String(
                    iconClass,
                  )}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>

                <div>
                  <p className="text-[8px] text-[#909aa7]">
                    {String(label)}
                  </p>
                  <p className="mt-1 text-[21px] font-semibold text-[#283548]">
                    {Number(value).toLocaleString("th-TH")}{" "}
                    <span className="text-[9px] font-medium text-[#929ca9]">
                      ตัว
                    </span>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 flex overflow-hidden rounded-[18px] border border-[#e0e5ea] bg-white shadow-[0_8px_28px_rgba(28,43,61,0.035)]">
          <div className="min-w-0 flex-1">
            <div className="border-b border-[#e7ebef] p-4">
              <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr_1fr_1fr_auto]">
                <div className="flex h-[40px] items-center gap-3 rounded-[10px] border border-[#dfe5eb] bg-[#f9fafb] px-3">
                  <Search className="h-3.5 w-3.5 text-[#8b96a4]" />
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="ค้นหารหัส ชื่อ หรือเครื่องจักร"
                    className="min-w-0 flex-1 bg-transparent text-[9px] outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-[40px] rounded-[10px] border border-[#dfe5eb] bg-white px-3 text-[9px] text-[#596677]"
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
                  className="h-[40px] rounded-[10px] border border-[#dfe5eb] bg-white px-3 text-[9px] text-[#596677]"
                >
                  <option value="ALL">ทุกประเภท</option>
                  {sensorTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>

                <select
                  value={machineFilter}
                  onChange={(event) => {
                    setMachineFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-[40px] rounded-[10px] border border-[#dfe5eb] bg-white px-3 text-[9px] text-[#596677]"
                >
                  <option value="ALL">ทุกเครื่องจักร / จุดตรวจ</option>
                  {machineOptions.map((machine) => (
                    <option key={machine}>{machine}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#dfe5eb] bg-white px-3 text-[9px] text-[#596677]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  ล้างตัวกรอง
                </button>
              </div>
            </div>

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

            {visibleSensors.length === 0 && (
              <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                <Radio className="h-8 w-8 text-[#9aa4af]" />
                <p className="mt-3 text-[10px] font-semibold text-[#566274]">
                  ไม่พบเซนเซอร์
                </p>
              </div>
            )}

            <footer className="flex flex-col gap-3 border-t border-[#e8ecf0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[8px] text-[#929ca9]">
                แสดง {visibleSensors.length} จาก {filteredSensors.length} รายการ
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#dfe5eb] text-[#6f7b8a] disabled:opacity-35"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="min-w-[64px] text-center text-[8px] text-[#6f7b8a]">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
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
      </section>

      <SensorDrawer
        key={`${editingSensor?.id ?? "new"}-${drawerOpen}`}
        open={drawerOpen}
        sensor={editingSensor}
        onClose={() => {
          setDrawerOpen(false);
          setEditingSensor(null);
        }}
        onSave={saveSensor}
      />

      <SensorDeleteDialog
        sensor={deletingSensor}
        onClose={() => setDeletingSensor(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
