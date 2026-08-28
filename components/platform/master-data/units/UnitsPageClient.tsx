"use client";

import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Database,
  Gauge,
  LoaderCircle,
  Plus,
  Ruler,
  Trash2,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import MasterDataPage from "../common/MasterDataPage";
import type {
  MasterColumn,
  MasterItem,
  MasterTone,
} from "../common/types";

type UnitApiItem = {
  unitId: number;
  unitCode: string;
  unitName: string;
  symbol: string;
  unitType: string;
  status: string;
  sensorDataCount: number;
  resourceTypeCount: number;
  resourceUsageCount: number;
  relatedCount: number;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: UnitApiItem[];
};

const columns: MasterColumn[] = [
  { key: "name", label: "ชื่อหน่วย" },
  { key: "code", label: "รหัส" },
  { key: "category", label: "ประเภทหน่วย" },
  { key: "unit", label: "สัญลักษณ์" },
  { key: "relatedCount", label: "การอ้างอิง" },
  { key: "status", label: "สถานะ" },
];

const tones: MasterTone[] = [
  "teal",
  "blue",
  "green",
  "purple",
  "orange",
  "rose",
  "slate",
];

const suggestedUnitTypes = [
  "Energy",
  "Power",
  "Mass",
  "Volume",
  "Temperature",
  "Pressure",
  "Flow",
  "Time",
  "Length",
  "Area",
  "Other",
];

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function UnitsPageClient() {
  const [rows, setRows] = useState<MasterItem[]>([]);
  const [rawUnits, setRawUnits] = useState<UnitApiItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);

  const [unitCode, setUnitCode] = useState("");
  const [unitName, setUnitName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [unitType, setUnitType] = useState("");
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<MasterItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  const loadUnits = useCallback(async () => {
    try {
      setLoadError("");

      const response = await fetch(
        "/api/platform/master-data/units",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "ไม่สามารถโหลดข้อมูลหน่วยวัดได้",
        );
      }

      const units = data.data ?? [];
      setRawUnits(units);

      setRows(
        units.map((item, index) => ({
          id: item.unitId,
          code: item.unitCode,
          nameTh: item.unitName,
          description: "",
          category: item.unitType,
          unit: item.symbol,
          relatedCount: item.relatedCount,
          status:
            item.status === "INACTIVE"
              ? "INACTIVE"
              : "ACTIVE",
          createdAt: formatDate(item.createdAt),
          updatedAt: formatDate(item.updatedAt),
          tone: tones[index % tones.length],
        })),
      );
    } catch (error) {
      console.error("Load units error:", error);

      setLoadError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดข้อมูลหน่วยวัดได้",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUnits();
  }, [loadUnits]);

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((row) => row.status === "ACTIVE").length;
    const inactive = rows.filter((row) => row.status === "INACTIVE").length;

    const totalReferences = rawUnits.reduce(
      (sum, item) => sum + item.relatedCount,
      0,
    );

    const usedUnits = rawUnits.filter(
      (item) => item.relatedCount > 0,
    ).length;

    return [
      {
        label: "หน่วยวัดทั้งหมด",
        value: total,
        unit: "หน่วย",
        helper: "ข้อมูลจากฐานข้อมูล",
        icon: <Ruler className="h-5 w-5" />,
        iconClassName: "bg-[#e9f8f7] text-[#118b8a]",
      },
      {
        label: "หน่วยที่ถูกใช้งาน",
        value: usedUnits,
        unit: "หน่วย",
        helper:
          usedUnits > 0
            ? "มีข้อมูลในระบบอ้างอิงอยู่"
            : "ยังไม่มีการอ้างอิง",
        icon: <CheckCircle2 className="h-5 w-5" />,
        iconClassName: "bg-[#eaf7f1] text-[#168662]",
      },
      {
        label: "การอ้างอิงทั้งหมด",
        value: totalReferences,
        unit: "รายการ",
        helper: "Sensor Data + Resource Type + Resource Usage",
        icon: <Database className="h-5 w-5" />,
        iconClassName: "bg-[#eaf3ff] text-[#3478da]",
      },
      {
        label: "ไม่ใช้งาน",
        value: inactive,
        unit: "หน่วย",
        helper:
          inactive > 0
            ? "ถูกปิดการใช้งาน"
            : "ไม่มีรายการปิดใช้งาน",
        icon: <Ban className="h-5 w-5" />,
        iconClassName: "bg-[#fff0f1] text-[#d65a66]",
      },
    ];
  }, [rawUnits, rows]);

  function resetForm() {
    setUnitCode("");
    setUnitName("");
    setSymbol("");
    setUnitType("");
    setFormError("");
    setEditingItem(null);
  }

  function openCreateModal() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditModal(row: MasterItem) {
    setEditingItem(row);
    setUnitCode(row.code);
    setUnitName(row.nameTh);
    setSymbol(row.unit ?? "");
    setUnitType(row.category ?? "");
    setFormError("");
    setIsFormOpen(true);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setIsFormOpen(false);
    resetForm();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const code = unitCode.trim().toUpperCase();
    const name = unitName.trim();
    const unitSymbol = symbol.trim();
    const type = unitType.trim();

    if (!code || !name || !unitSymbol || !type) {
      setFormError("กรุณากรอกข้อมูลหน่วยวัดให้ครบทุกช่อง");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const isEditing = editingItem !== null;

      const url = isEditing
        ? `/api/platform/master-data/units/${editingItem.id}`
        : "/api/platform/master-data/units";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unitCode: code,
          unitName: name,
          symbol: unitSymbol,
          unitType: type,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        setFormError(
          data.message ??
            (isEditing
              ? "ไม่สามารถแก้ไขหน่วยวัดได้"
              : "ไม่สามารถเพิ่มหน่วยวัดได้"),
        );
        return;
      }

      setIsFormOpen(false);
      resetForm();
      await loadUnits();
    } catch (error) {
      console.error("Save unit error:", error);

      setFormError(
        "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function openDeleteModal(row: MasterItem) {
    setDeleteTarget(row);
    setDeleteError("");
  }

  function closeDeleteModal() {
    if (isDeleting) {
      return;
    }

    setDeleteTarget(null);
    setDeleteError("");
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget || isDeleting) {
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/platform/master-data/units/${deleteTarget.id}`,
        {
          method: "DELETE",
        },
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        setDeleteError(
          data.message ?? "ไม่สามารถลบหน่วยวัดได้",
        );
        return;
      }

      setDeleteTarget(null);
      await loadUnits();
    } catch (error) {
      console.error("Delete unit error:", error);

      setDeleteError(
        "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleStatusToggle(row: MasterItem) {
    if (statusUpdatingId !== null) {
      return;
    }

    const nextStatus =
      row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setStatusUpdatingId(row.id);
    setStatusMessage("");
    setStatusError("");

    try {
      const response = await fetch(
        `/api/platform/master-data/units/${row.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        },
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        setStatusError(
          data.message ?? "ไม่สามารถเปลี่ยนสถานะหน่วยวัดได้",
        );
        return;
      }

      setStatusMessage(
        nextStatus === "ACTIVE"
          ? `เปิดใช้งาน "${row.nameTh}" เรียบร้อยแล้ว`
          : `ปิดใช้งาน "${row.nameTh}" เรียบร้อยแล้ว`,
      );

      await loadUnits();

      window.setTimeout(() => {
        setStatusMessage("");
      }, 2600);
    } catch (error) {
      console.error("Toggle unit status error:", error);

      setStatusError(
        "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setStatusUpdatingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[440px] items-center justify-center">
        <div className="rounded-[24px] border border-[#dceae8] bg-white px-10 py-9 text-center shadow-[0_22px_65px_rgba(17,104,102,0.08)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[17px] bg-[#e9f8f7] text-[#118b8a]">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>

          <p className="mt-4 text-[13px] font-semibold text-[#30413d]">
            กำลังโหลดหน่วยวัด
          </p>

          <p className="mt-1 text-[11px] text-[#87938f]">
            กำลังอ่านมาตรฐานหน่วยล่าสุดจากฐานข้อมูล
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-[22px] border border-[#f0d7d9] bg-white px-6 py-14 text-center shadow-[0_20px_60px_rgba(52,45,37,0.05)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#fff0f1] text-[#c64c5a]">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <p className="mt-4 text-[14px] font-semibold text-[#993c47]">
          โหลดข้อมูลไม่สำเร็จ
        </p>

        <p className="mx-auto mt-2 max-w-md text-[11px] leading-5 text-[#858f8a]">
          {loadError}
        </p>

        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            void loadUnits();
          }}
          className="mt-6 rounded-[12px] bg-[#118b8a] px-5 py-2.5 text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(17,139,138,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0d7978]"
        >
          ลองโหลดใหม่
        </button>
      </div>
    );
  }

  return (
    <>
      <MasterDataPage
        title="หน่วยวัด"
        description="จัดการมาตรฐานหน่วยวัดกลางของแพลตฟอร์ม สำหรับข้อมูลเซนเซอร์ ประเภททรัพยากร และการบันทึกการใช้ทรัพยากรของทุกโรงงาน"
        actionLabel="เพิ่มหน่วยวัด"
        drawerTitle="รายละเอียดหน่วยวัด"
        iconType="unit"
        rows={rows}
        columns={columns}
        stats={stats}
        categoryLabel="ประเภทหน่วยทั้งหมด"
        onAdd={openCreateModal}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onToggleStatus={handleStatusToggle}
        statusUpdatingId={statusUpdatingId}
      />

      {(statusMessage || statusError) && (
        <div className="pointer-events-none fixed right-6 top-6 z-[260]">
          <div
            className={`min-w-[310px] max-w-[390px] rounded-[17px] border px-4 py-3.5 shadow-[0_20px_55px_rgba(28,40,34,0.16)] ${
              statusError
                ? "border-[#f1d7db] bg-[#fff7f8] text-[#a9404d]"
                : "border-[#d4ebe7] bg-white text-[#176a64]"
            }`}
          >
            <p className="text-[11px] font-semibold">
              {statusError
                ? "เปลี่ยนสถานะไม่สำเร็จ"
                : "อัปเดตสถานะเรียบร้อย"}
            </p>

            <p className="mt-1 text-[11px] leading-5">
              {statusError || statusMessage}
            </p>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#172523]/45 px-4 backdrop-blur-[4px]">
          <button
            type="button"
            aria-label="ปิด"
            onClick={closeModal}
            className="absolute inset-0"
          />

          <section className="relative z-10 w-full max-w-[580px] overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_42px_130px_rgba(20,44,40,0.30)]">
            <div className="relative overflow-hidden border-b border-[#e8eeec] px-7 py-6">
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#dff5f2] blur-3xl" />
              <div className="absolute -left-14 bottom-[-100px] h-40 w-40 rounded-full bg-[#e8f0ff] blur-3xl" />

              <div className="relative flex items-start justify-between gap-5">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#e9f8f7] text-[#118b8a] ring-1 ring-[#d4ece9]">
                    <Ruler className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#4a8e89]">
                      Global Measurement Standard
                    </p>

                    <h3 className="mt-1.5 text-[22px] font-bold tracking-[-0.03em] text-[#202a27]">
                      {editingItem
                        ? "แก้ไขหน่วยวัด"
                        : "เพิ่มหน่วยวัด"}
                    </h3>

                    <p className="mt-1.5 max-w-[410px] text-[11px] leading-5 text-[#7c8985]">
                      {editingItem
                        ? "ปรับปรุงหน่วยมาตรฐานที่ถูกใช้เป็นข้อมูลอ้างอิงร่วมกันในแพลตฟอร์ม"
                        : "สร้างหน่วยวัดมาตรฐานกลางเพื่อให้ทุกโรงงานใช้รูปแบบข้อมูลเดียวกัน"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e2e9e6] bg-white/80 text-[#7c8782] transition hover:bg-[#f4f8f6] hover:text-[#26312c] disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold text-[#42524d]">
                    รหัสหน่วย
                  </span>

                  <input
                    value={unitCode}
                    onChange={(event) =>
                      setUnitCode(
                        event.target.value.toUpperCase(),
                      )
                    }
                    disabled={isSubmitting}
                    placeholder="เช่น KWH"
                    autoComplete="off"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#dce5e2] bg-[#fbfcfc] px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#273531] outline-none transition placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-[#a1aba7] focus:border-[#118b8a]/45 focus:bg-white focus:ring-4 focus:ring-[#118b8a]/[0.07]"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-[#42524d]">
                    สัญลักษณ์
                  </span>

                  <input
                    value={symbol}
                    onChange={(event) =>
                      setSymbol(event.target.value)
                    }
                    disabled={isSubmitting}
                    placeholder="เช่น kWh"
                    autoComplete="off"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#dce5e2] bg-[#fbfcfc] px-4 text-[13px] font-semibold text-[#176a64] outline-none transition placeholder:font-normal placeholder:text-[#a1aba7] focus:border-[#118b8a]/45 focus:bg-white focus:ring-4 focus:ring-[#118b8a]/[0.07]"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold text-[#42524d]">
                    ชื่อหน่วยวัด
                  </span>

                  <input
                    value={unitName}
                    onChange={(event) =>
                      setUnitName(event.target.value)
                    }
                    disabled={isSubmitting}
                    placeholder="เช่น Kilowatt-hour"
                    autoComplete="off"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#dce5e2] bg-[#fbfcfc] px-4 text-[12px] text-[#273531] outline-none transition placeholder:text-[#a1aba7] focus:border-[#118b8a]/45 focus:bg-white focus:ring-4 focus:ring-[#118b8a]/[0.07]"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-[#42524d]">
                    ประเภทหน่วย
                  </span>

                  <input
                    list="unit-type-options"
                    value={unitType}
                    onChange={(event) =>
                      setUnitType(event.target.value)
                    }
                    disabled={isSubmitting}
                    placeholder="เช่น Energy"
                    autoComplete="off"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#dce5e2] bg-[#fbfcfc] px-4 text-[12px] text-[#273531] outline-none transition placeholder:text-[#a1aba7] focus:border-[#118b8a]/45 focus:bg-white focus:ring-4 focus:ring-[#118b8a]/[0.07]"
                  />

                  <datalist id="unit-type-options">
                    {suggestedUnitTypes.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </label>
              </div>

              <div className="mt-5 rounded-[16px] border border-[#dcecea] bg-[#f6fbfa] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white text-[#118b8a] shadow-sm ring-1 ring-[#dcecea]">
                    <Gauge className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-[#356f6a]">
                      ตัวอย่างมาตรฐาน
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-[#71827d]">
                      KWH · Kilowatt-hour · kWh · Energy
                      <br />
                      M3 · Cubic metre · m³ · Volume
                      <br />
                      KG · Kilogram · kg · Mass
                    </p>
                  </div>
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mt-5 rounded-[13px] border border-[#f0d5d8] bg-[#fff5f6] px-4 py-3 text-[11px] leading-5 text-[#b83b4b]"
                >
                  {formError}
                </div>
              )}

              <div className="mt-7 flex items-center justify-end gap-3 border-t border-[#e9efec] pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="h-11 rounded-[12px] border border-[#dfe6e3] bg-white px-5 text-[12px] font-semibold text-[#5f6b65] transition hover:bg-[#f7f9f8] disabled:opacity-50"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#118b8a] px-5 text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(17,139,138,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0d7978] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      กำลังบันทึก
                    </>
                  ) : editingItem ? (
                    "บันทึกการแก้ไข"
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      เพิ่มหน่วยวัด
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-[#172523]/45 px-4 backdrop-blur-[4px]">
          <button
            type="button"
            aria-label="ปิด"
            onClick={closeDeleteModal}
            className="absolute inset-0"
          />

          <section className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-[26px] border border-[#eadcdf] bg-white shadow-[0_40px_120px_rgba(41,32,34,0.26)]">
            <div className="px-7 pb-7 pt-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#fff0f2] text-[#c94e5c] ring-1 ring-[#f3d8dc]">
                  <AlertTriangle className="h-5 w-5" strokeWidth={1.8} />
                </div>

                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#ece8e6] text-[#8b9590] transition hover:bg-[#f4f6f5] hover:text-[#26312c] disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#b56a74]">
                Delete Measurement Unit
              </p>

              <h3 className="mt-1.5 text-[22px] font-bold tracking-[-0.035em] text-[#2a2728]">
                ลบหน่วยวัดนี้?
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#747a77]">
                คุณกำลังจะลบ
                <span className="mx-1 font-semibold text-[#343837]">
                  {deleteTarget.nameTh}
                </span>
                จากมาตรฐานกลางของแพลตฟอร์ม
              </p>

              <div className="mt-5 rounded-[17px] border border-[#ebe7e4] bg-[#fbfaf9] p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-medium text-[#8a918d]">
                    หน่วย
                  </span>

                  <span className="text-[12px] font-bold text-[#176a64]">
                    {deleteTarget.unit ?? "—"}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4 border-t border-[#efebe8] pt-3">
                  <span className="text-[10px] font-medium text-[#8a918d]">
                    ประเภทหน่วย
                  </span>

                  <span className="text-[11px] font-semibold text-[#4c5551]">
                    {deleteTarget.category ?? "—"}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4 border-t border-[#efebe8] pt-3">
                  <span className="text-[10px] font-medium text-[#8a918d]">
                    การอ้างอิงในระบบ
                  </span>

                  <span
                    className={`text-[11px] font-semibold ${
                      (deleteTarget.relatedCount ?? 0) > 0
                        ? "text-[#c44f5c]"
                        : "text-[#4f5b56]"
                    }`}
                  >
                    {deleteTarget.relatedCount ?? 0} รายการ
                  </span>
                </div>
              </div>

              {(deleteTarget.relatedCount ?? 0) > 0 && (
                <div className="mt-4 rounded-[14px] border border-[#f1d9dd] bg-[#fff5f6] px-4 py-3 text-[11px] leading-5 text-[#a9404d]">
                  หน่วยนี้มีข้อมูลอ้างอิงอยู่ จึงไม่สามารถลบได้ ควรปิดสถานะแทนเพื่อรักษาความสัมพันธ์และประวัติของข้อมูล
                </div>
              )}

              {deleteError && (
                <div
                  role="alert"
                  className="mt-4 rounded-[14px] border border-[#f1d9dd] bg-[#fff5f6] px-4 py-3 text-[11px] leading-5 text-[#a9404d]"
                >
                  {deleteError}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#efebe8] pt-5">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="h-11 rounded-[12px] border border-[#dfe4e1] bg-white px-5 text-[12px] font-semibold text-[#5f6b65] transition hover:bg-[#f7f9f8] disabled:opacity-50"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={handleDeleteConfirmed}
                  disabled={
                    isDeleting ||
                    (deleteTarget.relatedCount ?? 0) > 0
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#c84e5c] px-5 text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(200,78,92,0.18)] transition hover:-translate-y-0.5 hover:bg-[#b64250] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      กำลังลบ
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      ยืนยันการลบ
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}