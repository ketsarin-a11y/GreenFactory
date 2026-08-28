"use client";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Database,
  Leaf,
  LoaderCircle,
  Plus,
  Sparkles,
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

type EmissionFactorApiItem = {
  factorId: number;
  resourceType: {
    resourceTypeId: number;
    resourceCode: string;
    resourceName: string;
    carbonCalculable: boolean;
    category: {
      categoryId: number;
      categoryCode: string;
      categoryName: string;
    };
    defaultUnit: {
      unitId: number;
      unitCode: string;
      unitName: string;
      symbol: string;
    };
  };
  scope: string | null;
  region: string | null;
  source: string | null;
  factor: string;
  factorUnit: string;
  effectiveDate: string;
  expiryDate: string | null;
  status: string;
  carbonResultCount: number;
  createdAt: string;
  updatedAt: string;
};

type ResourceTypeOption = {
  resourceTypeId: number;
  resourceCode: string;
  resourceName: string;
  description: string | null;
  carbonCalculable: boolean;
  status: string;
  category: {
    categoryId: number;
    categoryCode: string;
    categoryName: string;
  };
  defaultUnit: {
    unitId: number;
    unitCode: string;
    unitName: string;
    symbol: string;
    unitType: string;
  };
};

type FactorsResponse = {
  success: boolean;
  message?: string;
  data?: EmissionFactorApiItem[];
};

type ResourceTypesResponse = {
  success: boolean;
  message?: string;
  data?: ResourceTypeOption[];
};

type MutationResponse = {
  success: boolean;
  message?: string;
};

const columns: MasterColumn[] = [
  { key: "name", label: "ทรัพยากร" },
  { key: "code", label: "Factor ID" },
  { key: "category", label: "Scope" },
  { key: "value", label: "ค่า Factor" },
  { key: "unit", label: "หน่วย Factor" },
  { key: "source", label: "แหล่งอ้างอิง" },
  { key: "relatedCount", label: "Carbon Result" },
  { key: "status", label: "สถานะ" },
];

const tones: MasterTone[] = [
  "green",
  "blue",
  "orange",
  "purple",
  "teal",
  "rose",
  "slate",
];

const scopeOptions = ["Scope 1", "Scope 2", "Scope 3"];

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

function toInputDate(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function EmissionFactorsPageClient() {
  const [rows, setRows] = useState<MasterItem[]>([]);
  const [rawFactors, setRawFactors] = useState<EmissionFactorApiItem[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceTypeOption[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);

  const [resourceTypeId, setResourceTypeId] = useState("");
  const [scope, setScope] = useState("");
  const [region, setRegion] = useState("");
  const [source, setSource] = useState("");
  const [factor, setFactor] = useState("");
  const [factorUnit, setFactorUnit] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<MasterItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoadError("");

      const [factorResponse, resourceTypeResponse] = await Promise.all([
        fetch("/api/platform/master-data/emission-factors", {
          method: "GET",
          cache: "no-store",
        }),
        fetch("/api/platform/master-data/resource-types", {
          method: "GET",
          cache: "no-store",
        }),
      ]);

      const factorData =
        (await factorResponse.json()) as FactorsResponse;

      const resourceTypeData =
        (await resourceTypeResponse.json()) as ResourceTypesResponse;

      if (!factorResponse.ok || !factorData.success) {
        throw new Error(
          factorData.message ??
            "ไม่สามารถโหลดข้อมูล Emission Factor ได้",
        );
      }

      if (!resourceTypeResponse.ok || !resourceTypeData.success) {
        throw new Error(
          resourceTypeData.message ??
            "ไม่สามารถโหลดข้อมูลประเภททรัพยากรได้",
        );
      }

      const factors = factorData.data ?? [];
      setRawFactors(factors);
      setResourceTypes(resourceTypeData.data ?? []);

      setRows(
        factors.map((item, index) => ({
          id: item.factorId,
          code: `EF-${String(item.factorId).padStart(4, "0")}`,
          nameTh: item.resourceType.resourceName,
          nameEn: item.resourceType.resourceCode,
          description: [
            item.region ? `พื้นที่: ${item.region}` : null,
            `เริ่มใช้: ${formatDate(item.effectiveDate)}`,
            item.expiryDate
              ? `สิ้นสุด: ${formatDate(item.expiryDate)}`
              : "ไม่กำหนดวันสิ้นสุด",
          ]
            .filter(Boolean)
            .join(" · "),
          category: item.scope ?? "ไม่ระบุ Scope",
          unit: item.factorUnit,
          value: Number(item.factor),
          source: item.source ?? "—",
          relatedCount: item.carbonResultCount,
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
      console.error("Load emission factors error:", error);

      setLoadError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดข้อมูล Emission Factor ได้",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const availableResourceTypes = useMemo(
    () =>
      resourceTypes.filter(
        (item) =>
          item.status === "ACTIVE" &&
          item.carbonCalculable,
      ),
    [resourceTypes],
  );

  const selectedResourceType = resourceTypes.find(
    (item) =>
      String(item.resourceTypeId) === resourceTypeId,
  );

  const stats = useMemo(() => {
    const total = rawFactors.length;

    const active = rawFactors.filter(
      (item) => item.status === "ACTIVE",
    ).length;

    const carbonResults = rawFactors.reduce(
      (sum, item) => sum + item.carbonResultCount,
      0,
    );

    const now = new Date();

    const expired = rawFactors.filter((item) => {
      if (!item.expiryDate) {
        return false;
      }

      const expiry = new Date(item.expiryDate);
      return !Number.isNaN(expiry.getTime()) && expiry < now;
    }).length;

    return [
      {
        label: "Emission Factor",
        value: total,
        unit: "รายการ",
        helper: "ข้อมูลมาตรฐานจากฐานข้อมูล",
        icon: <Leaf className="h-5 w-5" />,
        iconClassName: "bg-[#eaf7f1] text-[#168662]",
      },
      {
        label: "ใช้งานอยู่",
        value: active,
        unit: "รายการ",
        helper: "พร้อมใช้คำนวณ Carbon Result",
        icon: <CheckCircle2 className="h-5 w-5" />,
        iconClassName: "bg-[#eaf3ff] text-[#3478da]",
      },
      {
        label: "Carbon Result ที่อ้างอิง",
        value: carbonResults,
        unit: "รายการ",
        helper:
          carbonResults > 0
            ? "มีผลคำนวณใช้ Factor เหล่านี้"
            : "ยังไม่มีผลคำนวณอ้างอิง",
        icon: <Database className="h-5 w-5" />,
        iconClassName: "bg-[#f2edff] text-[#7c56c4]",
      },
      {
        label: "หมดอายุแล้ว",
        value: expired,
        unit: "รายการ",
        helper:
          expired > 0
            ? "ควรตรวจสอบและอัปเดต Factor"
            : "ไม่มี Factor หมดอายุ",
        icon: <CalendarDays className="h-5 w-5" />,
        iconClassName: "bg-[#fff4e5] text-[#d28718]",
      },
    ];
  }, [rawFactors]);

  function resetForm() {
    setResourceTypeId("");
    setScope("");
    setRegion("");
    setSource("");
    setFactor("");
    setFactorUnit("");
    setEffectiveDate("");
    setExpiryDate("");
    setFormError("");
    setEditingItem(null);
  }

  function openCreateModal() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditModal(row: MasterItem) {
    const raw = rawFactors.find(
      (item) => item.factorId === row.id,
    );

    if (!raw) {
      return;
    }

    setEditingItem(row);
    setResourceTypeId(
      String(raw.resourceType.resourceTypeId),
    );
    setScope(raw.scope ?? "");
    setRegion(raw.region ?? "");
    setSource(raw.source ?? "");
    setFactor(raw.factor);
    setFactorUnit(raw.factorUnit);
    setEffectiveDate(toInputDate(raw.effectiveDate));
    setExpiryDate(toInputDate(raw.expiryDate));
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

  function handleResourceTypeChange(value: string) {
    setResourceTypeId(value);

    const resource = resourceTypes.find(
      (item) =>
        String(item.resourceTypeId) === value,
    );

    if (!resource) {
      return;
    }

    if (!factorUnit.trim()) {
      setFactorUnit(
        `kgCO₂e/${resource.defaultUnit.symbol}`,
      );
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (
      !resourceTypeId ||
      !factor.trim() ||
      !factorUnit.trim() ||
      !effectiveDate
    ) {
      setFormError(
        "กรุณาเลือกประเภททรัพยากร และกรอก Factor, หน่วย Factor และวันที่เริ่มใช้งานให้ครบ",
      );
      return;
    }

    const numericFactor = Number(factor);

    if (
      !Number.isFinite(numericFactor) ||
      numericFactor < 0
    ) {
      setFormError(
        "ค่า Emission Factor ต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป",
      );
      return;
    }

    if (
      expiryDate &&
      new Date(expiryDate) < new Date(effectiveDate)
    ) {
      setFormError(
        "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มใช้งาน",
      );
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const isEditing = editingItem !== null;

      const url = isEditing
        ? `/api/platform/master-data/emission-factors/${editingItem.id}`
        : "/api/platform/master-data/emission-factors";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceTypeId: Number(resourceTypeId),
          scope: scope.trim(),
          region: region.trim(),
          source: source.trim(),
          factor: factor.trim(),
          factorUnit: factorUnit.trim(),
          effectiveDate,
          expiryDate,
        }),
      });

      const data =
        (await response.json()) as MutationResponse;

      if (!response.ok || !data.success) {
        setFormError(
          data.message ??
            (isEditing
              ? "ไม่สามารถแก้ไข Emission Factor ได้"
              : "ไม่สามารถเพิ่ม Emission Factor ได้"),
        );
        return;
      }

      setIsFormOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error("Save emission factor error:", error);

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
        `/api/platform/master-data/emission-factors/${deleteTarget.id}`,
        {
          method: "DELETE",
        },
      );

      const data =
        (await response.json()) as MutationResponse;

      if (!response.ok || !data.success) {
        setDeleteError(
          data.message ??
            "ไม่สามารถลบ Emission Factor ได้",
        );
        return;
      }

      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      console.error("Delete emission factor error:", error);

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
      row.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    setStatusUpdatingId(row.id);
    setStatusMessage("");
    setStatusError("");

    try {
      const response = await fetch(
        `/api/platform/master-data/emission-factors/${row.id}`,
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

      const data =
        (await response.json()) as MutationResponse;

      if (!response.ok || !data.success) {
        setStatusError(
          data.message ??
            "ไม่สามารถเปลี่ยนสถานะ Emission Factor ได้",
        );
        return;
      }

      setStatusMessage(
        nextStatus === "ACTIVE"
          ? `เปิดใช้งาน "${row.nameTh}" เรียบร้อยแล้ว`
          : `ปิดใช้งาน "${row.nameTh}" เรียบร้อยแล้ว`,
      );

      await loadData();

      window.setTimeout(() => {
        setStatusMessage("");
      }, 2600);
    } catch (error) {
      console.error(
        "Toggle emission factor status error:",
        error,
      );

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
        <div className="rounded-[24px] border border-[#dcebe3] bg-white px-10 py-9 text-center shadow-[0_22px_65px_rgba(20,104,72,0.08)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[17px] bg-[#eaf7f1] text-[#168662]">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>

          <p className="mt-4 text-[13px] font-semibold text-[#30413a]">
            กำลังโหลด Emission Factor
          </p>

          <p className="mt-1 text-[11px] text-[#87938e]">
            กำลังเชื่อมข้อมูลทรัพยากรและค่าคาร์บอนล่าสุด
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
            void loadData();
          }}
          className="mt-6 rounded-[12px] bg-[#168662] px-5 py-2.5 text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(22,134,98,0.18)] transition hover:-translate-y-0.5 hover:bg-[#117457]"
        >
          ลองโหลดใหม่
        </button>
      </div>
    );
  }

  return (
    <>
      <MasterDataPage
        title="ค่า Emission Factor"
        description="จัดการค่าปัจจัยการปล่อยมาตรฐานกลางตามประเภททรัพยากร Scope พื้นที่ ช่วงวันที่ และแหล่งอ้างอิง เพื่อให้ระบบคำนวณ Carbon Result ได้อย่างตรวจสอบย้อนหลังได้"
        actionLabel="เพิ่ม Emission Factor"
        drawerTitle="รายละเอียด Emission Factor"
        iconType="emission"
        rows={rows}
        columns={columns}
        stats={stats}
        categoryLabel="Scope ทั้งหมด"
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
                : "border-[#d8ebe2] bg-white text-[#23634d]"
            }`}
          >
            <p className="text-[11px] font-semibold">
              {statusError
                ? "ดำเนินการไม่สำเร็จ"
                : "อัปเดตข้อมูลเรียบร้อย"}
            </p>

            <p className="mt-1 text-[11px] leading-5">
              {statusError || statusMessage}
            </p>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#17231d]/50 px-4 backdrop-blur-[5px]">
          <button
            type="button"
            aria-label="ปิด"
            onClick={closeModal}
            className="absolute inset-0"
          />

          <section className="relative z-10 max-h-[94vh] w-full max-w-[720px] overflow-y-auto rounded-[30px] border border-white/70 bg-white shadow-[0_48px_150px_rgba(23,45,34,0.32)]">
            <div className="relative overflow-hidden border-b border-[#e7eee9] px-7 py-6">
              <div className="absolute -right-12 -top-24 h-52 w-52 rounded-full bg-[#dff5e9] blur-3xl" />
              <div className="absolute -left-24 bottom-[-120px] h-48 w-48 rounded-full bg-[#e8f0ff] blur-3xl" />

              <div className="relative flex items-start justify-between gap-5">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-[#eaf7f1] text-[#168662] ring-1 ring-[#d2eadf]">
                    <Leaf className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#4d9278]">
                      Carbon Calculation Standard
                    </p>

                    <h3 className="mt-1.5 text-[22px] font-bold tracking-[-0.035em] text-[#202a25]">
                      {editingItem
                        ? "แก้ไข Emission Factor"
                        : "เพิ่ม Emission Factor"}
                    </h3>

                    <p className="mt-1.5 max-w-[520px] text-[11px] leading-5 text-[#7c8983]">
                      กำหนด Factor ที่ระบบจะใช้แปลงข้อมูลการใช้ทรัพยากรเป็นค่า CO₂e พร้อมช่วงเวลาที่มีผลและแหล่งอ้างอิง
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e2e9e5] bg-white/80 text-[#7c8782] transition hover:bg-[#f4f8f6] hover:text-[#26312c] disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-7">
              <label className="block">
                <span className="text-[11px] font-semibold text-[#42524b]">
                  ประเภททรัพยากร
                </span>

                <select
                  value={resourceTypeId}
                  onChange={(event) =>
                    handleResourceTypeChange(
                      event.target.value,
                    )
                  }
                  disabled={isSubmitting}
                  className="mt-2 h-12 w-full rounded-[13px] border border-[#dce5e0] bg-[#fbfcfb] px-4 text-[12px] text-[#273531] outline-none transition focus:border-[#168662]/45 focus:bg-white focus:ring-4 focus:ring-[#168662]/[0.07]"
                >
                  <option value="">
                    เลือกประเภททรัพยากรที่คำนวณคาร์บอนได้
                  </option>

                  {availableResourceTypes.map((item) => (
                    <option
                      key={item.resourceTypeId}
                      value={item.resourceTypeId}
                    >
                      {item.resourceName} · {item.resourceCode} · {item.defaultUnit.symbol}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold text-[#42524b]">
                    Scope
                  </span>

                  <select
                    value={scope}
                    onChange={(event) =>
                      setScope(event.target.value)
                    }
                    disabled={isSubmitting}
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#dce5e0] bg-[#fbfcfb] px-4 text-[12px] text-[#273531] outline-none transition focus:border-[#168662]/45 focus:bg-white focus:ring-4 focus:ring-[#168662]/[0.07]"
                  >
                    <option value="">ไม่ระบุ Scope</option>
                    {scopeOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-[#42524b]">
                    พื้นที่ / Region
                  </span>

                  <input
                    value={region}
                    onChange={(event) =>
                      setRegion(event.target.value)
                    }
                    disabled={isSubmitting}
                    placeholder="เช่น Thailand"
                    autoComplete="off"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#dce5e0] bg-[#fbfcfb] px-4 text-[12px] text-[#273531] outline-none transition placeholder:text-[#a1aba6] focus:border-[#168662]/45 focus:bg-white focus:ring-4 focus:ring-[#168662]/[0.07]"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold text-[#42524b]">
                    ค่า Emission Factor
                  </span>

                  <input
                    value={factor}
                    onChange={(event) =>
                      setFactor(event.target.value)
                    }
                    disabled={isSubmitting}
                    type="number"
                    min="0"
                    step="0.000001"
                    placeholder="0.000000"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#dce5e0] bg-[#fbfcfb] px-4 text-[13px] font-semibold tabular-nums text-[#273531] outline-none transition placeholder:text-[#a1aba6] focus:border-[#168662]/45 focus:bg-white focus:ring-4 focus:ring-[#168662]/[0.07]"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-[#42524b]">
                    หน่วย Factor
                  </span>

                  <input
                    value={factorUnit}
                    onChange={(event) =>
                      setFactorUnit(event.target.value)
                    }
                    disabled={isSubmitting}
                    placeholder={
                      selectedResourceType
                        ? `kgCO₂e/${selectedResourceType.defaultUnit.symbol}`
                        : "เช่น kgCO₂e/kWh"
                    }
                    autoComplete="off"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#dce5e0] bg-[#fbfcfb] px-4 text-[12px] text-[#273531] outline-none transition placeholder:text-[#a1aba6] focus:border-[#168662]/45 focus:bg-white focus:ring-4 focus:ring-[#168662]/[0.07]"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold text-[#42524b]">
                    วันที่เริ่มใช้งาน
                  </span>

                  <input
                    value={effectiveDate}
                    onChange={(event) =>
                      setEffectiveDate(event.target.value)
                    }
                    disabled={isSubmitting}
                    type="date"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#dce5e0] bg-[#fbfcfb] px-4 text-[12px] text-[#273531] outline-none transition focus:border-[#168662]/45 focus:bg-white focus:ring-4 focus:ring-[#168662]/[0.07]"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-[#42524b]">
                    วันที่สิ้นสุด
                  </span>

                  <input
                    value={expiryDate}
                    onChange={(event) =>
                      setExpiryDate(event.target.value)
                    }
                    disabled={isSubmitting}
                    type="date"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#dce5e0] bg-[#fbfcfb] px-4 text-[12px] text-[#273531] outline-none transition focus:border-[#168662]/45 focus:bg-white focus:ring-4 focus:ring-[#168662]/[0.07]"
                  />

                  <p className="mt-1.5 text-[10px] text-[#919a95]">
                    เว้นว่างได้ หากยังไม่กำหนดวันหมดอายุ
                  </p>
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-[11px] font-semibold text-[#42524b]">
                  แหล่งอ้างอิง
                </span>

                <input
                  value={source}
                  onChange={(event) =>
                    setSource(event.target.value)
                  }
                  disabled={isSubmitting}
                  placeholder="เช่น องค์การบริหารจัดการก๊าซเรือนกระจก (องค์การมหาชน)"
                  autoComplete="off"
                  className="mt-2 h-12 w-full rounded-[13px] border border-[#dce5e0] bg-[#fbfcfb] px-4 text-[12px] text-[#273531] outline-none transition placeholder:text-[#a1aba6] focus:border-[#168662]/45 focus:bg-white focus:ring-4 focus:ring-[#168662]/[0.07]"
                />
              </label>

              <div className="mt-5 rounded-[18px] border border-[#dbece3] bg-[#f7fcf9] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#168662] shadow-sm ring-1 ring-[#dbece3]">
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-[#346a57]">
                      เส้นทางการคำนวณ
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-[#708078]">
                      {selectedResourceType
                        ? selectedResourceType.resourceName
                        : "Resource Type"}
                      {"  ×  "}
                      {factor || "Emission Factor"}
                      {"  →  "}
                      Carbon Result (kgCO₂e)
                    </p>
                  </div>
                </div>
              </div>

              {availableResourceTypes.length === 0 && (
                <div className="mt-5 rounded-[14px] border border-[#f2dfc2] bg-[#fff9ef] px-4 py-3 text-[11px] leading-5 text-[#96611b]">
                  ยังไม่มีประเภททรัพยากรที่เปิดใช้งานและตั้งค่า “คำนวณคาร์บอนได้” กรุณาสร้าง Resource Type ให้พร้อมก่อนเพิ่ม Emission Factor
                </div>
              )}

              {formError && (
                <div
                  role="alert"
                  className="mt-5 rounded-[13px] border border-[#f0d5d8] bg-[#fff5f6] px-4 py-3 text-[11px] leading-5 text-[#b83b4b]"
                >
                  {formError}
                </div>
              )}

              <div className="mt-7 flex items-center justify-end gap-3 border-t border-[#e8eee9] pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="h-11 rounded-[12px] border border-[#dfe6e2] bg-white px-5 text-[12px] font-semibold text-[#5f6b65] transition hover:bg-[#f7f9f8] disabled:opacity-50"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    availableResourceTypes.length === 0
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#168662] px-5 text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(22,134,98,0.22)] transition hover:-translate-y-0.5 hover:bg-[#117457] disabled:cursor-not-allowed disabled:opacity-50"
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
                      เพิ่ม Emission Factor
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-[#17231d]/50 px-4 backdrop-blur-[5px]">
          <button
            type="button"
            aria-label="ปิด"
            onClick={closeDeleteModal}
            className="absolute inset-0"
          />

          <section className="relative z-10 w-full max-w-[470px] overflow-hidden rounded-[26px] border border-[#eadcdf] bg-white shadow-[0_40px_120px_rgba(41,32,34,0.26)]">
            <div className="px-7 pb-7 pt-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#fff0f2] text-[#c94e5c] ring-1 ring-[#f3d8dc]">
                  <AlertTriangle className="h-5 w-5" />
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
                Delete Emission Factor
              </p>

              <h3 className="mt-1.5 text-[22px] font-bold tracking-[-0.035em] text-[#2a2728]">
                ลบ Factor นี้?
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#747a77]">
                คุณกำลังจะลบ Emission Factor ของ
                <span className="mx-1 font-semibold text-[#343837]">
                  {deleteTarget.nameTh}
                </span>
              </p>

              <div className="mt-5 rounded-[17px] border border-[#ebe7e4] bg-[#fbfaf9] p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-medium text-[#8a918d]">
                    Factor
                  </span>

                  <span className="text-[12px] font-bold text-[#168662]">
                    {deleteTarget.value ?? "—"} {deleteTarget.unit ?? ""}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4 border-t border-[#efebe8] pt-3">
                  <span className="text-[10px] font-medium text-[#8a918d]">
                    Scope
                  </span>

                  <span className="text-[11px] font-semibold text-[#4c5551]">
                    {deleteTarget.category ?? "—"}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4 border-t border-[#efebe8] pt-3">
                  <span className="text-[10px] font-medium text-[#8a918d]">
                    Carbon Result ที่อ้างอิง
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
                  Factor นี้ถูกใช้คำนวณ Carbon Result แล้ว จึงไม่สามารถลบได้ ควรปิดสถานะและสร้าง Factor เวอร์ชันใหม่แทน
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