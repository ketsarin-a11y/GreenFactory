"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import jsQR from "jsqr";
import {
  Search,
  QrCode,
  RotateCcw,
  Info,
  Paperclip,
  ArrowRight,
  X,
  Check,
  Loader2,
  Lightbulb,
  Camera,
  AlertCircle,
} from "lucide-react";
import { RESOURCE_META, RESOURCE_ICONS, type ResourceMeta } from "@/lib/resource-meta";
import type { EquipmentListItem, TodayUsageTotal } from "@/lib/record-queries";

/**
 * components/operator/RecordPage.tsx
 * ------------------------------------
 * หน้า "บันทึกการใช้ทรัพยากร" ทั้งหมดในไฟล์เดียว (ไม่แยกโฟลเดอร์ย่อย)
 * ใช้ style/องค์ประกอบเดียวกับหน้าแรก (การ์ด rounded-2xl border, สี emerald,
 * ไอคอนจาก lucide-react) — app/operator/record/page.tsx (Server Component)
 * ดึงข้อมูลจริงแล้วส่งเข้ามาเป็น props ให้ component นี้ทั้งหมด
 */

const ALL = "ทั้งหมด";
const PAGE_SIZE = 5;

interface RecordFormValues {
  value: string;
  date: string;
  time: string;
  note: string;
}

const emptyFormValues: RecordFormValues = {
  value: "",
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toTimeString().slice(0, 5),
  note: "",
};

const STEPS = [
  { step: 1, label: "เลือกเครื่องจักร/จุดตรวจ" },
  { step: 2, label: "กรอกข้อมูลการใช้ทรัพยากร" },
  { step: 3, label: "ตรวจสอบและบันทึก" },
] as const;

interface RecordPageProps {
  equipmentList: EquipmentListItem[];
  todayTotals: TodayUsageTotal[];
  currentUser: { id: number; name: string };
  initialEquipmentId?: number | null;
  initialResourceType?: string | null;
}

export default function RecordPage({ equipmentList, todayTotals, currentUser, initialEquipmentId, initialResourceType }: RecordPageProps) {
  const router = useRouter();

  // --- equipment picker state ---
  const [search, setSearch] = useState("");
  const [productionLine, setProductionLine] = useState(ALL);
  const [equipmentType, setEquipmentType] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [resourceTypeFilter, setResourceTypeFilter] = useState(initialResourceType ?? ALL);
  const [page, setPage] = useState(1);
  const [showScanner, setShowScanner] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(() => {
    if (initialEquipmentId && equipmentList.some((eq) => eq.equipmentId === initialEquipmentId)) {
      return initialEquipmentId;
    }
    // มาจากปุ่มหมวดทรัพยากรที่หน้าแรก ("ไฟฟ้า 5 รายการ") -> เลือกเครื่องประเภทนั้นตัวแรกให้เลย
    if (initialResourceType) {
      const firstMatch = equipmentList.find((eq) => eq.resourceType === initialResourceType);
      if (firstMatch) return firstMatch.equipmentId;
    }
    return equipmentList[0]?.equipmentId ?? null;
  });

  // --- form + workflow state ---
  const [formValues, setFormValues] = useState<RecordFormValues>(emptyFormValues);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [phase, setPhase] = useState<"form" | "review">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedEquipment = useMemo(
    () => equipmentList.find((eq) => eq.equipmentId === selectedEquipmentId) ?? null,
    [equipmentList, selectedEquipmentId],
  );
  const resourceMeta = selectedEquipment ? RESOURCE_META[selectedEquipment.resourceType] : null;
  const currentStep = phase === "review" ? 3 : 2;

  // --- filters ---
  const productionLines = useMemo(
    () => [ALL, ...new Set(equipmentList.map((eq) => eq.productionLine).filter((v): v is string => Boolean(v)))],
    [equipmentList],
  );
  const equipmentTypes = useMemo(
    () => [ALL, ...new Set(equipmentList.map((eq) => eq.equipmentType).filter((v): v is string => Boolean(v)))],
    [equipmentList],
  );
  const statuses = useMemo(() => [ALL, ...new Set(equipmentList.map((eq) => eq.status))], [equipmentList]);
  const resourceTypes = useMemo(() => [ALL, ...new Set(equipmentList.map((eq) => eq.resourceType))], [equipmentList]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return equipmentList.filter((eq) => {
      const matchesSearch =
        !term ||
        eq.name.toLowerCase().includes(term) ||
        (eq.equipmentCode ?? "").toLowerCase().includes(term) ||
        (eq.equipmentType ?? "").toLowerCase().includes(term);
      const matchesLine = productionLine === ALL || eq.productionLine === productionLine;
      const matchesType = equipmentType === ALL || eq.equipmentType === equipmentType;
      const matchesStatus = status === ALL || eq.status === status;
      const matchesResource = resourceTypeFilter === ALL || eq.resourceType === resourceTypeFilter;
      return matchesSearch && matchesLine && matchesType && matchesStatus && matchesResource;
    });
  }, [equipmentList, search, productionLine, equipmentType, status, resourceTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setProductionLine(ALL);
    setEquipmentType(ALL);
    setStatus(ALL);
    setResourceTypeFilter(ALL);
    setPage(1);
  }

  function handleScanDetected(code: string) {
    setShowScanner(false);
    const trimmed = code.trim();
    const match = equipmentList.find((eq) => eq.equipmentCode?.toLowerCase() === trimmed.toLowerCase());
    if (match) {
      setSelectedEquipmentId(match.equipmentId);
      setScanMessage(`เลือก "${match.name}" จากการสแกน QR Code แล้ว`);
      setSearch("");
    } else {
      setScanMessage(`ไม่พบเครื่องจักรที่ตรงกับรหัส "${trimmed}" ในระบบ`);
    }
  }

  function update<K extends keyof RecordFormValues>(key: K, value: RecordFormValues[K]) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  const ALLOWED_ATTACHMENT_TYPES = ["image/jpeg", "image/png", "application/pdf"];
  const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB

  function handleAttachmentSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setAttachmentError("");
    if (!file) return;

    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      setAttachmentError("รองรับเฉพาะไฟล์ JPG, PNG, PDF เท่านั้น");
      return;
    }
    if (file.size > MAX_ATTACHMENT_SIZE) {
      setAttachmentError("ขนาดไฟล์ต้องไม่เกิน 10MB");
      return;
    }
    setAttachmentFile(file);
  }

  function handleRemoveAttachment() {
    setAttachmentFile(null);
    setAttachmentError("");
  }

  function handleGoToReview() {
    setErrorMessage("");
    if (!selectedEquipment) {
      setErrorMessage("กรุณาเลือกเครื่องจักร/จุดตรวจก่อน");
      return;
    }
    const numericValue = Number(formValues.value);
    if (!formValues.value || Number.isNaN(numericValue) || numericValue < 0) {
      setErrorMessage("กรุณากรอกปริมาณที่ใช้ให้ถูกต้อง");
      return;
    }
    if (!formValues.date || !formValues.time) {
      setErrorMessage("กรุณาเลือกวันที่และเวลา");
      return;
    }
    setPhase("review");
  }

  async function handleConfirmSave() {
    if (!selectedEquipment) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let attachmentUrl: string | null = null;

      // อัปโหลดไฟล์แนบก่อน (ถ้ามี) แล้วค่อยเอา url ที่ได้ไปแนบตอนสร้างบันทึก
      if (attachmentFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", attachmentFile);

        const uploadRes = await fetch("/api/uploads", { method: "POST", body: uploadForm });
        const uploadData = (await uploadRes.json()) as { success: boolean; url?: string; message?: string };

        if (!uploadRes.ok || !uploadData.success || !uploadData.url) {
          setErrorMessage(uploadData.message ?? "อัปโหลดไฟล์แนบไม่สำเร็จ กรุณาลองใหม่");
          return;
        }
        attachmentUrl = uploadData.url;
      }

      const recordedAt = new Date(`${formValues.date}T${formValues.time}:00`);
      const response = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: selectedEquipment.equipmentId,
          value: Number(formValues.value),
          recordedAt: recordedAt.toISOString(),
          note: formValues.note,
          attachmentUrl,
        }),
      });
      const data = (await response.json()) as { success: boolean; message?: string };

      if (!response.ok || !data.success) {
        setErrorMessage(data.message ?? "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่");
        return;
      }

      setSuccessMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
      setFormValues(emptyFormValues);
      setAttachmentFile(null);
      setPhase("form");
      router.refresh();
    } catch (error) {
      console.error("Submit record error:", error);
      setErrorMessage("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stepper */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4">
        {STEPS.map((s, idx) => (
          <div key={s.step} className="flex flex-1 items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  s.step <= currentStep ? "bg-emerald-600 text-white" : "border border-slate-300 text-slate-400",
                ].join(" ")}
              >
                {s.step < currentStep ? <Check size={14} /> : s.step}
              </span>
              <span className={s.step <= currentStep ? "text-sm font-medium text-slate-800" : "text-sm text-slate-400"}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
          </div>
        ))}
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-6">
          {phase === "form" ? (
            <>
              {/* ----- ข้อ 1: เลือกเครื่องจักร/จุดตรวจ ----- */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-base font-semibold text-slate-800">1. เลือกเครื่องจักร / จุดตรวจ</h2>

                <button
                  type="button"
                  className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  onClick={() => {
                    setScanMessage("");
                    setShowScanner(true);
                  }}
                >
                  <QrCode size={16} />
                  สแกน QR Code
                </button>

                {scanMessage && (
                  <p className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">{scanMessage}</p>
                )}

                <div className="mb-3 relative">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="ค้นหาด้วยชื่อเครื่อง, รหัสเครื่อง, ประเภท"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <FilterSelect label="ไลน์การผลิตทั้งหมด" value={productionLine} options={productionLines} onChange={(v) => { setProductionLine(v); setPage(1); }} />
                  <FilterSelect label="ประเภทเครื่องจักรทั้งหมด" value={equipmentType} options={equipmentTypes} onChange={(v) => { setEquipmentType(v); setPage(1); }} />
                  <FilterSelect label="สถานะทั้งหมด" value={status} options={statuses} onChange={(v) => { setStatus(v); setPage(1); }} />
                  <FilterSelect
                    label="ประเภททรัพยากรทั้งหมด"
                    value={resourceTypeFilter}
                    options={resourceTypes}
                    onChange={(v) => { setResourceTypeFilter(v); setPage(1); }}
                    renderLabel={(v) => (v === ALL ? "ประเภททรัพยากรทั้งหมด" : RESOURCE_META[v]?.label ?? v)}
                  />
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mb-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  <RotateCcw size={13} />
                  ล้างตัวกรอง
                </button>

                <p className="mb-2 text-xs text-slate-400">ผลการค้นหา ({filtered.length} รายการ)</p>

                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                      <tr>
                        <th className="w-8 px-3 py-2"></th>
                        <th className="px-3 py-2 font-medium">เครื่องจักร/จุดตรวจ</th>
                        <th className="px-3 py-2 font-medium">รหัสเครื่อง</th>
                        <th className="px-3 py-2 font-medium">ไลน์การผลิต</th>
                        <th className="px-3 py-2 font-medium">แผนก</th>
                        <th className="px-3 py-2 font-medium">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pageItems.map((eq) => (
                        <tr
                          key={eq.equipmentId}
                          onClick={() => setSelectedEquipmentId(eq.equipmentId)}
                          className={`cursor-pointer ${eq.equipmentId === selectedEquipmentId ? "bg-emerald-50/60" : "hover:bg-slate-50"}`}
                        >
                          <td className="px-3 py-3">
                            <input
                              type="radio"
                              checked={eq.equipmentId === selectedEquipmentId}
                              onChange={() => setSelectedEquipmentId(eq.equipmentId)}
                              className="accent-emerald-600"
                            />
                          </td>
                          <td className="px-3 py-3 font-medium text-slate-800">{eq.name}</td>
                          <td className="px-3 py-3 text-slate-500">{eq.equipmentCode ?? "-"}</td>
                          <td className="px-3 py-3 text-slate-500">{eq.productionLine ?? "-"}</td>
                          <td className="px-3 py-3 text-slate-500">{eq.department ?? "-"}</td>
                          <td className="px-3 py-3">
                            <StatusBadge status={eq.status} />
                          </td>
                        </tr>
                      ))}
                      {pageItems.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-400">
                            ไม่พบเครื่องจักร/จุดตรวจที่ตรงกับตัวกรอง
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`h-7 w-7 rounded-lg text-xs font-medium ${p === page ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                {selectedEquipment && (
                  <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                      {selectedEquipment.name.slice(0, 1)}
                    </span>
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-slate-800">{selectedEquipment.name}</p>
                      <p className="text-slate-400">{selectedEquipment.equipmentType ?? "-"}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-xs text-slate-500">
                      <div>
                        <p className="text-slate-400">ไลน์การผลิต</p>
                        <p className="font-medium text-slate-700">{selectedEquipment.productionLine ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">แผนก</p>
                        <p className="font-medium text-slate-700">{selectedEquipment.department ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">สถานะ</p>
                        <StatusBadge status={selectedEquipment.status} />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* ----- ข้อ 2: กรอกข้อมูลการใช้ทรัพยากร ----- */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-base font-semibold text-slate-800">2. กรอกข้อมูลการใช้ทรัพยากร</h2>

                {!selectedEquipment ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                    เลือกเครื่องจักร/จุดตรวจด้านบนก่อน
                  </p>
                ) : (
                  <div className="flex flex-col gap-5">
                    <Field label="ประเภททรัพยากร" required>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        {resourceMeta?.label ?? selectedEquipment.resourceType}
                      </div>
                    </Field>

                    <Field label="หน่วยวัด" required>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        {resourceMeta?.unitLabel ?? resourceMeta?.unit ?? "-"}
                      </div>
                    </Field>

                    <Field label="ปริมาณที่ใช้" required>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-emerald-400">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={formValues.value}
                          onChange={(e) => update("value", e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-transparent text-sm text-slate-800 outline-none"
                        />
                        <span className="text-xs text-slate-400">{resourceMeta?.unit}</span>
                      </div>
                    </Field>

                    <Field label="วันที่และเวลา" required>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={formValues.date}
                          onChange={(e) => update("date", e.target.value)}
                          className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400"
                        />
                        <input
                          type="time"
                          value={formValues.time}
                          onChange={(e) => update("time", e.target.value)}
                          className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400"
                        />
                      </div>
                    </Field>

                    <Field label="ผู้บันทึกข้อมูล" required>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        {currentUser.name}
                      </div>
                    </Field>

                    <Field label="หมายเหตุ">
                      <textarea
                        value={formValues.note}
                        onChange={(e) => update("note", e.target.value.slice(0, 200))}
                        rows={3}
                        placeholder="ค่าการใช้ไฟฟ้าประจำกะเข้า"
                        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400"
                      />
                      <p className="mt-1 text-right text-xs text-slate-400">{formValues.note.length} / 200</p>
                    </Field>

                    {attachmentFile ? (
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <Paperclip size={16} className="shrink-0 text-slate-400" />
                        <span className="flex-1 truncate text-sm text-slate-700">{attachmentFile.name}</span>
                        <span className="shrink-0 text-xs text-slate-400">{(attachmentFile.size / 1024 / 1024).toFixed(1)} MB</span>
                        <button
                          type="button"
                          onClick={handleRemoveAttachment}
                          className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm text-slate-500 hover:bg-slate-50">
                        <Paperclip size={16} />
                        เพิ่มไฟล์แนบ (ถ้ามี)
                        <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={handleAttachmentSelect} />
                      </label>
                    )}
                    {attachmentError ? (
                      <p className="-mt-3 text-center text-xs text-red-500">{attachmentError}</p>
                    ) : (
                      <p className="-mt-3 text-center text-xs text-slate-400">รองรับไฟล์ JPG, PNG, PDF (ขนาดไม่เกิน 10MB)</p>
                    )}

                    {errorMessage && (
                      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        <Info size={15} />
                        {errorMessage}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFormValues({ ...emptyFormValues, date: formValues.date, time: formValues.time });
                          setAttachmentFile(null);
                          setAttachmentError("");
                        }}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <RotateCcw size={15} />
                        ล้างข้อมูล
                      </button>
                      <button
                        type="button"
                        onClick={handleGoToReview}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        ต่อไป
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </>
          ) : (
            selectedEquipment && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-base font-semibold text-slate-800">ตรวจสอบข้อมูลก่อนบันทึก</h2>

                <dl className="flex flex-col divide-y divide-slate-100">
                  {(
                    [
                      ["เครื่องจักร/จุดตรวจ", `${selectedEquipment.name}${selectedEquipment.equipmentCode ? ` (${selectedEquipment.equipmentCode})` : ""}`],
                      ["ประเภททรัพยากร", resourceMeta?.label ?? selectedEquipment.resourceType],
                      ["ปริมาณที่ใช้", `${formValues.value} ${resourceMeta?.unit ?? ""}`],
                      ["วันที่และเวลา", `${formValues.date} ${formValues.time}`],
                      ["ผู้บันทึกข้อมูล", currentUser.name],
                      ["หมายเหตุ", formValues.note || "-"],
                      ["ไฟล์แนบ", attachmentFile?.name ?? "-"],
                    ] as [string, string][]
                  ).map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between py-3 text-sm">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="font-medium text-slate-800">{value}</dd>
                    </div>
                  ))}
                </dl>

                {errorMessage && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errorMessage}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPhase("form")}
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    แก้ไขข้อมูล
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSave}
                    disabled={isSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        กำลังบันทึก
                      </>
                    ) : (
                      "ยืนยันและบันทึก"
                    )}
                  </button>
                </div>
              </section>
            )
          )}
        </div>

        {/* ----- sidebar ขวา ----- */}
        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">หน่วยวัดตามประเภททรัพยากร</h3>
            <ul className="flex flex-col divide-y divide-slate-100">
              {Object.entries(RESOURCE_META).map(([key, meta]) => {
                const Icon = RESOURCE_ICONS[meta.icon];
                const isActive = resourceMeta?.label === meta.label;
                return (
                  <li key={key} className={`flex items-center gap-3 py-2.5 text-sm ${isActive ? "text-emerald-700" : "text-slate-600"}`}>
                    <Icon size={16} className={isActive ? "text-emerald-600" : "text-slate-400"} />
                    <span className="flex-1">{meta.label}</span>
                    <span className="text-xs text-slate-400">{meta.unit}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-800">สรุปการบันทึกวันนี้</h3>
              <p className="text-xs text-slate-400">
                {new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(new Date())}
              </p>
            </div>

            {todayTotals.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-xs text-slate-400">ยังไม่มีการบันทึกวันนี้</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {todayTotals.map((t) => {
                  const meta = RESOURCE_META[t.key.toUpperCase()];
                  const Icon = meta ? RESOURCE_ICONS[meta.icon] : RESOURCE_ICONS.zap;
                  return (
                    <li key={t.key} className="flex items-center gap-3 text-sm">
                      <Icon size={16} className="text-slate-400" />
                      <span className="flex-1 text-slate-600">{t.label}</span>
                      <span className="text-right">
                        <span className="block font-semibold text-slate-800">
                          {t.total.toLocaleString("th-TH")} {t.unit}
                        </span>
                        <span className="block text-xs text-slate-400">{t.recordCount} รายการ</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <Link
              href="/operator/history"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
            >
              ดูรายการทั้งหมด
              <ArrowRight size={15} />
            </Link>
          </section>

          <section className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Lightbulb size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-700">คำแนะนำ</p>
              <p className="text-sm text-slate-500">
                กรุณาบันทึกข้อมูลให้ถูกต้อง ครบถ้วน เพื่อให้การวิเคราะห์และคำนวณคาร์บอนเป็นไปอย่างแม่นยำ
              </p>
            </div>
          </section>
        </aside>
      </div>

      {showScanner && <InlineQrScanner onDetected={handleScanDetected} onClose={() => setShowScanner(false)} />}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  renderLabel,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  renderLabel?: (v: string) => string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600 outline-none focus:border-emerald-400"
    >
      <option value={ALL}>{label}</option>
      {options.filter((o) => o !== ALL).map((o) => (
        <option key={o} value={o}>{renderLabel ? renderLabel(o) : o}</option>
      ))}
    </select>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isNormal = status === "NORMAL";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isNormal ? "text-emerald-600" : "text-amber-600"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isNormal ? "bg-emerald-500" : "bg-amber-500"}`} />
      {isNormal ? "ปกติ" : status}
    </span>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function InlineQrScanner({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number>(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          frameRef.current = requestAnimationFrame(scanFrame);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้อง หรือค้นหาด้วยรหัสเครื่องแทน");
      }
    }

    function scanFrame() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(imageData.data, imageData.width, imageData.height);
          if (result?.data) {
            onDetected(result.data);
            return;
          }
        }
      }
      frameRef.current = requestAnimationFrame(scanFrame);
    }

    startCamera();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Camera size={16} />
            สแกน QR Code เครื่องจักร
          </h3>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        ) : (
          <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-900">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-emerald-400/80" />
          </div>
        )}

        <p className="mt-4 text-center text-xs text-slate-400">
          เล็ง QR Code ที่ติดอยู่บนเครื่องจักรให้อยู่ในกรอบ ระบบจะเลือกเครื่องให้อัตโนมัติ
        </p>
      </div>
    </div>
  );
}