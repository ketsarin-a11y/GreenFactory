"use client";

import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Factory,
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

type MachineTypeApiItem = {
  machineTypeId: number;
  machineTypeCode: string;
  machineTypeName: string;
  description: string | null;
  status: string;
  machineCount: number;
  createdAt: string;
  updatedAt: string;
};

type MachineTypesResponse = {
  success: boolean;
  message?: string;
  data?: MachineTypeApiItem[];
};

type MutationResponse = {
  success: boolean;
  message?: string;
};

const columns: MasterColumn[] = [
  { key: "name", label: "ประเภทเครื่องจักร" },
  { key: "code", label: "รหัส" },
  { key: "description", label: "คำอธิบาย" },
  { key: "relatedCount", label: "เครื่องจักร" },
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

export function MachineTypesPageClient() {
  const [rows, setRows] = useState<MasterItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);

  const [machineTypeCode, setMachineTypeCode] = useState("");
  const [machineTypeName, setMachineTypeName] = useState("");
  const [description, setDescription] = useState("");

  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<MasterItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  const loadMachineTypes = useCallback(async () => {
    try {
      setLoadError("");

      const response = await fetch(
        "/api/platform/master-data/machine-types",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data =
        (await response.json()) as MachineTypesResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ??
            "ไม่สามารถโหลดข้อมูลประเภทเครื่องจักรได้",
        );
      }

      const mappedRows: MasterItem[] = (
        data.data ?? []
      ).map((item, index) => ({
        id: item.machineTypeId,
        code: item.machineTypeCode,
        nameTh: item.machineTypeName,
        description: item.description ?? "",
        relatedCount: item.machineCount,
        status:
          item.status === "INACTIVE"
            ? "INACTIVE"
            : "ACTIVE",
        createdAt: formatDate(item.createdAt),
        updatedAt: formatDate(item.updatedAt),
        tone: tones[index % tones.length],
      }));

      setRows(mappedRows);
    } catch (error) {
      console.error("Load machine types error:", error);

      setLoadError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดข้อมูลประเภทเครื่องจักรได้",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMachineTypes();
  }, [loadMachineTypes]);

  const stats = useMemo(() => {
    const total = rows.length;

    const active = rows.filter(
      (row) => row.status === "ACTIVE",
    ).length;

    const inactive = rows.filter(
      (row) => row.status === "INACTIVE",
    ).length;

    const machineCount = rows.reduce(
      (sum, row) => sum + (row.relatedCount ?? 0),
      0,
    );

    return [
      {
        label: "ประเภททั้งหมด",
        value: total,
        unit: "ประเภท",
        helper: "ข้อมูลจากฐานข้อมูล",
        icon: <Factory className="h-5 w-5" />,
        iconClassName:
          "bg-[#eaf7f1] text-[#168662]",
      },
      {
        label: "เครื่องจักรที่เชื่อมอยู่",
        value: machineCount,
        unit: "เครื่อง",
        helper:
          machineCount > 0
            ? "อ้างอิงประเภทเครื่องจักรในระบบ"
            : "ยังไม่มีเครื่องจักรเชื่อมกับประเภท",
        icon: <Factory className="h-5 w-5" />,
        iconClassName:
          "bg-[#eaf3ff] text-[#3478da]",
      },
      {
        label: "ใช้งานอยู่",
        value: active,
        unit: "ประเภท",
        helper: "พร้อมให้โรงงานเลือกใช้งาน",
        icon: (
          <CheckCircle2 className="h-5 w-5" />
        ),
        iconClassName:
          "bg-[#fff4e5] text-[#d28718]",
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
        iconClassName:
          "bg-[#fff0f1] text-[#d65a66]",
      },
    ];
  }, [rows]);

  function resetForm() {
    setMachineTypeCode("");
    setMachineTypeName("");
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
    setMachineTypeCode(row.code);
    setMachineTypeName(row.nameTh);
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

    const code = machineTypeCode
      .trim()
      .toUpperCase();

    const name = machineTypeName.trim();
    const detail = description.trim();

    if (!code) {
      setFormError(
        "กรุณากรอกรหัสประเภทเครื่องจักร",
      );
      return;
    }

    if (!name) {
      setFormError(
        "กรุณากรอกชื่อประเภทเครื่องจักร",
      );
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const isEditing = editingItem !== null;

      const url = isEditing
        ? `/api/platform/master-data/machine-types/${editingItem.id}`
        : "/api/platform/master-data/machine-types";

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          machineTypeCode: code,
          machineTypeName: name,
          description: detail,
        }),
      });

      const data =
        (await response.json()) as MutationResponse;

      if (!response.ok || !data.success) {
        setFormError(
          data.message ??
            (isEditing
              ? "ไม่สามารถแก้ไขประเภทเครื่องจักรได้"
              : "ไม่สามารถเพิ่มประเภทเครื่องจักรได้"),
        );
        return;
      }

      setIsFormOpen(false);
      resetForm();

      await loadMachineTypes();
    } catch (error) {
      console.error(
        editingItem
          ? "Update machine type error:"
          : "Create machine type error:",
        error,
      );

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
        `/api/platform/master-data/machine-types/${deleteTarget.id}`,
        {
          method: "DELETE",
        },
      );

      const data =
        (await response.json()) as MutationResponse;

      if (!response.ok || !data.success) {
        setDeleteError(
          data.message ??
            "ไม่สามารถลบประเภทเครื่องจักรได้",
        );
        return;
      }

      setDeleteTarget(null);
      setDeleteError("");

      await loadMachineTypes();
    } catch (error) {
      console.error("Delete machine type error:", error);

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
        `/api/platform/master-data/machine-types/${row.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            machineTypeCode: row.code,
            machineTypeName: row.nameTh,
            description: row.description ?? "",
            status: nextStatus,
          }),
        },
      );

      const data =
        (await response.json()) as MutationResponse;

      if (!response.ok || !data.success) {
        setStatusError(
          data.message ??
            "ไม่สามารถเปลี่ยนสถานะประเภทเครื่องจักรได้",
        );
        return;
      }

      setStatusMessage(
        nextStatus === "ACTIVE"
          ? `เปิดใช้งาน "${row.nameTh}" เรียบร้อยแล้ว`
          : `ปิดใช้งาน "${row.nameTh}" เรียบร้อยแล้ว`,
      );

      await loadMachineTypes();

      window.setTimeout(() => {
        setStatusMessage("");
      }, 2600);
    } catch (error) {
      console.error("Toggle machine type status error:", error);

      setStatusError(
        "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setStatusUpdatingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-[#0d7659]" />

          <p className="mt-3 text-[12px] text-[#7b8580]">
            กำลังโหลดข้อมูลประเภทเครื่องจักร
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-[18px] border border-[#f0d7d9] bg-white px-6 py-12 text-center">
        <p className="text-[13px] font-semibold text-[#b83b4b]">
          ไม่สามารถโหลดข้อมูลได้
        </p>

        <p className="mt-2 text-[11px] text-[#858f8a]">
          {loadError}
        </p>

        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            void loadMachineTypes();
          }}
          className="mt-5 rounded-[11px] bg-[#0d7659] px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#09694f]"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <>
      <MasterDataPage
        title="ประเภทเครื่องจักร"
        description="จัดการมาตรฐานประเภทเครื่องจักรกลางของแพลตฟอร์ม เพื่อให้แต่ละบริษัทและโรงงานนำไปใช้อ้างอิงกับเครื่องจักรจริง"
        actionLabel="เพิ่มประเภทเครื่องจักร"
        drawerTitle="รายละเอียดประเภทเครื่องจักร"
        iconType="machine"
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
            className={`min-w-[300px] max-w-[380px] rounded-[16px] border px-4 py-3 shadow-[0_18px_50px_rgba(28,40,34,0.16)] ${
              statusError
                ? "border-[#f1d7db] bg-[#fff7f8] text-[#a9404d]"
                : "border-[#d8ebe2] bg-white text-[#23634d]"
            }`}
          >
            <p className="text-[11px] font-semibold">
              {statusError ? "เปลี่ยนสถานะไม่สำเร็จ" : "อัปเดตสถานะแล้ว"}
            </p>
            <p className="mt-1 text-[11px] leading-5">
              {statusError || statusMessage}
            </p>
          </div>
        </div>
      )}


      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#16241d]/35 px-4 backdrop-blur-[2px]">
          <button
            type="button"
            aria-label="ปิด"
            onClick={closeModal}
            className="absolute inset-0"
          />

          <section className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-[24px] border border-[#dfe7e2] bg-white shadow-[0_32px_90px_rgba(25,50,37,0.22)]">
            <div className="flex items-start justify-between border-b border-[#edf0ee] px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a948f]">
                  Global Master Data
                </p>

                <h3 className="mt-1.5 text-[20px] font-bold tracking-[-0.025em] text-[#1e2924]">
                  {editingItem
                    ? "แก้ไขประเภทเครื่องจักร"
                    : "เพิ่มประเภทเครื่องจักร"}
                </h3>

                <p className="mt-1 text-[11px] leading-5 text-[#7b8580]">
                  {editingItem
                    ? "แก้ไขข้อมูลมาตรฐานของประเภทเครื่องจักร"
                    : "รายการนี้จะเป็นมาตรฐานกลางที่บริษัทในระบบสามารถนำไปใช้อ้างอิงได้"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#7c8782] transition hover:bg-[#f1f4f2] hover:text-[#26312c] disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="px-6 py-6"
            >
              <div>
                <label
                  htmlFor="machineTypeCode"
                  className="text-[11px] font-semibold text-[#46514c]"
                >
                  รหัสประเภทเครื่องจักร
                </label>

                <input
                  id="machineTypeCode"
                  value={machineTypeCode}
                  onChange={(event) =>
                    setMachineTypeCode(
                      event.target.value.toUpperCase(),
                    )
                  }
                  disabled={isSubmitting}
                  placeholder="เช่น REFLOW_OVEN"
                  autoComplete="off"
                  className="mt-2 h-12 w-full rounded-[12px] border border-[#dde3df] bg-[#fbfcfb] px-4 text-[12px] font-medium uppercase tracking-[0.03em] text-[#26312c] outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-[#a2aaa6] focus:border-[#168066]/45 focus:bg-white focus:ring-4 focus:ring-[#168066]/[0.07]"
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="machineTypeName"
                  className="text-[11px] font-semibold text-[#46514c]"
                >
                  ชื่อประเภทเครื่องจักร
                </label>

                <input
                  id="machineTypeName"
                  value={machineTypeName}
                  onChange={(event) =>
                    setMachineTypeName(
                      event.target.value,
                    )
                  }
                  disabled={isSubmitting}
                  placeholder="เช่น Reflow Oven"
                  autoComplete="off"
                  className="mt-2 h-12 w-full rounded-[12px] border border-[#dde3df] bg-[#fbfcfb] px-4 text-[12px] text-[#26312c] outline-none transition placeholder:text-[#a2aaa6] focus:border-[#168066]/45 focus:bg-white focus:ring-4 focus:ring-[#168066]/[0.07]"
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="machineTypeDescription"
                  className="text-[11px] font-semibold text-[#46514c]"
                >
                  คำอธิบาย
                </label>

                <textarea
                  id="machineTypeDescription"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  disabled={isSubmitting}
                  rows={4}
                  placeholder="อธิบายลักษณะหรือการใช้งานของเครื่องจักรประเภทนี้"
                  className="mt-2 w-full resize-none rounded-[12px] border border-[#dde3df] bg-[#fbfcfb] px-4 py-3 text-[12px] leading-6 text-[#26312c] outline-none transition placeholder:text-[#a2aaa6] focus:border-[#168066]/45 focus:bg-white focus:ring-4 focus:ring-[#168066]/[0.07]"
                />
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mt-5 rounded-[12px] border border-[#f0d5d8] bg-[#fff4f5] px-4 py-3 text-[11px] leading-5 text-[#b83b4b]"
                >
                  {formError}
                </div>
              )}

              <div className="mt-7 flex items-center justify-end gap-3 border-t border-[#edf0ee] pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="h-11 rounded-[11px] border border-[#dfe4e1] bg-white px-5 text-[12px] font-semibold text-[#5f6b65] transition hover:bg-[#f7f9f8] disabled:opacity-50"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[11px] bg-[#0d7659] px-5 text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(13,118,89,0.16)] transition hover:bg-[#09694f] disabled:cursor-not-allowed disabled:opacity-60"
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
                      เพิ่มประเภทเครื่องจักร
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-[#16241d]/40 px-4 backdrop-blur-[3px]">
          <button
            type="button"
            aria-label="ปิด"
            onClick={closeDeleteModal}
            className="absolute inset-0"
          />

          <section className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-[24px] border border-[#eadcdf] bg-white shadow-[0_32px_90px_rgba(41,32,34,0.24)]">
            <div className="px-6 pb-6 pt-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#fff0f2] text-[#c94e5c] ring-1 ring-[#f3d8dc]">
                  <AlertTriangle className="h-5 w-5" strokeWidth={1.8} />
                </div>

                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#8b9590] transition hover:bg-[#f4f6f5] hover:text-[#26312c] disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#b56a74]">
                  Delete Machine Type
                </p>

                <h3 className="mt-1.5 text-[21px] font-bold tracking-[-0.03em] text-[#2a2728]">
                  ลบประเภทเครื่องจักรนี้?
                </h3>

                <p className="mt-2 text-[12px] leading-6 text-[#747a77]">
                  คุณกำลังจะลบ
                  <span className="mx-1 font-semibold text-[#343837]">
                    {deleteTarget.nameTh}
                  </span>
                  ออกจากมาตรฐานกลางของแพลตฟอร์ม
                </p>
              </div>

              <div className="mt-5 rounded-[16px] border border-[#ebe7e4] bg-[#fbfaf9] p-4">
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
                    เครื่องจักรที่เชื่อมอยู่
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      (deleteTarget.relatedCount ?? 0) > 0
                        ? "text-[#c44f5c]"
                        : "text-[#4f5b56]"
                    }`}
                  >
                    {deleteTarget.relatedCount ?? 0} เครื่อง
                  </span>
                </div>
              </div>

              {(deleteTarget.relatedCount ?? 0) > 0 && (
                <div className="mt-4 rounded-[14px] border border-[#f1d9dd] bg-[#fff5f6] px-4 py-3 text-[11px] leading-5 text-[#a9404d]">
                  ประเภทนี้มีเครื่องจักรอ้างอิงอยู่ ระบบจะไม่อนุญาตให้ลบเพื่อป้องกันข้อมูลความสัมพันธ์เสียหาย
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
                  className="h-11 rounded-[11px] border border-[#dfe4e1] bg-white px-5 text-[12px] font-semibold text-[#5f6b65] transition hover:bg-[#f7f9f8] disabled:opacity-50"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={handleDeleteConfirmed}
                  disabled={isDeleting || (deleteTarget.relatedCount ?? 0) > 0}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[11px] bg-[#c84e5c] px-5 text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(200,78,92,0.18)] transition hover:bg-[#b64250] disabled:cursor-not-allowed disabled:opacity-50"
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