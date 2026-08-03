"use client";

import {
  AlertTriangle,
  Ban,
  Boxes,
  CheckCircle2,
  Database,
  Leaf,
  LoaderCircle,
  Plus,
  Sparkles,
  Trash2,
  X,
  Zap,
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

type ResourceTypeApiItem = {
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
  emissionFactorCount: number;
  resourceUsageCount: number;
  relatedCount: number;
  createdAt: string;
  updatedAt: string;
};

type ResourceCategoryOption = {
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  status: string;
};

type UnitOption = {
  unitId: number;
  unitCode: string;
  unitName: string;
  symbol: string;
  unitType: string;
  status: string;
};

type ResourceTypesResponse = {
  success: boolean;
  message?: string;
  data?: ResourceTypeApiItem[];
};

type CategoriesResponse = {
  success: boolean;
  message?: string;
  data?: ResourceCategoryOption[];
};

type UnitsResponse = {
  success: boolean;
  message?: string;
  data?: UnitOption[];
};

type MutationResponse = {
  success: boolean;
  message?: string;
  details?: {
    emissionFactorCount?: number;
    resourceUsageCount?: number;
  };
};

const columns: MasterColumn[] = [
  { key: "name", label: "ประเภททรัพยากร" },
  { key: "code", label: "รหัส" },
  { key: "category", label: "หมวดหมู่" },
  { key: "unit", label: "หน่วยมาตรฐาน" },
  { key: "source", label: "คาร์บอน" },
  { key: "description", label: "คำอธิบาย" },
  { key: "relatedCount", label: "การอ้างอิง" },
  { key: "status", label: "สถานะ" },
];

const tones: MasterTone[] = [
  "orange",
  "green",
  "blue",
  "purple",
  "teal",
  "rose",
  "slate",
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

export function ResourceTypesPageClient() {
  const [rows, setRows] = useState<MasterItem[]>([]);
  const [rawItems, setRawItems] = useState<ResourceTypeApiItem[]>([]);

  const [categories, setCategories] = useState<ResourceCategoryOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);

  const [resourceCode, setResourceCode] = useState("");
  const [resourceName, setResourceName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [defaultUnitId, setDefaultUnitId] = useState("");
  const [carbonCalculable, setCarbonCalculable] = useState(false);
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

      const [resourceResponse, categoryResponse, unitResponse] =
        await Promise.all([
          fetch("/api/platform/master-data/resource-types", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/platform/master-data/resource-categories", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/platform/master-data/units", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

      const resourceData =
        (await resourceResponse.json()) as ResourceTypesResponse;
      const categoryData =
        (await categoryResponse.json()) as CategoriesResponse;
      const unitData =
        (await unitResponse.json()) as UnitsResponse;

      if (!resourceResponse.ok || !resourceData.success) {
        throw new Error(
          resourceData.message ??
            "ไม่สามารถโหลดข้อมูลประเภททรัพยากรได้",
        );
      }

      if (!categoryResponse.ok || !categoryData.success) {
        throw new Error(
          categoryData.message ??
            "ไม่สามารถโหลดหมวดหมู่ทรัพยากรได้",
        );
      }

      if (!unitResponse.ok || !unitData.success) {
        throw new Error(
          unitData.message ??
            "ไม่สามารถโหลดข้อมูลหน่วยวัดได้",
        );
      }

      const resourceItems = resourceData.data ?? [];
      setRawItems(resourceItems);
      setCategories(categoryData.data ?? []);
      setUnits(unitData.data ?? []);

      setRows(
        resourceItems.map((item, index) => ({
          id: item.resourceTypeId,
          code: item.resourceCode,
          nameTh: item.resourceName,
          description: item.description ?? "",
          category: item.category.categoryName,
          unit: item.defaultUnit.symbol,
          source: item.carbonCalculable
            ? "คำนวณคาร์บอนได้"
            : "ไม่คำนวณคาร์บอน",
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
      console.error("Load resource types error:", error);

      setLoadError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดข้อมูลประเภททรัพยากรได้",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activeCategories = useMemo(
    () =>
      categories.filter(
        (item) => item.status === "ACTIVE",
      ),
    [categories],
  );

  const activeUnits = useMemo(
    () =>
      units.filter(
        (item) => item.status === "ACTIVE",
      ),
    [units],
  );

  const stats = useMemo(() => {
    const total = rawItems.length;

    const usageCount = rawItems.reduce(
      (sum, item) => sum + item.resourceUsageCount,
      0,
    );

    const carbonReady = rawItems.filter(
      (item) =>
        item.carbonCalculable &&
        item.emissionFactorCount > 0,
    ).length;

    const inactive = rawItems.filter(
      (item) => item.status === "INACTIVE",
    ).length;

    return [
      {
        label: "ประเภททรัพยากร",
        value: total,
        unit: "ประเภท",
        helper: "ข้อมูลจากฐานข้อมูล",
        icon: <Zap className="h-5 w-5" />,
        iconClassName: "bg-[#fff4e5] text-[#d28718]",
      },
      {
        label: "รายการใช้งาน",
        value: usageCount,
        unit: "รายการ",
        helper:
          usageCount > 0
            ? "Resource Usage ที่เชื่อมอยู่"
            : "ยังไม่มีการบันทึกการใช้งาน",
        icon: <Database className="h-5 w-5" />,
        iconClassName: "bg-[#eaf3ff] text-[#3478da]",
      },
      {
        label: "พร้อมคำนวณคาร์บอน",
        value: carbonReady,
        unit: "ประเภท",
        helper: "เปิดคำนวณและมี Emission Factor",
        icon: <Leaf className="h-5 w-5" />,
        iconClassName: "bg-[#eaf7f1] text-[#168662]",
      },
      {
        label: "ไม่ใช้งาน",
        value: inactive,
        unit: "ประเภท",
        helper:
          inactive > 0
            ? "ถูกปิดการใช้งาน"
            : "ไม่มีรายการปิดใช้งาน",
        icon: <Ban className="h-5 w-5" />,
        iconClassName: "bg-[#fff0f1] text-[#d65a66]",
      },
    ];
  }, [rawItems]);

  function resetForm() {
    setResourceCode("");
    setResourceName("");
    setDescription("");
    setCategoryId("");
    setDefaultUnitId("");
    setCarbonCalculable(false);
    setFormError("");
    setEditingItem(null);
  }

  function openCreateModal() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditModal(row: MasterItem) {
    const raw = rawItems.find(
      (item) => item.resourceTypeId === row.id,
    );

    if (!raw) {
      return;
    }

    setEditingItem(row);
    setResourceCode(raw.resourceCode);
    setResourceName(raw.resourceName);
    setDescription(raw.description ?? "");
    setCategoryId(String(raw.category.categoryId));
    setDefaultUnitId(String(raw.defaultUnit.unitId));
    setCarbonCalculable(raw.carbonCalculable);
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

    const code = resourceCode.trim().toUpperCase();
    const name = resourceName.trim();
    const detail = description.trim();

    if (!code || !name || !categoryId || !defaultUnitId) {
      setFormError(
        "กรุณากรอกข้อมูลและเลือกหมวดหมู่กับหน่วยวัดให้ครบ",
      );
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const isEditing = editingItem !== null;

      const url = isEditing
        ? `/api/platform/master-data/resource-types/${editingItem.id}`
        : "/api/platform/master-data/resource-types";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceCode: code,
          resourceName: name,
          description: detail,
          categoryId: Number(categoryId),
          defaultUnitId: Number(defaultUnitId),
          carbonCalculable,
        }),
      });

      const data =
        (await response.json()) as MutationResponse;

      if (!response.ok || !data.success) {
        setFormError(
          data.message ??
            (isEditing
              ? "ไม่สามารถแก้ไขประเภททรัพยากรได้"
              : "ไม่สามารถเพิ่มประเภททรัพยากรได้"),
        );
        return;
      }

      setIsFormOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error("Save resource type error:", error);

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
        `/api/platform/master-data/resource-types/${deleteTarget.id}`,
        {
          method: "DELETE",
        },
      );

      const data =
        (await response.json()) as MutationResponse;

      if (!response.ok || !data.success) {
        setDeleteError(
          data.message ??
            "ไม่สามารถลบประเภททรัพยากรได้",
        );
        return;
      }

      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      console.error("Delete resource type error:", error);

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
        `/api/platform/master-data/resource-types/${row.id}`,
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
            "ไม่สามารถเปลี่ยนสถานะประเภททรัพยากรได้",
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
        "Toggle resource type status error:",
        error,
      );

      setStatusError(
        "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setStatusUpdatingId(null);
    }
  }

  const selectedCategory = activeCategories.find(
    (item) => String(item.categoryId) === categoryId,
  );

  const selectedUnit = activeUnits.find(
    (item) => String(item.unitId) === defaultUnitId,
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[440px] items-center justify-center">
        <div className="rounded-[24px] border border-[#f0e1cf] bg-white px-10 py-9 text-center shadow-[0_22px_65px_rgba(172,111,36,0.08)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[17px] bg-[#fff4e5] text-[#d28718]">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>

          <p className="mt-4 text-[13px] font-semibold text-[#3b403d]">
            กำลังโหลดประเภททรัพยากร
          </p>

          <p className="mt-1 text-[11px] text-[#89908c]">
            กำลังเชื่อมข้อมูลหมวดหมู่ หน่วย และการใช้งาน
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
          className="mt-6 rounded-[12px] bg-[#d28718] px-5 py-2.5 text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(210,135,24,0.18)] transition hover:-translate-y-0.5 hover:bg-[#b97514]"
        >
          ลองโหลดใหม่
        </button>
      </div>
    );
  }

  return (
    <>
      <MasterDataPage
        title="ประเภททรัพยากร"
        description="กำหนดประเภททรัพยากรมาตรฐานกลางของแพลตฟอร์ม พร้อมหมวดหมู่ หน่วยเริ่มต้น และสถานะการคำนวณคาร์บอน เพื่อให้ทุกโรงงานบันทึกข้อมูลในรูปแบบเดียวกัน"
        actionLabel="เพิ่มประเภททรัพยากร"
        drawerTitle="รายละเอียดประเภททรัพยากร"
        iconType="resource"
        rows={rows}
        columns={columns}
        stats={stats}
        categoryLabel="หมวดหมู่ทรัพยากรทั้งหมด"
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1e241f]/45 px-4 backdrop-blur-[4px]">
          <button
            type="button"
            aria-label="ปิด"
            onClick={closeModal}
            className="absolute inset-0"
          />

          <section className="relative z-10 max-h-[92vh] w-full max-w-[650px] overflow-y-auto rounded-[30px] border border-white/70 bg-white shadow-[0_46px_140px_rgba(42,37,29,0.30)]">
            <div className="relative overflow-hidden border-b border-[#eee8df] px-7 py-6">
              <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-[#fff0d8] blur-3xl" />
              <div className="absolute -left-20 bottom-[-110px] h-44 w-44 rounded-full bg-[#e3f5ec] blur-3xl" />

              <div className="relative flex items-start justify-between gap-5">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-[#fff4e5] text-[#d28718] ring-1 ring-[#f4dfbe]">
                    <Zap className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#b87b27]">
                      Resource Intelligence Standard
                    </p>

                    <h3 className="mt-1.5 text-[22px] font-bold tracking-[-0.03em] text-[#242923]">
                      {editingItem
                        ? "แก้ไขประเภททรัพยากร"
                        : "เพิ่มประเภททรัพยากร"}
                    </h3>

                    <p className="mt-1.5 max-w-[470px] text-[11px] leading-5 text-[#7f8782]">
                      เชื่อมประเภททรัพยากรเข้ากับหมวดหมู่ หน่วยมาตรฐาน และระบบคำนวณคาร์บอนของแพลตฟอร์ม
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e6e8e5] bg-white/80 text-[#7c8782] transition hover:bg-[#f6f7f5] hover:text-[#26312c] disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold text-[#46514c]">
                    รหัสประเภททรัพยากร
                  </span>

                  <input
                    value={resourceCode}
                    onChange={(event) =>
                      setResourceCode(
                        event.target.value.toUpperCase(),
                      )
                    }
                    disabled={isSubmitting}
                    placeholder="เช่น ELECTRICITY"
                    autoComplete="off"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#e3e0da] bg-[#fcfcfb] px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#2c342f] outline-none transition placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-[#a7aca8] focus:border-[#d28718]/45 focus:bg-white focus:ring-4 focus:ring-[#d28718]/[0.07]"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-[#46514c]">
                    ชื่อประเภททรัพยากร
                  </span>

                  <input
                    value={resourceName}
                    onChange={(event) =>
                      setResourceName(event.target.value)
                    }
                    disabled={isSubmitting}
                    placeholder="เช่น ไฟฟ้า"
                    autoComplete="off"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#e3e0da] bg-[#fcfcfb] px-4 text-[12px] text-[#2c342f] outline-none transition placeholder:text-[#a7aca8] focus:border-[#d28718]/45 focus:bg-white focus:ring-4 focus:ring-[#d28718]/[0.07]"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold text-[#46514c]">
                    หมวดหมู่ทรัพยากร
                  </span>

                  <select
                    value={categoryId}
                    onChange={(event) =>
                      setCategoryId(event.target.value)
                    }
                    disabled={isSubmitting}
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#e3e0da] bg-[#fcfcfb] px-4 text-[12px] text-[#2c342f] outline-none transition focus:border-[#d28718]/45 focus:bg-white focus:ring-4 focus:ring-[#d28718]/[0.07]"
                  >
                    <option value="">
                      เลือกหมวดหมู่
                    </option>

                    {activeCategories.map((item) => (
                      <option
                        key={item.categoryId}
                        value={item.categoryId}
                      >
                        {item.categoryName} · {item.categoryCode}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-[#46514c]">
                    หน่วยมาตรฐาน
                  </span>

                  <select
                    value={defaultUnitId}
                    onChange={(event) =>
                      setDefaultUnitId(event.target.value)
                    }
                    disabled={isSubmitting}
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#e3e0da] bg-[#fcfcfb] px-4 text-[12px] text-[#2c342f] outline-none transition focus:border-[#d28718]/45 focus:bg-white focus:ring-4 focus:ring-[#d28718]/[0.07]"
                  >
                    <option value="">
                      เลือกหน่วยวัด
                    </option>

                    {activeUnits.map((item) => (
                      <option
                        key={item.unitId}
                        value={item.unitId}
                      >
                        {item.symbol} · {item.unitName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-[11px] font-semibold text-[#46514c]">
                  คำอธิบาย
                </span>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  disabled={isSubmitting}
                  rows={3}
                  placeholder="อธิบายลักษณะการใช้งานหรือขอบเขตของทรัพยากรประเภทนี้"
                  className="mt-2 w-full resize-none rounded-[14px] border border-[#e3e0da] bg-[#fcfcfb] px-4 py-3.5 text-[12px] leading-6 text-[#2c342f] outline-none transition placeholder:text-[#a7aca8] focus:border-[#d28718]/45 focus:bg-white focus:ring-4 focus:ring-[#d28718]/[0.07]"
                />
              </label>

              <div className="mt-5 rounded-[18px] border border-[#dcece3] bg-[#f8fcfa] p-4">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#168662] shadow-sm ring-1 ring-[#dcece3]">
                      <Leaf className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-[#315f4f]">
                        ใช้สำหรับคำนวณคาร์บอน
                      </p>

                      <p className="mt-1 max-w-[420px] text-[10px] leading-5 text-[#71827a]">
                        เปิดตัวเลือกนี้หากทรัพยากรประเภทนี้ต้องเชื่อมกับ Emission Factor เพื่อคำนวณ CO₂e
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setCarbonCalculable(
                        (current) => !current,
                      )
                    }
                    disabled={isSubmitting}
                    className={`relative mt-1 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-all duration-200 ${
                      carbonCalculable
                        ? "border-[#9dd8c3] bg-[#1f9a70]"
                        : "border-[#d9deda] bg-[#e8ece9]"
                    }`}
                    aria-label="ตั้งค่าการคำนวณคาร์บอน"
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        carbonCalculable
                          ? "translate-x-[24px]"
                          : "translate-x-[3px]"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-[18px] border border-[#ece9e4] bg-[#fafaf9] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#6b756f] shadow-sm ring-1 ring-[#e8e5e1]">
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-[#4d5752]">
                      ตัวอย่างการเชื่อมโยง
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-[#7a837e]">
                      {selectedCategory
                        ? selectedCategory.categoryName
                        : "หมวดหมู่"}
                      {"  →  "}
                      {resourceName || "ประเภททรัพยากร"}
                      {"  →  "}
                      {selectedUnit
                        ? selectedUnit.symbol
                        : "หน่วย"}
                      {"  →  "}
                      {carbonCalculable
                        ? "Emission Factor / Carbon Result"
                        : "Resource Usage"}
                    </p>
                  </div>
                </div>
              </div>

              {activeCategories.length === 0 && (
                <div className="mt-5 rounded-[14px] border border-[#f2dfc2] bg-[#fff9ef] px-4 py-3 text-[11px] leading-5 text-[#96611b]">
                  ยังไม่มีหมวดหมู่ทรัพยากรที่เปิดใช้งาน กรุณาสร้างหมวดหมู่ทรัพยากรก่อน
                </div>
              )}

              {activeUnits.length === 0 && (
                <div className="mt-3 rounded-[14px] border border-[#f2dfc2] bg-[#fff9ef] px-4 py-3 text-[11px] leading-5 text-[#96611b]">
                  ยังไม่มีหน่วยวัดที่เปิดใช้งาน กรุณาสร้างหน่วยวัดก่อน
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

              <div className="mt-7 flex items-center justify-end gap-3 border-t border-[#eee9e2] pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="h-11 rounded-[12px] border border-[#dfe4e1] bg-white px-5 text-[12px] font-semibold text-[#5f6b65] transition hover:bg-[#f7f9f8] disabled:opacity-50"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    activeCategories.length === 0 ||
                    activeUnits.length === 0
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#d28718] px-5 text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(210,135,24,0.22)] transition hover:-translate-y-0.5 hover:bg-[#b97514] disabled:cursor-not-allowed disabled:opacity-50"
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
                      เพิ่มประเภททรัพยากร
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-[#1e241f]/45 px-4 backdrop-blur-[4px]">
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
                Delete Resource Type
              </p>

              <h3 className="mt-1.5 text-[22px] font-bold tracking-[-0.035em] text-[#2a2728]">
                ลบประเภททรัพยากรนี้?
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#747a77]">
                คุณกำลังจะลบ
                <span className="mx-1 font-semibold text-[#343837]">
                  {deleteTarget.nameTh}
                </span>
                ออกจากมาตรฐานกลางของแพลตฟอร์ม
              </p>

              <div className="mt-5 rounded-[17px] border border-[#ebe7e4] bg-[#fbfaf9] p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-medium text-[#8a918d]">
                    รหัส
                  </span>

                  <span className="text-[11px] font-semibold text-[#4c5551]">
                    {deleteTarget.code}
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
                  ประเภททรัพยากรนี้มี Resource Usage หรือ Emission Factor อ้างอิงอยู่ จึงไม่สามารถลบได้ ควรปิดสถานะแทน
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