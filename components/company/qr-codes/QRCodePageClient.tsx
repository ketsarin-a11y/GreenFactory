"use client";

import QRCode from "qrcode";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  Copy,
  Download,
  ExternalLink,
  Factory,
  Fingerprint,
  Layers3,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  QrCode,
  RadioTower,
  RefreshCw,
  ScanLine,
  Search,
  ShieldBan,
  ShieldCheck,
  ShieldX,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { qrCodeService } from "@/services/qr-code.service";
import type {
  QRCodeFormValue,
  QRCodeItem,
  QRCodeStatus,
  QRTarget,
} from "@/types/qr-code";

const PAGE_SIZE = 7;

function statusLabel(status: QRCodeStatus) {
  if (status === "ACTIVE") return "ใช้งานอยู่";
  if (status === "SUSPENDED") return "ระงับ";
  return "ยกเลิก";
}

function statusClass(status: QRCodeStatus) {
  if (status === "ACTIVE") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "SUSPENDED") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function targetTypeLabel(type: QRCodeItem["targetType"]) {
  return type === "MACHINE" ? "เครื่องจักร" : "จุดตรวจ";
}

function QRPreview({
  item,
  size = 220,
}: {
  item: QRCodeItem;
  size?: number;
}) {
  const [dataUrl, setDataUrl] = useState("");

  const scanUrl =
    typeof window === "undefined"
      ? `http://192.168.1.61:3000/scan/${item.token}`
      : `${window.location.origin}/scan/${item.token}`;

  useEffect(() => {
    let mounted = true;

    QRCode.toDataURL(scanUrl, {
      width: Math.max(size * 2, 360),
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#10271d",
        light: "#ffffff",
      },
    }).then((url) => {
      if (mounted) setDataUrl(url);
    });

    return () => {
      mounted = false;
    };
  }, [scanUrl, size]);

  return dataUrl ? (
    <img
      src={dataUrl}
      alt={`QR ${item.code}`}
      className="mx-auto aspect-square w-full max-w-[220px] rounded-[18px] object-contain"
    />
  ) : (
    <div className="mx-auto aspect-square w-full max-w-[220px] animate-pulse rounded-[18px] bg-[#edf2ef]" />
  );
}

function QRDrawer({
  open,
  item,
  targets,
  onClose,
  onSave,
}: {
  open: boolean;
  item: QRCodeItem | null;
  targets: QRTarget[];
  onClose: () => void;
  onSave: (value: QRCodeFormValue) => void;
}) {
  const [code, setCode] = useState(item?.code ?? "");
  const [status, setStatus] = useState<QRCodeStatus>(
    item?.status ?? "ACTIVE",
  );

  const [factoryId, setFactoryId] = useState<number | "">(
    item?.factory.id ?? "",
  );
  const [buildingId, setBuildingId] = useState<number | "">(
    item?.building.id ?? "",
  );
  const [departmentId, setDepartmentId] = useState<number | "">(
    item?.department.id ?? "",
  );
  const [lineId, setLineId] = useState<number | "">(
    item?.productionLine.id ?? "",
  );
  const [targetKey, setTargetKey] = useState(
    item ? `${item.targetType}:${item.targetId}` : "",
  );

  function uniqueById<T extends { id: number }>(values: T[]) {
    return Array.from(
      new Map(values.map((value) => [value.id, value])).values(),
    );
  }

  const factories = useMemo(
    () => uniqueById(targets.map((target) => target.factory)),
    [targets],
  );

  const buildings = useMemo(
    () =>
      uniqueById(
        targets
          .filter((target) => !factoryId || target.factory.id === factoryId)
          .map((target) => target.building),
      ),
    [targets, factoryId],
  );

  const departments = useMemo(
    () =>
      uniqueById(
        targets
          .filter(
            (target) =>
              (!factoryId || target.factory.id === factoryId) &&
              (!buildingId || target.building.id === buildingId),
          )
          .map((target) => target.department),
      ),
    [targets, factoryId, buildingId],
  );

  const productionLines = useMemo(
    () =>
      uniqueById(
        targets
          .filter(
            (target) =>
              (!factoryId || target.factory.id === factoryId) &&
              (!buildingId || target.building.id === buildingId) &&
              (!departmentId || target.department.id === departmentId),
          )
          .map((target) => target.productionLine),
      ),
    [targets, factoryId, buildingId, departmentId],
  );

  const availableTargets = useMemo(
    () =>
      targets.filter(
        (target) =>
          (!factoryId || target.factory.id === factoryId) &&
          (!buildingId || target.building.id === buildingId) &&
          (!departmentId || target.department.id === departmentId) &&
          (!lineId || target.productionLine.id === lineId),
      ),
    [targets, factoryId, buildingId, departmentId, lineId],
  );

  const target = useMemo(
    () =>
      targets.find(
        (current) =>
          `${current.targetType}:${current.targetId}` === targetKey,
      ) ?? null,
    [targetKey, targets],
  );

  const hierarchyReady =
    Boolean(factoryId) &&
    Boolean(buildingId) &&
    Boolean(departmentId) &&
    Boolean(lineId);

  if (!open) return null;

  function resetBelow(level: "factory" | "building" | "department" | "line") {
    if (level === "factory") {
      setBuildingId("");
      setDepartmentId("");
      setLineId("");
      setTargetKey("");
      return;
    }

    if (level === "building") {
      setDepartmentId("");
      setLineId("");
      setTargetKey("");
      return;
    }

    if (level === "department") {
      setLineId("");
      setTargetKey("");
      return;
    }

    setTargetKey("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!target || !code.trim()) return;

    onSave({
      code: code.trim().toUpperCase(),
      targetType: target.targetType,
      targetId: target.targetId,
      status,
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label="ปิดหน้าต่าง"
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-[#06140e]/60 backdrop-blur-[7px]"
      />

      <aside className="fixed inset-y-0 right-0 z-[80] w-full max-w-[760px] overflow-y-auto border-l border-white/10 bg-[#f4f8f5] shadow-[-36px_0_110px_rgba(7,25,17,0.28)]">
        <div className="sticky top-0 z-20 border-b border-[#dce7e1] bg-white/95 px-5 py-5 backdrop-blur-xl sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                <Fingerprint className="h-3.5 w-3.5" />
                Digital Asset Identity
              </div>

              <h2 className="mt-3 text-[25px] font-bold tracking-[-0.04em] text-[#17251e] sm:text-[30px]">
                {item ? "แก้ไข QR Identity" : "สร้าง QR Identity ใหม่"}
              </h2>

              <p className="mt-1.5 max-w-[570px] text-[12px] leading-6 text-[#748178] sm:text-[13px]">
                เลือกตำแหน่งหน้างานแบบเป็นลำดับ จากโรงงานจนถึงเครื่องจักร
                แล้วออก Secure Token สำหรับการสแกนบนมือถือ
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-[#dce5e0] bg-white text-[#6d7a72] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f2f6f3]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

        </div>

        <form onSubmit={submit} className="space-y-4 p-4 sm:p-6">
          <section className="overflow-hidden rounded-[22px] border border-[#dce6e0] bg-white shadow-[0_12px_34px_rgba(22,54,38,0.05)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#e7ede9] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#ecf7f1] text-[#23825a]">
                  <Layers3 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[14px] font-bold text-[#26362e]">
                    Factory Scope
                  </h3>
                  <p className="mt-0.5 text-[10px] text-[#8d9992]">
                    ระบุตำแหน่งจริงก่อนเลือกเครื่องจักรหรือจุดตรวจ
                  </p>
                </div>
              </div>

            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2">
              <ScopeSelect
                label="โรงงาน"
                value={factoryId}
                placeholder="เลือกโรงงาน"
                options={factories}
                onChange={(value) => {
                  setFactoryId(value);
                  resetBelow("factory");
                }}
              />

              <ScopeSelect
                label="อาคาร"
                value={buildingId}
                placeholder="เลือกอาคาร"
                options={buildings}
                disabled={!factoryId}
                onChange={(value) => {
                  setBuildingId(value);
                  resetBelow("building");
                }}
              />

              <ScopeSelect
                label="แผนก"
                value={departmentId}
                placeholder="เลือกแผนก"
                options={departments}
                disabled={!buildingId}
                onChange={(value) => {
                  setDepartmentId(value);
                  resetBelow("department");
                }}
              />

              <ScopeSelect
                label="สายการผลิต"
                value={lineId}
                placeholder="เลือกสายการผลิต"
                options={productionLines}
                disabled={!departmentId}
                onChange={(value) => {
                  setLineId(value);
                  resetBelow("line");
                }}
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-[22px] border border-[#dce6e0] bg-white shadow-[0_12px_34px_rgba(22,54,38,0.05)]">
            <div className="border-b border-[#e7ede9] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#eff4ff] text-[#476bd6]">
                  <Factory className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[14px] font-bold text-[#26362e]">
                    Asset Identity
                  </h3>
                  <p className="mt-0.5 text-[10px] text-[#8d9992]">
                    QR หนึ่งรายการผูกกับ Asset จริงเพียงหนึ่งปลายทาง
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <label className="block">
                <span className="text-[11px] font-semibold text-[#47564e]">
                  เครื่องจักร / จุดตรวจ *
                </span>

                <select
                  required
                  disabled={!hierarchyReady}
                  value={targetKey}
                  onChange={(event) => setTargetKey(event.target.value)}
                  className="mt-2 h-[52px] w-full rounded-[14px] border border-[#dce5e0] bg-[#fafcfb] px-4 text-[13px] font-medium text-[#26352e] outline-none transition focus:border-[#42a879] focus:ring-4 focus:ring-[#42a879]/10 disabled:cursor-not-allowed disabled:bg-[#f1f4f2] disabled:text-[#9aa49e]"
                >
                  <option value="">
                    {hierarchyReady
                      ? "เลือกเครื่องจักรหรือจุดตรวจ"
                      : "เลือกโครงสร้างโรงงานให้ครบก่อน"}
                  </option>

                  {availableTargets.map((current) => (
                    <option
                      key={`${current.targetType}:${current.targetId}`}
                      value={`${current.targetType}:${current.targetId}`}
                    >
                      {current.targetName} · {current.targetCode}
                    </option>
                  ))}
                </select>
              </label>

              {hierarchyReady && availableTargets.length === 0 && (
                <div className="rounded-[13px] border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] leading-5 text-amber-800">
                  ยังไม่มีเครื่องจักรหรือจุดตรวจที่พร้อมใช้งานในสายการผลิตนี้
                </div>
              )}

              {target && (
                <div className="relative overflow-hidden rounded-[18px] border border-[#cfe6d9] bg-[#f5fbf7] p-4">
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-200/40 blur-2xl" />

                  <div className="relative flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#173b2b] text-white shadow-[0_8px_20px_rgba(23,59,43,0.18)]">
                      {target.targetType === "MACHINE" ? (
                        <Factory className="h-5 w-5" />
                      ) : (
                        <ScanLine className="h-5 w-5" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[14px] font-bold text-[#26382f]">
                          {target.targetName}
                        </p>
                        <span className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                          {targetTypeLabel(target.targetType)}
                        </span>
                      </div>

                      <p className="mt-1 font-mono text-[10px] font-semibold text-[#75847b]">
                        {target.targetCode}
                      </p>
                    </div>

                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  </div>

                  <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <TargetInfo label="โรงงาน" value={target.factory.name} />
                    <TargetInfo label="อาคาร" value={target.building.name} />
                    <TargetInfo label="แผนก" value={target.department.name} />
                    <TargetInfo
                      label="สายการผลิต"
                      value={target.productionLine.name}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-[22px] border border-[#dce6e0] bg-white shadow-[0_12px_34px_rgba(22,54,38,0.05)]">
            <div className="border-b border-[#e7ede9] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#fff6e8] text-[#bd7a18]">
                  <QrCode className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[14px] font-bold text-[#26362e]">
                    Secure QR Profile
                  </h3>
                  <p className="mt-0.5 text-[10px] text-[#8d9992]">
                    ตั้งรหัส Identity และสถานะเริ่มต้น
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[11px] font-semibold text-[#47564e]">
                    รหัส QR *
                  </span>
                  <input
                    required
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.toUpperCase())
                    }
                    placeholder="เช่น QR-SMT-001"
                    className="mt-2 h-[52px] w-full rounded-[14px] border border-[#dce5e0] bg-[#fafcfb] px-4 font-mono text-[13px] font-semibold uppercase tracking-[0.03em] text-[#26352e] outline-none transition placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-[#a3ada7] focus:border-[#42a879] focus:ring-4 focus:ring-[#42a879]/10"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-[#47564e]">
                    สถานะเริ่มต้น
                  </span>

                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as QRCodeStatus)
                    }
                    className="mt-2 h-[52px] w-full rounded-[14px] border border-[#dce5e0] bg-[#fafcfb] px-4 text-[13px] font-medium text-[#26352e] outline-none"
                  >
                    <option value="ACTIVE">ใช้งานอยู่</option>
                    <option value="SUSPENDED">ระงับชั่วคราว</option>
                    <option value="REVOKED">ยกเลิก</option>
                  </select>
                </label>

              </div>

              <div className="rounded-[16px] border border-[#dce6e0] bg-[#f8fbf9] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#34483d]">Secure token</p>
                    <p className="mt-0.5 text-[10px] leading-5 text-[#87938c]">Token จะถูกสร้างอัตโนมัติเมื่อบันทึก QR</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-between gap-3 border-t border-[#dce6e0] bg-white/95 px-4 py-4 shadow-[0_-12px_30px_rgba(20,48,34,0.05)] backdrop-blur-xl sm:-mx-6 sm:px-6">
            <div className="hidden min-w-0 sm:block">
              <p className="text-[10px] font-semibold text-[#56665d]">
                {target
                  ? `${target.targetName} พร้อมสร้าง Identity`
                  : "เลือก Asset เพื่อดำเนินการต่อ"}
              </p>
              <p className="mt-0.5 text-[9px] text-[#9aa49e]">
                Token จริงจะถูกสร้างฝั่ง Server และบันทึกลง Database
              </p>
            </div>

            <div className="ml-auto flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[46px] rounded-[12px] border border-[#dce4df] bg-white px-5 text-[12px] font-semibold text-[#66736c] transition hover:bg-[#f5f8f6]"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                disabled={!code.trim() || !targetKey}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-[12px] bg-[#177d55] px-5 text-[12px] font-bold text-white shadow-[0_10px_24px_rgba(23,125,85,0.24)] transition hover:-translate-y-0.5 hover:bg-[#126d49] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
              >
                <Check className="h-4 w-4" />
                {item ? "บันทึก Identity" : "สร้าง Secure QR"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </>
  );
}

function ScopeSelect({
  label,
  value,
  placeholder,
  options,
  disabled = false,
  onChange,
}: {
  label: string;
  value: number | "";
  placeholder: string;
  options: Array<{ id: number; code: string; name: string }>;
  disabled?: boolean;
  onChange: (value: number | "") => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold text-[#526158]">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value ? Number(event.target.value) : "")
        }
        className="mt-1.5 h-[48px] w-full rounded-[13px] border border-[#dfe5e0] bg-[#fafcfb] px-3 text-[12px] font-medium text-[#33443b] outline-none transition focus:border-[#42a879] focus:ring-4 focus:ring-[#42a879]/10 disabled:cursor-not-allowed disabled:bg-[#f1f4f2] disabled:text-[#a0aaa4]"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name} · {option.code}
          </option>
        ))}
      </select>
    </label>
  );
}

function TargetInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-medium text-[#7e9688]">
        {label}
      </p>
      <p className="mt-1 text-[11px] font-semibold text-[#365245]">
        {value || "-"}
      </p>
    </div>
  );
}

export default function QRCodePageClient() {
  const [items, setItems] = useState<QRCodeItem[]>([]);
  const [targets, setTargets] = useState<QRTarget[]>([]);
  const [selected, setSelected] = useState<QRCodeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<QRCodeItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  async function loadData(selectFirst = false) {
    try {
      setLoading(true);
      setLoadError("");

      const result = await qrCodeService.getAll();
      setItems(result.items);
      setTargets(result.targets);

      setSelected((current) => {
        if (selectFirst || !current) return result.items[0] ?? null;
        return result.items.find((item) => item.id === current.id) ?? result.items[0] ?? null;
      });
    } catch (error) {
      console.error("Load QR Codes failed:", error);
      setLoadError(
        error instanceof Error ? error.message : "โหลดข้อมูล QR Code ไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData(true);
  }, []);

  const departments = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.department.name).filter(Boolean)),
      ),
    [items],
  );

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.code.toLowerCase().includes(keyword) ||
        item.targetName.toLowerCase().includes(keyword) ||
        item.targetCode.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "ALL" ||
        item.department.name === departmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDepartment
      );
    });
  }, [
    items,
    search,
    statusFilter,
    departmentFilter,
  ]);

  const totals = useMemo(
    () => ({
      all: items.length,
      active: items.filter(
        (item) => item.status === "ACTIVE",
      ).length,
      suspended: items.filter(
        (item) => item.status === "SUSPENDED",
      ).length,
      revoked: items.filter(
        (item) => item.status === "REVOKED",
      ).length,
    }),
    [items],
  );

  const statCards: Array<{
    label: string;
    caption: string;
    value: number;
    Icon: LucideIcon;
    iconClass: string;
  }> = [
    {
      label: "QR Identity",
      caption: "ทั้งหมดในระบบ",
      value: totals.all,
      Icon: QrCode,
      iconClass: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Active Links",
      caption: "พร้อมสแกนใช้งาน",
      value: totals.active,
      Icon: RadioTower,
      iconClass: "bg-blue-50 text-blue-700",
    },
    {
      label: "Suspended",
      caption: "พักการใช้งาน",
      value: totals.suspended,
      Icon: CirclePause,
      iconClass: "bg-amber-50 text-amber-700",
    },
    {
      label: "Revoked",
      caption: "Token ถูกยกเลิก",
      value: totals.revoked,
      Icon: ShieldX,
      iconClass: "bg-red-50 text-red-700",
    },
  ];

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const visibleItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const bulkSelectedItems = items.filter((item) => selectedIds.has(item.id));
  const allVisibleSelected =
    visibleItems.length > 0 && visibleItems.every((item) => selectedIds.has(item.id));

  function toggleBulkItem(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisibleSelection() {
    setSelectedIds((current) => {
      const next = new Set(current);
      const shouldClear = visibleItems.every((item) => next.has(item.id));
      visibleItems.forEach((item) => {
        if (shouldClear) next.delete(item.id);
        else next.add(item.id);
      });
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedIds(new Set(filteredItems.map((item) => item.id)));
  }

  const scanUrl = selected
    ? `${
        typeof window === "undefined"
          ? "http://192.168.1.61:3000"
          : window.location.origin
      }/scan/${selected.token}`
    : "";

  async function saveItem(value: QRCodeFormValue) {
    try {
      if (editing) {
        window.alert("การแก้ไข QR จะเชื่อม API ในขั้นถัดไป");
        return;
      }

      await qrCodeService.create(value);
      await loadData(true);

      setEditing(null);
      setDrawerOpen(false);
      setPage(1);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "สร้าง QR Code ไม่สำเร็จ",
      );
    }
  }

  async function regenerate(item: QRCodeItem) {
    window.alert(
      `Rotate Token ของ ${item.code} จะเชื่อม API ในขั้นถัดไป`,
    );
  }

  async function toggleSuspend(item: QRCodeItem) {
    window.alert(
      `${item.status === "SUSPENDED" ? "เปิดใช้งาน" : "ระงับ"} ${item.code} จะเชื่อม API ในขั้นถัดไป`,
    );
  }

  async function remove(item: QRCodeItem) {
    window.alert(`การลบ ${item.code} จะเชื่อม API ในขั้นถัดไป`);
  }

  async function copyLink() {
    if (scanUrl) {
      await navigator.clipboard.writeText(scanUrl);
    }
  }

  async function downloadSelected() {
    if (!selected) return;

    const dataUrl = await QRCode.toDataURL(scanUrl, {
      width: 900,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#10271d",
        light: "#ffffff",
      },
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `QR_${selected.code}_${selected.targetCode}.png`;
    link.click();
  }

  async function printSelected() {
    if (!selected) return;

    const dataUrl = await QRCode.toDataURL(scanUrl, {
      width: 500,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#10271d",
        light: "#ffffff",
      },
    });

    const popup = window.open(
      "",
      "_blank",
      "width=700,height=900",
    );

    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>${selected.code}</title>
          <style>
            *{box-sizing:border-box}
            body{font-family:Arial,sans-serif;background:#f4f7f5;padding:32px;color:#14231b}
            .label{width:460px;margin:auto;background:#fff;border:1px solid #dce5e0;border-radius:24px;padding:28px;box-shadow:0 18px 50px rgba(16,39,29,.10)}
            .brand{font-size:12px;letter-spacing:2px;font-weight:700;color:#188c5d}
            .tag{display:inline-block;margin-top:16px;padding:7px 10px;background:#ecf8f1;border-radius:999px;color:#24734b;font-size:12px;font-weight:700}
            h1{font-size:25px;margin:12px 0 0}
            .code{color:#78857e;font-size:13px;margin-top:5px}
            img{width:280px;height:280px;display:block;margin:24px auto;border-radius:20px}
            .meta{border-top:1px solid #e4ebe7;margin-top:18px;padding-top:18px}
            .meta p{font-size:13px;margin:8px 0;color:#526158}
          </style>
        </head>
        <body>
          <div class="label">
            <div class="brand">GREENFACTORY INSIGHT</div>
            <div class="tag">${targetTypeLabel(selected.targetType)}</div>
            <h1>${selected.targetName}</h1>
            <div class="code">${selected.targetCode} · ${selected.code}</div>
            <img src="${dataUrl}" />
            <div class="meta">
              <p>อาคาร: ${selected.building?.name || "-"}</p>
              <p>แผนก: ${selected.department?.name || "-"}</p>
              <p>สายการผลิต: ${selected.productionLine?.name || "-"}</p>
            </div>
          </div>
        </body>
      </html>
    `);

    popup.document.close();
    popup.focus();
    popup.print();
  }

  async function buildPrintableQr(item: QRCodeItem, width = 720) {
    const url = `${window.location.origin}/scan/${item.token}`;
    return QRCode.toDataURL(url, {
      width,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#0f2018", light: "#ffffff" },
    });
  }

  function escapePrintText(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function printItems(printItems: QRCodeItem[]) {
    if (printItems.length === 0) return;

    const popup = window.open("", "_blank", "width=1120,height=900");
    if (!popup) {
      window.alert("เบราว์เซอร์บล็อกหน้าต่างพิมพ์ กรุณาอนุญาต Pop-up แล้วลองใหม่");
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>QR Labels</title>
          <style>
            *{box-sizing:border-box}
            @page{size:A4 portrait;margin:10mm}
            body{margin:0;background:#eef3f0;font-family:Arial,"Noto Sans Thai",sans-serif;color:#14231b}
            .toolbar{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 18px;background:#10271d;color:white}
            .toolbar b{font-size:14px}.toolbar span{font-size:11px;opacity:.72}
            .toolbar button{border:0;border-radius:9px;background:white;color:#173b2b;padding:9px 14px;font-weight:700;cursor:pointer}
            .sheet{width:190mm;min-height:277mm;margin:10mm auto;background:white;padding:2mm;display:grid;grid-template-columns:repeat(2,1fr);grid-auto-rows:86mm;gap:5mm;align-content:start}
            .label{position:relative;overflow:hidden;border:1px solid #cfd9d3;border-radius:4mm;padding:5mm;display:grid;grid-template-columns:1fr 39mm;gap:5mm;background:#fff;break-inside:avoid}
            .label:before{content:"";position:absolute;inset:0 auto 0 0;width:2.2mm;background:#18865a}
            .eyebrow{font-size:7.5pt;font-weight:800;letter-spacing:1.2px;color:#18865a}
            .asset{font-size:14pt;line-height:1.2;font-weight:800;margin-top:4mm;max-height:34px;overflow:hidden}
            .codes{font-size:8pt;color:#67746d;margin-top:1.5mm;font-family:monospace}
            .meta{margin-top:4mm;border-top:1px solid #e1e8e4;padding-top:3mm;display:grid;gap:1.4mm;font-size:7.8pt;color:#526158}
            .meta b{color:#273a30}
            .qrwrap{display:flex;flex-direction:column;align-items:center;justify-content:center}
            .qr{width:37mm;height:37mm;object-fit:contain}
            .scan{font-size:6.8pt;font-weight:700;color:#18865a;margin-top:1.5mm;text-align:center}
            .status{position:absolute;right:4mm;top:3.5mm;border:1px solid #cfe7da;background:#eef9f3;color:#1c7750;border-radius:99px;padding:1.2mm 2mm;font-size:6.5pt;font-weight:800}
            .footer{position:absolute;left:5mm;bottom:3mm;font-size:6.3pt;color:#98a29d}
            @media print{
              body{background:white}
              .toolbar{display:none}
              .sheet{margin:0;width:190mm;min-height:auto;padding:0;page-break-after:always}
              .sheet:last-child{page-break-after:auto}
            }
          </style>
        </head>
        <body>
          <div class="toolbar">
            <div><b>QR Label Print Studio</b><br/><span>${printItems.length} รายการ · A4 · 6 ป้ายต่อหน้า</span></div>
            <button onclick="window.print()">พิมพ์ QR ทั้งชุด</button>
          </div>
          <div id="root"></div>
        </body>
      </html>
    `);
    popup.document.close();

    const generated = await Promise.all(
      printItems.map(async (item) => ({ item, qr: await buildPrintableQr(item) })),
    );

    const pages: typeof generated[] = [];
    for (let index = 0; index < generated.length; index += 6) {
      pages.push(generated.slice(index, index + 6));
    }

    const root = popup.document.getElementById("root");
    if (!root) return;

    root.innerHTML = pages
      .map(
        (pageItems) => `
          <section class="sheet">
            ${pageItems
              .map(({ item, qr }) => {
                const targetName = escapePrintText(item.targetName);
                const targetCode = escapePrintText(item.targetCode);
                const qrCode = escapePrintText(item.code);
                const building = escapePrintText(item.building?.name || "-");
                const department = escapePrintText(item.department?.name || "-");
                const line = escapePrintText(item.productionLine?.name || "-");
                return `
                  <article class="label">
                    <div class="status">${escapePrintText(statusLabel(item.status))}</div>
                    <div>
                      <div class="eyebrow">GREENFACTORY INSIGHT · ASSET ID</div>
                      <div class="asset">${targetName}</div>
                      <div class="codes">${targetCode} · ${qrCode}</div>
                      <div class="meta">
                        <div><b>อาคาร:</b> ${building}</div>
                        <div><b>แผนก:</b> ${department}</div>
                        <div><b>สายการผลิต:</b> ${line}</div>
                      </div>
                    </div>
                    <div class="qrwrap">
                      <img class="qr" src="${qr}" alt="${qrCode}" />
                      <div class="scan">SCAN TO OPEN ASSET</div>
                    </div>
                    <div class="footer">Secure token · Error correction H</div>
                  </article>
                `;
              })
              .join("")}
          </section>
        `,
      )
      .join("");

    popup.focus();
  }

  async function downloadItems(downloadItems: QRCodeItem[]) {
    if (downloadItems.length === 0) return;

    for (const [index, item] of downloadItems.entries()) {
      const dataUrl = await buildPrintableQr(item, 1000);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `QR_${item.code}_${item.targetCode}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      if (index < downloadItems.length - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 120));
      }
    }
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setDepartmentFilter("ALL");
    setPage(1);
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[1800px] pb-10">
        {loadError && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-[9px] border border-red-200 bg-white px-3 py-1.5 font-semibold"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {loading && items.length === 0 && (
          <div className="mb-4 rounded-[14px] border border-[#dfe7e3] bg-white px-4 py-3 text-[12px] text-[#66736c]">
            กำลังโหลด QR Code จากฐานข้อมูล...
          </div>
        )}

        {/* PAGE HEADER */}
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
              <QrCode className="h-4 w-4" />
              QR Management
            </div>
            <h1 className="mt-2 text-[34px] font-black tracking-[-0.045em] text-slate-950 sm:text-[40px]">
              QR Code
            </h1>
            <p className="mt-1.5 text-[13px] text-slate-500">
              จัดการ QR สำหรับเครื่องจักรและจุดตรวจในโรงงาน
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-slate-950 px-4 text-[13px] font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            สร้าง QR Code
          </button>
        </header>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {statCards.map(
            ({
              label,
              caption,
              value,
              Icon,
              iconClass,
            }) => (
              <article
                key={label}
                className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] ${iconClass}`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-[#64736b]">
                      {label}
                    </p>
                    <p className="mt-0.5 text-[9px] text-[#9aa49f]">
                      {caption}
                    </p>
                  </div>

                  <p className="ml-auto text-[24px] font-bold tracking-[-0.03em] text-[#22342a]">
                    {value}
                  </p>
                </div>
              </article>
            ),
          )}
        </div>

        {/* MAIN COMMAND SURFACE */}
        <div className="mt-4 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-[#e4ebe7] bg-[#fbfdfc] p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-[1.35fr_0.75fr_1fr_auto]">
              <div className="flex h-[44px] items-center gap-3 rounded-[11px] border border-[#dfe7e2] bg-white px-4 sm:col-span-2 xl:col-span-1">
                <Search className="h-4 w-4 text-[#89968f]" />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="ค้นหา QR, เครื่องจักร หรือรหัสอุปกรณ์..."
                  className="min-w-0 flex-1 bg-transparent text-[12px] text-[#435149] outline-none placeholder:text-[#a1aaa5] sm:text-[13px]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                className="h-[44px] rounded-[11px] border border-[#dfe7e2] bg-white px-3 text-[12px] font-medium text-[#55645c] sm:text-[13px]"
              >
                <option value="ALL">ทุกสถานะ</option>
                <option value="ACTIVE">ใช้งานอยู่</option>
                <option value="SUSPENDED">ระงับ</option>
                <option value="REVOKED">ยกเลิก</option>
              </select>

              <select
                value={departmentFilter}
                onChange={(event) => {
                  setDepartmentFilter(event.target.value);
                  setPage(1);
                }}
                className="h-[44px] rounded-[11px] border border-[#dfe7e2] bg-white px-3 text-[12px] font-medium text-[#55645c] sm:text-[13px]"
              >
                <option value="ALL">ทุกแผนก</option>

                {departments.map((department) => (
                  <option
                    key={department}
                    value={department}
                  >
                    {department}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[11px] border border-[#dfe7e2] bg-white px-4 text-[12px] font-medium text-[#5b6962]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                ล้างตัวกรอง
              </button>
            </div>
          </div>

          <div className="flex min-h-[48px] items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleVisibleSelection}
                className={`inline-flex h-8 items-center gap-2 rounded-[9px] border px-3 text-[11px] font-semibold ${
                  allVisibleSelected
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className={`flex h-4 w-4 items-center justify-center rounded-[4px] border ${allVisibleSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"}`}>
                  {allVisibleSelected && <Check className="h-3 w-3" />}
                </span>
                เลือกหน้านี้
              </button>
              <span className="text-[11px] text-slate-400">{filteredItems.length} รายการ</span>
            </div>

            {bulkSelectedItems.length > 0 && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="text-[11px] font-semibold text-slate-500">เลือก {bulkSelectedItems.length}</span>
                <button type="button" onClick={() => void downloadItems(bulkSelectedItems)} className="inline-flex h-8 items-center gap-1.5 rounded-[9px] border border-slate-200 px-3 text-[10px] font-bold text-slate-600 hover:bg-slate-50">
                  <Download className="h-3.5 w-3.5" /> ดาวน์โหลด
                </button>
                <button type="button" onClick={() => void printItems(bulkSelectedItems)} className="inline-flex h-8 items-center gap-1.5 rounded-[9px] bg-slate-950 px-3 text-[10px] font-bold text-white hover:bg-emerald-700">
                  <Printer className="h-3.5 w-3.5" /> พิมพ์
                </button>
                <button type="button" onClick={() => setSelectedIds(new Set())} className="h-8 px-2 text-[10px] font-semibold text-slate-400 hover:text-slate-700">ล้าง</button>
              </div>
            )}
          </div>

          <div className="xl:flex">
            <div className="min-w-0 flex-1">
              {/* MOBILE CARDS */}
              <div className="space-y-3 p-3 md:hidden">
                {visibleItems.map((item) => (
                  <MobileQRCard
                    key={item.id}
                    item={item}
                    selected={
                      selected?.id === item.id
                    }
                    onSelect={() =>
                      setSelected(item)
                    }
                    onEdit={() => {
                      window.alert("การแก้ไข QR จะเชื่อม API ในขั้นถัดไป");
                    }}
                    checked={selectedIds.has(item.id)}
                    onToggleChecked={() => toggleBulkItem(item.id)}
                    onDelete={() =>
                      void remove(item)
                    }
                  />
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1080px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#e6ece8] bg-[#f8fbf9] text-left">
                      <th className="w-[54px] px-4 py-4">
                        <button
                          type="button"
                          onClick={toggleVisibleSelection}
                          aria-label="เลือก QR ทั้งหน้าปัจจุบัน"
                          className={`flex h-5 w-5 items-center justify-center rounded-[5px] border ${allVisibleSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-[#b9c4be] bg-white"}`}
                        >
                          {allVisibleSelected && <Check className="h-3.5 w-3.5" />}
                        </button>
                      </th>
                      {[
                        "ปลายทาง",
                        "QR Identity",
                        "แผนก",
                        "สายการผลิต",
                        "สถานะ",
                        "Security",
                        "",
                      ].map((label) => (
                        <th
                          key={label}
                          className="px-5 py-4 text-[11px] font-semibold text-[#7b8881]"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {visibleItems.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() =>
                          setSelected(item)
                        }
                        className={`cursor-pointer border-b border-[#edf1ef] transition last:border-0 ${
                          selected?.id === item.id
                            ? "bg-[#f0f8f4]"
                            : "hover:bg-[#fafcfb]"
                        }`}
                      >
                        <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleBulkItem(item.id)}
                            aria-label={`เลือก ${item.code}`}
                            className={`flex h-5 w-5 items-center justify-center rounded-[5px] border transition ${selectedIds.has(item.id) ? "border-emerald-600 bg-emerald-600 text-white" : "border-[#bcc7c1] bg-white hover:border-emerald-400"}`}
                          >
                            {selectedIds.has(item.id) && <Check className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#edf6f1] text-[#2a7c57]">
                              {item.targetType ===
                              "MACHINE" ? (
                                <Factory className="h-[18px] w-[18px]" />
                              ) : (
                                <ScanLine className="h-[18px] w-[18px]" />
                              )}
                            </span>

                            <div className="min-w-0">
                              <p className="max-w-[240px] truncate text-[13px] font-semibold text-[#35463d]">
                                {item.targetName}
                              </p>
                              <p className="mt-1 text-[10px] text-[#949e99]">
                                {targetTypeLabel(
                                  item.targetType,
                                )}{" "}
                                · {item.targetCode}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-[9px] border border-[#dfe6e2] bg-white px-3 py-1.5 font-mono text-[11px] font-semibold text-[#536158] shadow-sm">
                            {item.code}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-[12px] font-medium text-[#5d6a63]">
                          {item.department.name || "-"}
                        </td>

                        <td className="px-5 py-4 text-[12px] text-[#66736c]">
                          {item.productionLine.name || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${statusClass(
                              item.status,
                            )}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {statusLabel(item.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#516159]">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            Token Protected
                          </div>
                        </td>

                        <td
                          className="relative px-5 py-4"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setMenuId((current) =>
                                current === item.id
                                  ? null
                                  : item.id,
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#748078] transition hover:bg-[#edf2ef]"
                          >
                            <MoreHorizontal className="h-4.5 w-4.5" />
                          </button>

                          {menuId === item.id && (
                            <div className="absolute right-5 top-[52px] z-30 w-[190px] rounded-[14px] border border-[#dce4df] bg-white p-2 shadow-[0_18px_50px_rgba(19,46,32,0.16)]">
                              <ActionMenuButton
                                Icon={Pencil}
                                label="แก้ไข"
                                onClick={() => {
                                  window.alert("การแก้ไข QR จะเชื่อม API ในขั้นถัดไป");
                                  setMenuId(null);
                                }}
                              />

                              <ActionMenuButton
                                Icon={RefreshCw}
                                label="สร้าง Token ใหม่"
                                tone="warning"
                                onClick={() =>
                                  void regenerate(item)
                                }
                              />

                              <ActionMenuButton
                                Icon={Trash2}
                                label="ลบรายการ"
                                tone="danger"
                                onClick={() =>
                                  void remove(item)
                                }
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {visibleItems.length === 0 && (
                <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-[17px] bg-[#edf5f1] text-[#67917b]">
                    <QrCode className="h-6 w-6" />
                  </span>
                  <p className="mt-4 text-[14px] font-semibold text-[#506058]">
                    ยังไม่มี QR Identity
                  </p>
                  <p className="mt-1 text-[11px] text-[#96a19b]">
                    สร้าง QR เพื่อเชื่อมโลกหน้างานเข้ากับข้อมูลดิจิทัล
                  </p>
                </div>
              )}

              <footer className="flex flex-col gap-3 border-t border-[#e6ece8] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-[#89948e]">
                  แสดง {visibleItems.length} จาก{" "}
                  {filteredItems.length} รายการ
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
                    className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#dfe6e2] text-[#647168] disabled:opacity-35"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="min-w-[60px] text-center text-[11px] font-medium text-[#647168]">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      currentPage >= totalPages
                    }
                    onClick={() =>
                      setPage((value) =>
                        Math.min(
                          totalPages,
                          value + 1,
                        ),
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#dfe6e2] text-[#647168] disabled:opacity-35"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </footer>
            </div>

            {/* DETAIL */}
            {selected && (
              <aside className="border-t border-[#e2e9e5] bg-[#fbfdfc] xl:w-[360px] xl:border-l xl:border-t-0">
                <div className="p-4 sm:p-5 xl:sticky xl:top-[72px] xl:max-h-[calc(100vh-72px)] xl:overflow-y-auto">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words text-[18px] font-bold leading-6 text-[#28382f]">
                        {selected.targetName}
                      </h2>

                      <p className="mt-1 text-[10px] font-medium text-[#929c97]">
                        {selected.code}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelected(null)
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#dfe6e2] bg-white text-[#77847d] hover:bg-[#f2f5f3]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="relative mt-4 overflow-hidden rounded-[20px] border border-[#dce6e0] bg-white p-4 shadow-[0_12px_32px_rgba(24,58,41,0.055)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />
                    <QRPreview item={selected} />

                    <div className="mt-3 flex items-center justify-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(
                          selected.status,
                        )}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {statusLabel(selected.status)}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff5f2] px-2.5 py-1 text-[10px] font-semibold text-[#587066]">
                        <ShieldCheck className="h-3 w-3" />
                        Secured
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <QuickAction
                      Icon={Download}
                      label="ดาวน์โหลด"
                      onClick={() =>
                        void downloadSelected()
                      }
                    />
                    <QuickAction
                      Icon={Printer}
                      label="พิมพ์"
                      onClick={() =>
                        void printSelected()
                      }
                    />
                    <QuickAction
                      Icon={Copy}
                      label="คัดลอกลิงก์"
                      onClick={() =>
                        void copyLink()
                      }
                    />

                    <a
                      href={scanUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#dfe6e2] bg-white px-3 text-[10px] font-semibold text-[#5a6860] transition hover:bg-[#f5f8f6]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      เปิดหน้า Scan
                    </a>
                  </div>

                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
                    <DetailRow
                      Icon={
                        selected.targetType ===
                        "MACHINE"
                          ? Factory
                          : ScanLine
                      }
                      label="ประเภท"
                      value={targetTypeLabel(
                        selected.targetType,
                      )}
                    />

                    <DetailRow
                      Icon={Fingerprint}
                      label="รหัสอุปกรณ์"
                      value={selected.targetCode}
                    />

                    <DetailRow
                      Icon={Layers3}
                      label="โครงสร้าง"
                      value={`${selected.building?.name || "-"} · ${selected.department?.name || "-"} · ${selected.productionLine?.name || "-"}`}
                    />

                    <DetailRow
                      Icon={Zap}
                      label="Token"
                      value={selected.token}
                      mono
                    />
                  </div>


                  <div className="mt-4 grid gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void regenerate(selected)
                      }
                      className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] border border-amber-200 bg-amber-50 text-[10px] font-semibold text-amber-700"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Rotate Security Token
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void toggleSuspend(selected)
                      }
                      className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#e5dcdc] bg-white text-[10px] font-semibold text-[#9a5353]"
                    >
                      <ShieldBan className="h-3.5 w-3.5" />
                      {selected.status === "SUSPENDED"
                        ? "เปิดใช้งานอีกครั้ง"
                        : "ระงับการใช้งาน"}
                    </button>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      <QRDrawer
        key={`${editing?.id ?? "new"}-${drawerOpen}`}
        open={drawerOpen}
        item={editing}
        targets={targets}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        onSave={saveItem}
      />
    </>
  );
}

function DetailRow({
  Icon,
  label,
  value,
  mono = false,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[12px] border border-[#e2e8e4] bg-white px-3.5 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#eff5f2] text-[#597267]">
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0">
        <p className="text-[9px] text-[#98a19c]">
          {label}
        </p>
        <p
          className={`mt-0.5 break-words text-[11px] font-semibold leading-5 text-[#4d5c54] ${
            mono ? "font-mono" : ""
          }`}
        >
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function QuickAction({
  Icon,
  label,
  onClick,
}: {
  Icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#dfe6e2] bg-white px-3 text-[10px] font-semibold text-[#5a6860] transition hover:bg-[#f5f8f6]"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function ActionMenuButton({
  Icon,
  label,
  onClick,
  tone = "default",
}: {
  Icon: LucideIcon;
  label: string;
  onClick: () => void;
  tone?: "default" | "warning" | "danger";
}) {
  const classes =
    tone === "danger"
      ? "text-red-600 hover:bg-red-50"
      : tone === "warning"
        ? "text-amber-700 hover:bg-amber-50"
        : "text-[#58655e] hover:bg-[#f3f6f4]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[38px] w-full items-center gap-2.5 rounded-[9px] px-3 text-left text-[10px] font-semibold transition ${classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function MobileQRCard({
  item,
  selected,
  onSelect,
  onEdit,
  checked,
  onToggleChecked,
  onDelete,
}: {
  item: QRCodeItem;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  checked: boolean;
  onToggleChecked: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className={`rounded-[16px] border p-4 ${
        selected
          ? "border-emerald-200 bg-emerald-50/45"
          : "border-[#e2e8e4] bg-white"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#e8edea] pb-3">
        <button
          type="button"
          onClick={onToggleChecked}
          className={`inline-flex min-h-[34px] items-center gap-2 rounded-[9px] border px-2.5 text-[9px] font-bold ${checked ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#dfe6e2] bg-white text-[#6c7972]"}`}
        >
          <span className={`flex h-4 w-4 items-center justify-center rounded-[4px] border ${checked ? "border-emerald-600 bg-emerald-600 text-white" : "border-[#bcc7c1]"}`}>
            {checked && <Check className="h-3 w-3" />}
          </span>
          {checked ? "เลือกแล้ว" : "เลือกเพื่อพิมพ์"}
        </button>
        <span className="text-[9px] font-medium text-[#98a29c]">Bulk print ready</span>
      </div>

      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-[#33453b]">
              {item.targetName}
            </p>
            <p className="mt-1 text-[10px] text-[#8e9993]">
              {item.targetCode} · {item.code}
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold ${statusClass(
              item.status,
            )}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {statusLabel(item.status)}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <TargetInfo
            label="ประเภท"
            value={targetTypeLabel(item.targetType)}
          />
          <TargetInfo
            label="แผนก"
            value={item.department.name || "-"}
          />
        </div>
      </button>

      <div className="mt-3 flex gap-2 border-t border-[#e8edea] pt-3">
        <button
          type="button"
          onClick={onSelect}
          className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#eff7f3] text-[10px] font-semibold text-[#287554]"
        >
          <QrCode className="h-3.5 w-3.5" />
          ดู QR
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[#dfe6e2] text-[10px] font-semibold text-[#5a6860]"
        >
          <Pencil className="h-3.5 w-3.5" />
          แก้ไข
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="flex h-[38px] w-[42px] items-center justify-center rounded-[10px] border border-red-100 bg-red-50 text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}