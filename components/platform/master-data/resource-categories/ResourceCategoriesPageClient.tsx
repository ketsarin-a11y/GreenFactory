"use client";

import {
  AlertTriangle,
  Ban,
  Boxes,
  CheckCircle2,
  Layers3,
  LoaderCircle,
  Plus,
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

type ResourceCategoryApiItem = {
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  description: string | null;
  status: string;
  resourceTypeCount: number;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: ResourceCategoryApiItem[];
};

const columns: MasterColumn[] = [
  { key: "name", label: "หมวดหมู่ทรัพยากร" },
  { key: "code", label: "รหัส" },
  { key: "description", label: "คำอธิบาย" },
  { key: "relatedCount", label: "ประเภททรัพยากรที่เชื่อมอยู่" },
  { key: "status", label: "สถานะ" },
];

const tones: MasterTone[] = [
  "purple",
  "green",
  "blue",
  "orange",
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

export function ResourceCategoriesPageClient() {
  const [rows, setRows] = useState<MasterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);

  const [categoryCode, setCategoryCode] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<MasterItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      setLoadError("");

      const response = await fetch(
        "/api/platform/master-data/resource-categories",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "ไม่สามารถโหลดข้อมูลหมวดหมู่ทรัพยากรได้",
        );
      }

      setRows(
        (data.data ?? []).map((item, index) => ({
          id: item.categoryId,
          code: item.categoryCode,
          nameTh: item.categoryName,
          description: item.description ?? "",
          relatedCount: item.resourceTypeCount,
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
      console.error("Load resource categories error:", error);

      setLoadError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดข้อมูลหมวดหมู่ทรัพยากรได้",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((row) => row.status === "ACTIVE").length;
    const inactive = rows.filter((row) => row.status === "INACTIVE").length;
    const resourceTypeCount = rows.reduce(
      (sum, row) => sum + (row.relatedCount ?? 0),
      0,
    );

    return [
      {
        label: "หมวดหมู่ทั้งหมด",
        value: total,
        unit: "หมวดหมู่",
        helper: "ข้อมูลจากฐานข้อมูล",
        icon: <Boxes className="h-5 w-5" />,
        iconClassName: "bg-[#f2edff] text-[#7c56c4]",
      },
      {
        label: "ประเภททรัพยากรที่เชื่อมอยู่",
        value: resourceTypeCount,
        unit: "ประเภท",
        helper:
          resourceTypeCount > 0
            ? "อ้างอิงหมวดหมู่ในระบบ"
            : "ยังไม่มีประเภททรัพยากรเชื่อมอยู่",
        icon: <Layers3 className="h-5 w-5" />,
        iconClassName: "bg-[#eaf3ff] text-[#3478da]",
      },
      {
        label: "ใช้งานอยู่",
        value: active,
        unit: "หมวดหมู่",
        helper: "พร้อมให้ประเภททรัพยากรเลือกใช้งาน",
        icon: <CheckCircle2 className="h-5 w-5" />,
        iconClassName: "bg-[#eaf7f1] text-[#168662]",
      },
      {
        label: "ไม่ใช้งาน",
        value: inactive,
        unit: "หมวดหมู่",
        helper:
          inactive > 0
            ? "ถูกปิดการใช้งาน"
            : "ไม่มีรายการปิดใช้งาน",
        icon: <Ban className="h-5 w-5" />,
        iconClassName: "bg-[#fff0f1] text-[#d65a66]",
      },
    ];
  }, [rows]);

  function resetForm() {
    setCategoryCode("");
    setCategoryName("");
    setDescription("");
    setFormError("");
    setEditingItem(null);
  }

  function openCreateModal() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditModal(row: MasterItem) {
    setEditingItem(row);
    setCategoryCode(row.code);
    setCategoryName(row.nameTh);
    setDescription(row.description ?? "");
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

    const code = categoryCode.trim().toUpperCase();
    const name = categoryName.trim();
    const detail = description.trim();

    if (!code) {
      setFormError("กรุณากรอกรหัสหมวดหมู่ทรัพยากร");
      return;
    }

    if (!name) {
      setFormError("กรุณากรอกชื่อหมวดหมู่ทรัพยากร");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const isEditing = editingItem !== null;

      const url = isEditing
        ? `/api/platform/master-data/resource-categories/${editingItem.id}`
        : "/api/platform/master-data/resource-categories";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryCode: code,
          categoryName: name,
          description: detail,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        setFormError(
          data.message ??
            (isEditing
              ? "ไม่สามารถแก้ไขหมวดหมู่ทรัพยากรได้"
              : "ไม่สามารถเพิ่มหมวดหมู่ทรัพยากรได้"),
        );
        return;
      }

      setIsFormOpen(false);
      resetForm();
      await loadCategories();
    } catch (error) {
      console.error("Save resource category error:", error);

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
        `/api/platform/master-data/resource-categories/${deleteTarget.id}`,
        {
          method: "DELETE",
        },
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        setDeleteError(
          data.message ??
            "ไม่สามารถลบหมวดหมู่ทรัพยากรได้",
        );
        return;
      }

      setDeleteTarget(null);
      await loadCategories();
    } catch (error) {
      console.error("Delete resource category error:", error);

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
        `/api/platform/master-data/resource-categories/${row.id}`,
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
          data.message ??
            "ไม่สามารถเปลี่ยนสถานะหมวดหมู่ทรัพยากรได้",
        );
        return;
      }

      setStatusMessage(
        nextStatus === "ACTIVE"
          ? `เปิดใช้งาน "${row.nameTh}" เรียบร้อยแล้ว`
          : `ปิดใช้งาน "${row.nameTh}" เรียบร้อยแล้ว`,
      );

      await loadCategories();

      window.setTimeout(() => {
        setStatusMessage("");
      }, 2600);
    } catch (error) {
      console.error(
        "Toggle resource category status error:",
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
        <div className="rounded-[22px] border border-[#e8e4df] bg-white px-10 py-9 text-center shadow-[0_20px_60px_rgba(52,45,37,0.06)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#f2edff] text-[#7c56c4]">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>

          <p className="mt-4 text-[13px] font-semibold text-[#37423d]">
            กำลังโหลดหมวดหมู่ทรัพยากร
          </p>

          <p className="mt-1 text-[11px] text-[#8c9590]">
            กำลังอ่านข้อมูลล่าสุดจากฐานข้อมูล
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
            void loadCategories();
          }}
          className="mt-6 rounded-[12px] bg-[#0d7659] px-5 py-2.5 text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(13,118,89,0.16)] transition hover:-translate-y-0.5 hover:bg-[#09694f]"
        >
          ลองโหลดใหม่
        </button>
      </div>
    );
  }

  return (
    <>
      <MasterDataPage
        title="หมวดหมู่ทรัพยากร"
        description="กำหนดโครงสร้างหมวดหมู่ทรัพยากรมาตรฐานกลางของแพลตฟอร์ม เพื่อใช้จัดกลุ่มประเภททรัพยากรของทุกบริษัทและโรงงานอย่างเป็นระบบ"
        actionLabel="เพิ่มหมวดหมู่ทรัพยากร"
        drawerTitle="รายละเอียดหมวดหมู่ทรัพยากร"
        iconType="category"
        rows={rows}
        columns={columns}
        stats={stats}
        categoryLabel="ทั้งหมด"
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1e2622]/45 px-4 backdrop-blur-[4px]">
          <button
            type="button"
            aria-label="ปิด"
            onClick={closeModal}
            className="absolute inset-0"
          />

          <section className="relative z-10 w-full max-w-[540px] overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_40px_120px_rgba(28,36,31,0.28)]">
            <div className="relative overflow-hidden border-b border-[#ebe8e4] px-7 py-6">
              <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#efe8ff] blur-3xl" />
              <div className="absolute -left-12 bottom-[-90px] h-36 w-36 rounded-full bg-[#e3f4ec] blur-3xl" />

              <div className="relative flex items-start justify-between gap-5">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#f2edff] text-[#7c56c4] ring-1 ring-[#e4d9ff]">
                    <Boxes className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8872b3]">
                      Global Master Data
                    </p>

                    <h3 className="mt-1.5 text-[22px] font-bold tracking-[-0.03em] text-[#202824]">
                      {editingItem
                        ? "แก้ไขหมวดหมู่ทรัพยากร"
                        : "เพิ่มหมวดหมู่ทรัพยากร"}
                    </h3>

                    <p className="mt-1.5 max-w-[390px] text-[11px] leading-5 text-[#7f8984]">
                      {editingItem
                        ? "ปรับปรุงรายละเอียดของหมวดหมู่มาตรฐานที่ใช้อ้างอิงร่วมกันในระบบ"
                        : "สร้างหมวดหมู่มาตรฐานกลางสำหรับจัดกลุ่มประเภททรัพยากรของทุกโรงงาน"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e7e9e7] bg-white/80 text-[#7c8782] transition hover:bg-[#f5f7f6] hover:text-[#26312c] disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold text-[#46514c]">
                    รหัสหมวดหมู่
                  </span>

                  <input
                    value={categoryCode}
                    onChange={(event) =>
                      setCategoryCode(
                        event.target.value.toUpperCase(),
                      )
                    }
                    disabled={isSubmitting}
                    placeholder="เช่น ENERGY"
                    autoComplete="off"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#dfe3df] bg-[#fbfcfb] px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#2c3631] outline-none transition placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-[#a5ada9] focus:border-[#8c70c7]/45 focus:bg-white focus:ring-4 focus:ring-[#8c70c7]/[0.07]"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-[#46514c]">
                    ชื่อหมวดหมู่
                  </span>

                  <input
                    value={categoryName}
                    onChange={(event) =>
                      setCategoryName(event.target.value)
                    }
                    disabled={isSubmitting}
                    placeholder="เช่น พลังงาน"
                    autoComplete="off"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[#dfe3df] bg-[#fbfcfb] px-4 text-[12px] text-[#2c3631] outline-none transition placeholder:text-[#a5ada9] focus:border-[#8c70c7]/45 focus:bg-white focus:ring-4 focus:ring-[#8c70c7]/[0.07]"
                  />
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
                  rows={4}
                  placeholder="อธิบายขอบเขตหรือชนิดของทรัพยากรที่อยู่ในหมวดหมู่นี้"
                  className="mt-2 w-full resize-none rounded-[14px] border border-[#dfe3df] bg-[#fbfcfb] px-4 py-3.5 text-[12px] leading-6 text-[#2c3631] outline-none transition placeholder:text-[#a5ada9] focus:border-[#8c70c7]/45 focus:bg-white focus:ring-4 focus:ring-[#8c70c7]/[0.07]"
                />
              </label>

              <div className="mt-5 rounded-[15px] border border-[#ece8f5] bg-[#faf8ff] px-4 py-3">
                <p className="text-[10px] font-semibold text-[#6e5a99]">
                  การใช้งานของหมวดหมู่นี้
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#817b8b]">
                  หลังสร้างแล้ว หมวดหมู่นี้จะปรากฏเป็นตัวเลือกตอน Platform Admin สร้างประเภททรัพยากร และโรงงานจะใช้ประเภททรัพยากรเหล่านั้นต่ออีกชั้นหนึ่ง
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mt-5 rounded-[13px] border border-[#f0d5d8] bg-[#fff5f6] px-4 py-3 text-[11px] leading-5 text-[#b83b4b]"
                >
                  {formError}
                </div>
              )}

              <div className="mt-7 flex items-center justify-end gap-3 border-t border-[#eeeae6] pt-5">
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
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#7556ad] px-5 text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(117,86,173,0.22)] transition hover:-translate-y-0.5 hover:bg-[#684b9c] disabled:cursor-not-allowed disabled:opacity-60"
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
                      เพิ่มหมวดหมู่
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-[#1e2622]/45 px-4 backdrop-blur-[4px]">
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
                Delete Resource Category
              </p>

              <h3 className="mt-1.5 text-[22px] font-bold tracking-[-0.035em] text-[#2a2728]">
                ลบหมวดหมู่นี้?
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
                    รหัสหมวดหมู่
                  </span>

                  <span className="text-[11px] font-semibold text-[#4c5551]">
                    {deleteTarget.code}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4 border-t border-[#efebe8] pt-3">
                  <span className="text-[10px] font-medium text-[#8a918d]">
                    ประเภททรัพยากรที่เชื่อมอยู่
                  </span>

                  <span
                    className={`text-[11px] font-semibold ${
                      (deleteTarget.relatedCount ?? 0) > 0
                        ? "text-[#c44f5c]"
                        : "text-[#4f5b56]"
                    }`}
                  >
                    {deleteTarget.relatedCount ?? 0} ประเภท
                  </span>
                </div>
              </div>

              {(deleteTarget.relatedCount ?? 0) > 0 && (
                <div className="mt-4 rounded-[14px] border border-[#f1d9dd] bg-[#fff5f6] px-4 py-3 text-[11px] leading-5 text-[#a9404d]">
                  หมวดหมู่นี้ถูกใช้อ้างอิงโดยประเภททรัพยากรอยู่ จึงไม่สามารถลบได้ ควรปิดสถานะแทนเพื่อรักษาความสัมพันธ์ของข้อมูล
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