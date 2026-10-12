"use client";

import { useMemo, useState } from "react";

import {

  Calendar,

  ChevronUp,

  ClipboardList,

  Download,

  Eye,

  FileSearch,

  Filter,


  Paperclip,

  QrCode,

  RotateCcw,

  Search,

  SlidersHorizontal,

  Trash2,

  AlertTriangle,

  X,

} from "lucide-react";

import type {

  HistoryFilterOptions,

  HistoryRecordItem,

} from "@/lib/History queries";

const ALL = "ทั้งหมด";

interface HistoryPageProps {

  records: HistoryRecordItem[];

  filterOptions: HistoryFilterOptions;

  currentUserId: number;

}

function defaultStartDate() {

  const date = new Date();

  date.setDate(1);

  return date.toISOString().slice(0, 10);

}

function defaultEndDate() {

  return new Date().toISOString().slice(0, 10);

}

export default function HistoryPage({

  records,

  filterOptions,

  currentUserId,

}: HistoryPageProps) {

  const [showFilters, setShowFilters] = useState(true);

  const [startDate, setStartDate] = useState(defaultStartDate());

  const [endDate, setEndDate] = useState(defaultEndDate());

  const [resourceType, setResourceType] = useState(ALL);

  const [equipmentSearch, setEquipmentSearch] = useState("");

  const [productionLine, setProductionLine] = useState(ALL);

  const [department, setDepartment] = useState(ALL);

  const [unit, setUnit] = useState(ALL);

  const [recordedById, setRecordedById] = useState<string>(ALL);

  const [selectedRecord, setSelectedRecord] =

    useState<HistoryRecordItem | null>(null);

  const [localRecords, setLocalRecords] =

    useState<HistoryRecordItem[]>(records);

  const [deleteTarget, setDeleteTarget] =

    useState<HistoryRecordItem | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteError, setDeleteError] = useState("");

  const filtered = useMemo(() => {

    return localRecords.filter((record) => {

      const date = record.recordedAt.slice(0, 10);

      if (startDate && date < startDate) return false;

      if (endDate && date > endDate) return false;

      if (

        resourceType !== ALL &&

        record.resourceType !== resourceType

      ) {

        return false;

      }

      if (

        productionLine !== ALL &&

        record.productionLine !== productionLine

      ) {

        return false;

      }

      if (

        department !== ALL &&

        record.department !== department

      ) {

        return false;

      }

      if (unit !== ALL && record.unit !== unit) {

        return false;

      }

      if (

        recordedById !== ALL &&

        String(record.recordedById) !== recordedById

      ) {

        return false;

      }

      const term = equipmentSearch.trim().toLowerCase();

      if (term) {

        const matches =

          record.equipmentName.toLowerCase().includes(term) ||

          (record.equipmentCode ?? "").toLowerCase().includes(term) ||

          record.usageReference.toLowerCase().includes(term) ||

          record.resourceLabel.toLowerCase().includes(term);

        if (!matches) return false;

      }

      return true;

    });

  }, [

    localRecords,

    startDate,

    endDate,

    resourceType,

    equipmentSearch,

    productionLine,

    department,

    unit,

    recordedById,

  ]);

  const summary = useMemo(

    () => ({

      total: filtered.length,

      qr: filtered.filter((item) => item.qrScanId).length,

      evidence: filtered.filter((item) => item.attachmentUrl).length,

    }),

    [filtered],

  );

  const activeFilterCount = [

    startDate !== defaultStartDate(),

    endDate !== defaultEndDate(),

    resourceType !== ALL,

    equipmentSearch.trim() !== "",

    productionLine !== ALL,

    department !== ALL,

    unit !== ALL,

    recordedById !== ALL,

  ].filter(Boolean).length;

  function resetFilters() {

    setStartDate(defaultStartDate());

    setEndDate(defaultEndDate());

    setResourceType(ALL);

    setEquipmentSearch("");

    setProductionLine(ALL);

    setDepartment(ALL);

    setUnit(ALL);

    setRecordedById(ALL);

  }

  async function deleteRecord() {

    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);

    setDeleteError("");

    try {

      const response = await fetch(

        `/api/operator/history/${deleteTarget.recordId}`,

        {

          method: "DELETE",

          credentials: "include",

        },

      );

      const responseText = await response.text();

      let payload: {

        success?: boolean;

        message?: string;

      } = {};

      try {

        payload = responseText ? JSON.parse(responseText) : {};

      } catch {

        payload = {

          success: false,

          message: `ลบรายการไม่สำเร็จ (${response.status})`,

        };

      }

      if (!response.ok || !payload.success) {

        throw new Error(

          payload.message ?? "ไม่สามารถลบรายการได้",

        );

      }

      setLocalRecords((current) =>

        current.filter(

          (item) => item.recordId !== deleteTarget.recordId,

        ),

      );

      if (selectedRecord?.recordId === deleteTarget.recordId) {

        setSelectedRecord(null);

      }

      setDeleteTarget(null);

    } catch (error) {

      setDeleteError(

        error instanceof Error

          ? error.message

          : "ไม่สามารถลบรายการได้",

      );

    } finally {

      setIsDeleting(false);

    }

  }

  function exportCsv() {

    const rows = [

      [

        "Reference",

        "DateTime",

        "Machine/Checkpoint",

        "Code",

        "Resource",

        "Quantity",

        "Unit",

        "Recorder",

        "QR Scan ID",

        "Evidence",

        "Remark",

      ],

      ...filtered.map((record) => [

        record.usageReference,

        record.recordedAt,

        record.equipmentName,

        record.equipmentCode ?? "",

        record.resourceLabel,

        String(record.value),

        record.unit,

        record.recordedByName,

        record.qrScanId ?? "",

        record.attachmentUrl ?? "",

        record.note ?? "",

      ]),

    ];

    const csv = rows

      .map((row) =>

        row

          .map((value) => `"${String(value).replaceAll('"', '""')}"`)

          .join(","),

      )

      .join("\n");

    const blob = new Blob(["\uFEFF", csv], {

      type: "text/csv;charset=utf-8",

    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `resource-usage-history-${new Date()

      .toISOString()

      .slice(0, 10)}.csv`;

    link.click();

    URL.revokeObjectURL(url);

  }

  return (

    <div className="space-y-4 pb-8 sm:space-y-6 sm:pb-10">

      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-4 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-7">

          <div className="max-w-2xl">

            <h1 className="text-[24px] font-black tracking-[-0.025em] text-slate-950 sm:text-[30px]">

              ประวัติการบันทึก

            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">

              ตรวจสอบประวัติการใช้ทรัพยากรจากเครื่องจักรและจุดตรวจ พร้อม QR Scan และหลักฐานประกอบ

            </p>

          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">

            <button

              type="button"

              onClick={() => setShowFilters((value) => !value)}

              className="inline-flex h-11 touch-manipulation items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition active:scale-[0.98] hover:bg-slate-50 sm:h-10 sm:px-4"

            >

              <SlidersHorizontal className="h-4 w-4 text-slate-500" />

              ตัวกรอง

              {activeFilterCount > 0 && (

                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-black text-white">

                  {activeFilterCount}

                </span>

              )}

            </button>

            <button

              type="button"

              onClick={exportCsv}

              disabled={filtered.length === 0}

              className="inline-flex h-11 touch-manipulation items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-bold text-white transition active:scale-[0.98] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:px-4"

            >

              <Download className="h-4 w-4" />

              ส่งออก CSV

            </button>

          </div>

        </div>

      </section>

      <section className="grid gap-3 sm:grid-cols-3">

        <MetricCard

          icon={ClipboardList}

          value={summary.total}

          label="รายการทั้งหมด"

          hint="ตามตัวกรองปัจจุบัน"

          tone="emerald"

        />

        <MetricCard

          icon={QrCode}

          value={summary.qr}

          label="บันทึกผ่าน QR"

          hint="ตรวจสอบย้อนกลับได้"

          tone="violet"

        />

        <MetricCard

          icon={Paperclip}

          value={summary.evidence}

          label="มีหลักฐาน"

          hint="รูปภาพหรือไฟล์แนบ"

          tone="amber"

        />

      </section>

      {showFilters && (

        <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">

            <div className="flex items-center gap-3">

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

                <Filter className="h-4 w-4" />

              </span>

              <div>

                <p className="text-sm font-bold text-slate-900">

                  ค้นหาและกรองข้อมูล

                </p>

                <p className="mt-0.5 text-xs text-slate-400">

                  ปรับเงื่อนไขเพื่อดูเฉพาะรายการที่ต้องการ

                </p>

              </div>

            </div>

            <button

              type="button"

              onClick={() => setShowFilters(false)}

              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"

              aria-label="ซ่อนตัวกรอง"

            >

              <ChevronUp className="h-4 w-4" />

            </button>

          </div>

          <div className="grid gap-4 px-4 py-5 sm:px-6 md:grid-cols-2 xl:grid-cols-4">

            <FilterField label="วันที่เริ่มต้น">

              <DateInput value={startDate} onChange={setStartDate} />

            </FilterField>

            <FilterField label="วันที่สิ้นสุด">

              <DateInput value={endDate} onChange={setEndDate} />

            </FilterField>

            <FilterField label="ประเภททรัพยากร">

              <select

                value={resourceType}

                onChange={(event) => setResourceType(event.target.value)}

                className="h-12 w-full touch-manipulation rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50/70"

              >

                <option value={ALL}>{ALL}</option>

                {filterOptions.resourceTypes.map((item) => (

                  <option key={item.code} value={item.code}>

                    {item.label}

                  </option>

                ))}

              </select>

            </FilterField>

            <FilterField label="เครื่องจักร / Reference">

              <div className="relative">

                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input

                  value={equipmentSearch}

                  onChange={(event) =>

                    setEquipmentSearch(event.target.value)

                  }

                  className="h-12 w-full touch-manipulation rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50/70"

                  placeholder="ชื่อ รหัส หรือ USG-..."

                />

              </div>

            </FilterField>

            <FilterField label="สายการผลิต">

              <SimpleSelect

                value={productionLine}

                onChange={setProductionLine}

                options={[ALL, ...filterOptions.productionLines]}

              />

            </FilterField>

            <FilterField label="แผนก">

              <SimpleSelect

                value={department}

                onChange={setDepartment}

                options={[ALL, ...filterOptions.departments]}

              />

            </FilterField>

            <FilterField label="หน่วยวัด">

              <SimpleSelect

                value={unit}

                onChange={setUnit}

                options={[ALL, ...filterOptions.units]}

              />

            </FilterField>

            <FilterField label="ผู้บันทึก">

              <select

                value={recordedById}

                onChange={(event) => setRecordedById(event.target.value)}

                className="h-12 w-full touch-manipulation rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50/70"

              >

                <option value={ALL}>{ALL}</option>

                {filterOptions.recorders.map((recorder) => (

                  <option key={recorder.id} value={String(recorder.id)}>

                    {recorder.name}

                    {recorder.id === currentUserId ? " (คุณ)" : ""}

                  </option>

                ))}

              </select>

            </FilterField>

          </div>

          <div className="flex flex-col items-stretch justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-3.5 sm:flex-row sm:items-center sm:px-6">

            <p className="text-xs text-slate-400">

              พบ{" "}

              <span className="font-bold text-slate-700">

                {filtered.length.toLocaleString("th-TH")}

              </span>{" "}

              รายการ

            </p>

            <button

              type="button"

              onClick={resetFilters}

              className="inline-flex h-11 touch-manipulation items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 transition active:scale-[0.98] hover:border-slate-300 hover:bg-slate-50 sm:h-9"

            >

              <RotateCcw className="h-3.5 w-3.5" />

              ล้างตัวกรอง

            </button>

          </div>

        </section>

      )}

      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">

          <div>

            <div className="flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />

              <h2 className="font-bold text-slate-900">

                รายการบันทึกข้อมูล

              </h2>

            </div>

            <p className="mt-1.5 text-xs text-slate-400">

              เรียงจากรายการล่าสุด • {filtered.length.toLocaleString("th-TH")} รายการ

            </p>

          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            ResourceUsage

          </span>

        </div>

        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">

          <table className="w-full min-w-[980px] text-left text-sm lg:min-w-[1160px]">

            <thead className="sticky top-0 z-10 bg-slate-50/95 text-[11px] uppercase tracking-[0.05em] text-slate-400 backdrop-blur">

              <tr>

                <th className="px-6 py-3.5 font-bold">วันที่และเวลา</th>

                <th className="px-5 py-3.5 font-bold">เครื่องจักร / จุดตรวจ</th>

                <th className="px-5 py-3.5 font-bold">ตำแหน่ง</th>

                <th className="px-5 py-3.5 font-bold">ทรัพยากร</th>

                <th className="px-5 py-3.5 font-bold">ปริมาณ</th>

                <th className="px-5 py-3.5 font-bold">ผู้บันทึก</th>

                <th className="px-5 py-3.5 font-bold text-center">QR</th>

                <th className="px-5 py-3.5 font-bold text-center">หลักฐาน</th>

                <th className="px-5 py-3.5 font-bold text-center">การดำเนินการ</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filtered.map((record) => (

                <tr

                  key={record.recordId}

                  className="group transition hover:bg-emerald-50/35"

                >

                  <td className="whitespace-nowrap px-6 py-4">

                    <p className="font-semibold text-slate-800">

                      {formatDate(record.recordedAt)}

                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">

                      {formatTime(record.recordedAt)}

                    </p>

                  </td>

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 transition group-hover:bg-sky-100 group-hover:text-sky-800">

                        <FileSearch className="h-4 w-4" />

                      </span>

                      <div className="min-w-0">

                        <p className="max-w-[230px] truncate font-bold text-slate-900">

                          {record.equipmentName}

                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">

                          {record.equipmentCode ?? "-"} •{" "}

                          {record.equipmentType ?? "-"}

                        </p>

                      </div>

                    </div>

                  </td>

                  <td className="px-5 py-4">

                    <p className="font-medium text-slate-700">

                      {record.productionLine ?? "-"}

                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">

                      {record.department ?? "-"}

                    </p>

                  </td>

                  <td className="px-5 py-4">

                    <p className="font-bold text-slate-800">

                      {record.resourceLabel}

                    </p>

                    <p className="mt-0.5 text-[11px] font-medium text-slate-400">

                      {record.resourceType}

                    </p>

                  </td>

                  <td className="whitespace-nowrap px-5 py-4">

                    <span className="text-base font-black tracking-tight text-slate-900">

                      {record.value.toLocaleString("th-TH")}

                    </span>{" "}

                    <span className="text-xs font-bold text-slate-400">

                      {record.unit}

                    </span>

                  </td>

                  <td className="px-5 py-4">

                    <p className="max-w-[180px] truncate font-medium text-slate-700">

                      {record.recordedByName}

                    </p>

                  </td>

                  <td className="px-5 py-4 text-center">

                    {record.qrScanId ? (

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1.5 text-[11px] font-black text-violet-700 ring-1 ring-violet-100">

                        <QrCode className="h-3.5 w-3.5" />

                        #{record.qrScanId}

                      </span>

                    ) : (

                      <span className="text-xs text-slate-300">Manual</span>

                    )}

                  </td>

                  <td className="px-5 py-4 text-center">

                    {record.attachmentUrl ? (

                      <a

                        href={record.attachmentUrl}

                        target="_blank"

                        rel="noreferrer"

                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"

                      >

                        <Paperclip className="h-3.5 w-3.5" />

                        เปิดไฟล์

                      </a>

                    ) : (

                      <span className="text-xs text-slate-300">—</span>

                    )}

                  </td>

                  <td className="px-5 py-4 text-center">

                    <div className="inline-flex items-center gap-2">

                      <button

                        type="button"

                        onClick={() => setSelectedRecord(record)}

                        className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-xl border border-slate-200 bg-white text-sky-600 transition active:scale-95 active:bg-sky-50 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 sm:h-9 sm:w-9"

                        title="ดูรายละเอียด"

                        aria-label="ดูรายละเอียด"

                      >

                        <Eye className="h-4 w-4" />

                      </button>

                      {record.recordedById === currentUserId && (

                        <button

                          type="button"

                          onClick={() => {

                            setDeleteError("");

                            setDeleteTarget(record);

                          }}

                          className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-500 transition active:scale-95 active:bg-rose-50 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:h-9 sm:w-9"

                          title="ลบรายการ"

                          aria-label="ลบรายการ"

                        >

                          <Trash2 className="h-4 w-4" />

                        </button>

                      )}

                    </div>

                  </td>

                </tr>

              ))}

              {filtered.length === 0 && (

                <tr>

                  <td colSpan={9} className="px-6 py-20 text-center">

                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                      <Search className="h-5 w-5" />

                    </span>

                    <p className="mt-4 font-bold text-slate-600">

                      ไม่พบรายการที่ตรงกับตัวกรอง

                    </p>

                    <p className="mt-1 text-xs text-slate-400">

                      ลองเปลี่ยนคำค้นหรือรีเซ็ตตัวกรอง

                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

      {deleteTarget && (

        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4">

          <button

            type="button"

            aria-label="ปิด"

            onClick={() => {

              if (!isDeleting) {

                setDeleteTarget(null);

                setDeleteError("");

              }

            }}

            className="absolute inset-0"

          />

          <section className="relative z-10 max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[24px] border border-slate-200 bg-white shadow-2xl sm:rounded-[24px]">

            <div className="px-6 pb-4 pt-6">

              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">

                <AlertTriangle className="h-5 w-5" />

              </span>

              <h3 className="mt-4 text-lg font-black text-slate-950">

                ลบรายการบันทึกนี้?

              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">

                รายการ {deleteTarget.usageReference} จะถูกนำออกจากหน้าประวัติ

                โดยระบบจะเปลี่ยนสถานะเป็น INACTIVE เพื่อเก็บ Audit Trail ไว้

              </p>

              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">

                <p className="text-sm font-bold text-slate-800">

                  {deleteTarget.equipmentName}

                </p>

                <p className="mt-1 text-xs text-slate-400">

                  {deleteTarget.resourceLabel} •{" "}

                  {deleteTarget.value.toLocaleString("th-TH")}{" "}

                  {deleteTarget.unit}

                </p>

              </div>

              {deleteError && (

                <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">

                  {deleteError}

                </p>

              )}

            </div>

            <div className="flex gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:gap-3 sm:px-6">

              <button

                type="button"

                onClick={() => {

                  setDeleteTarget(null);

                  setDeleteError("");

                }}

                disabled={isDeleting}

                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"

              >

                ยกเลิก

              </button>

              <button

                type="button"

                onClick={deleteRecord}

                disabled={isDeleting}

                className="h-11 flex-1 rounded-xl bg-rose-600 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"

              >

                {isDeleting ? "กำลังลบ..." : "ยืนยันลบ"}

              </button>

            </div>

          </section>

        </div>

      )}

      {selectedRecord && (

        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4">

          <button

            type="button"

            aria-label="ปิด"

            onClick={() => setSelectedRecord(null)}

            className="absolute inset-0"

          />

          <section className="relative z-10 max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-[26px] bg-white shadow-2xl sm:rounded-[28px]">

            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-4 py-5 text-slate-900 sm:px-6 sm:py-6">

              <button

                type="button"

                onClick={() => setSelectedRecord(null)}

                className="absolute right-4 top-4 rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"

                aria-label="ปิด"

              >

                <X className="h-4 w-4" />

              </button>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">

                Resource Usage Detail

              </p>

              <h3 className="mt-2 break-all text-lg font-black">

                {selectedRecord.usageReference}

              </h3>

            </div>

            <div className="space-y-1 px-4 py-4 sm:px-6 sm:py-5">

              <Detail

                label="เครื่องจักร / จุดตรวจ"

                value={selectedRecord.equipmentName}

              />

              <Detail

                label="รหัส"

                value={selectedRecord.equipmentCode ?? "-"}

              />

              <Detail

                label="ทรัพยากร"

                value={`${selectedRecord.resourceLabel} • ${selectedRecord.value.toLocaleString(

                  "th-TH",

                )} ${selectedRecord.unit}`}

              />

              <Detail

                label="สายการผลิต"

                value={selectedRecord.productionLine ?? "-"}

              />

              <Detail

                label="แผนก"

                value={selectedRecord.department ?? "-"}

              />

              <Detail

                label="ผู้บันทึก"

                value={selectedRecord.recordedByName}

              />

              <Detail

                label="QR Scan ID"

                value={selectedRecord.qrScanId ?? "Manual"}

              />

              <Detail

                label="Processing"

                value={selectedRecord.processingStatus}

              />

              <Detail

                label="หมายเหตุ"

                value={selectedRecord.note ?? "-"}

              />

            </div>

            <div className="flex gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:gap-3 sm:px-6">

              {selectedRecord.attachmentUrl && (

                <a

                  href={selectedRecord.attachmentUrl}

                  target="_blank"

                  rel="noreferrer"

                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"

                >

                  <Paperclip className="h-4 w-4" />

                  เปิดหลักฐาน

                </a>

              )}

              <button

                type="button"

                onClick={() => setSelectedRecord(null)}

                className="h-11 flex-1 rounded-xl bg-slate-900 text-sm font-bold text-white transition hover:bg-slate-800"

              >

                ปิด

              </button>

            </div>

          </section>

        </div>

      )}

    </div>

  );

}

function FilterField({

  label,

  children,

}: {

  label: string;

  children: React.ReactNode;

}) {

  return (

    <label className="block">

      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">

        {label}

      </span>

      {children}

    </label>

  );

}

function DateInput({

  value,

  onChange,

}: {

  value: string;

  onChange: (value: string) => void;

}) {

  return (

    <div className="relative">

      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      <input

        type="date"

        value={value}

        onChange={(event) => onChange(event.target.value)}

        className="h-12 w-full touch-manipulation rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50/70"

      />

    </div>

  );

}

function SimpleSelect({

  value,

  onChange,

  options,

}: {

  value: string;

  onChange: (value: string) => void;

  options: string[];

}) {

  return (

    <select

      value={value}

      onChange={(event) => onChange(event.target.value)}

      className="h-12 w-full touch-manipulation rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50/70"

    >

      {options.map((option) => (

        <option key={option} value={option}>

          {option}

        </option>

      ))}

    </select>

  );

}

function MetricCard({

  icon: Icon,

  value,

  label,

  hint,

  tone,

}: {

  icon: typeof ClipboardList;

  value: number;

  label: string;

  hint: string;

  tone: "emerald" | "violet" | "amber";

}) {

  const toneClass = {

    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",

    violet: "bg-violet-50 text-violet-700 ring-violet-100",

    amber: "bg-amber-50 text-amber-700 ring-amber-100",

  }[tone];

  const accentClass = {

    emerald: "bg-emerald-500",

    violet: "bg-violet-500",

    amber: "bg-amber-500",

  }[tone];

  return (

    <div className="relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">

      <div className={`absolute inset-x-0 bottom-0 h-0.5 ${accentClass}`} />

      <div className="flex items-center gap-4">

        <span

          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${toneClass}`}

        >

          <Icon className="h-5 w-5" />

        </span>

        <div>

          <p className="text-2xl font-black tracking-tight text-slate-900">

            {value.toLocaleString("th-TH")}

          </p>

          <p className="text-sm font-bold text-slate-700">{label}</p>

          <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>

        </div>

      </div>

    </div>

  );

}

function Detail({

  label,

  value,

}: {

  label: string;

  value: string;

}) {

  return (

    <div className="grid gap-1 border-b border-slate-100 py-3 last:border-0 sm:grid-cols-[145px_1fr]">

      <span className="text-xs font-medium text-slate-400">{label}</span>

      <span className="text-sm font-bold text-slate-800">{value}</span>

    </div>

  );

}

function formatDate(iso: string) {

  return new Intl.DateTimeFormat("th-TH", {

    day: "2-digit",

    month: "2-digit",

    year: "numeric",

  }).format(new Date(iso));

}

function formatTime(iso: string) {

  return new Intl.DateTimeFormat("th-TH", {

    hour: "2-digit",

    minute: "2-digit",

    hour12: false,

  }).format(new Date(iso));

}