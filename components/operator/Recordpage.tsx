"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import {

  AlertCircle,

  ArrowRight,

  Building2,

  Check,

  CheckCircle2,

  Factory,

  FileImage,

  History,

  Loader2,

  MapPin,

  Paperclip,

  QrCode,

  RotateCcw,

  Search,

  Trash2,

  Upload,

  Workflow,

  Wrench,

  X,

} from "lucide-react";

import type {

  MachineListItem,

  ResourceTypeListItem,

  TodayUsageTotal,

} from "@/lib/record-queries";

interface RecordPageProps {

  machineList: MachineListItem[];

  resourceTypes: ResourceTypeListItem[];

  todayTotals: TodayUsageTotal[];

  currentUser: {

    id: number;

    name: string;

  };

  initialMachineId?: number | null;

  initialQrScanId?: string | null;

  initialResourceCode?: string | null;

}

interface FormValues {

  quantity: string;

  date: string;

  time: string;

  remark: string;

}

const PAGE_SIZE = 6;

function createInitialForm(): FormValues {

  const now = new Date();

  return {

    quantity: "",

    date: now.toISOString().slice(0, 10),

    time: now.toTimeString().slice(0, 5),

    remark: "",

  };

}

export default function RecordPage({

  machineList,

  resourceTypes,

  todayTotals,

  currentUser,

  initialMachineId = null,

  initialQrScanId = null,

  initialResourceCode = null,

}: RecordPageProps) {

  const router = useRouter();

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [selectedMachineId, setSelectedMachineId] =

    useState<number | null>(() => {

      if (

        initialMachineId &&

        machineList.some(

          (machine) => machine.machineId === initialMachineId,

        )

      ) {

        return initialMachineId;

      }

      return null;

    });

  const [selectedResourceTypeId, setSelectedResourceTypeId] =

    useState<number | null>(() => {

      if (!initialResourceCode) return null;

      return (

        resourceTypes.find(

          (item) =>

            item.resourceCode.toUpperCase() ===

            initialResourceCode,

        )?.resourceTypeId ?? null

      );

    });

  const [form, setForm] = useState<FormValues>(

    createInitialForm,

  );

  const [attachmentFile, setAttachmentFile] =

    useState<File | null>(null);

  const [phase, setPhase] =

    useState<"form" | "review">("form");

  const [isSubmitting, setIsSubmitting] =

    useState(false);

  const [errorMessage, setErrorMessage] =

    useState("");

  const [successMessage, setSuccessMessage] =

    useState("");

  const selectedMachine = useMemo(

    () =>

      machineList.find(

        (machine) =>

          machine.machineId === selectedMachineId,

      ) ?? null,

    [machineList, selectedMachineId],

  );

  const selectedResource = useMemo(

    () =>

      resourceTypes.find(

        (resource) =>

          resource.resourceTypeId ===

          selectedResourceTypeId,

      ) ?? null,

    [resourceTypes, selectedResourceTypeId],

  );

  const filteredMachines = useMemo(() => {

    const term = search.trim().toLowerCase();

    if (!term) return machineList;

    return machineList.filter((machine) =>

      [

        machine.machineName,

        machine.machineCode,

        machine.machineType,

        machine.lineName,

        machine.departmentName,

        machine.buildingName,

        machine.factoryName,

      ].some((value) =>

        value.toLowerCase().includes(term),

      ),

    );

  }, [machineList, search]);

  const totalPages = Math.max(

    1,

    Math.ceil(filteredMachines.length / PAGE_SIZE),

  );

  const pageItems = filteredMachines.slice(

    (page - 1) * PAGE_SIZE,

    page * PAGE_SIZE,

  );

  const isQrFlow = Boolean(initialQrScanId);

  function updateForm(

    key: keyof FormValues,

    value: string,

  ) {

    setForm((current) => ({

      ...current,

      [key]: value,

    }));

    setSuccessMessage("");

  }

  function resetForm() {

    setForm(createInitialForm());

    setAttachmentFile(null);

    setErrorMessage("");

    setSuccessMessage("");

    setPhase("form");

  }

  function handleFile(

    event: React.ChangeEvent<HTMLInputElement>,

  ) {

    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    const allowed = [

      "image/jpeg",

      "image/png",

      "application/pdf",

    ];

    if (!allowed.includes(file.type)) {

      setErrorMessage(

        "รองรับเฉพาะไฟล์ JPG, PNG และ PDF",

      );

      return;

    }

    if (file.size > 10 * 1024 * 1024) {

      setErrorMessage(

        "ไฟล์หลักฐานต้องมีขนาดไม่เกิน 10MB",

      );

      return;

    }

    setAttachmentFile(file);

    setErrorMessage("");

  }

  function goToReview() {

    setErrorMessage("");

    if (!selectedMachine) {

      setErrorMessage("กรุณาเลือกเครื่องจักร");

      return;

    }

    if (!selectedResource) {

      setErrorMessage(

        "กรุณาเลือกประเภททรัพยากร",

      );

      return;

    }

    const quantity = Number(form.quantity);

    if (

      !Number.isFinite(quantity) ||

      quantity <= 0

    ) {

      setErrorMessage(

        "ปริมาณการใช้ทรัพยากรต้องมากกว่า 0",

      );

      return;

    }

    if (!form.date || !form.time) {

      setErrorMessage(

        "กรุณาระบุวันที่และเวลา",

      );

      return;

    }

    setPhase("review");

  }

  async function confirmSave() {

    if (!selectedMachine || !selectedResource) {

      return;

    }

    setIsSubmitting(true);

    setErrorMessage("");

    setSuccessMessage("");

    try {

      let evidenceFilePath: string | null =

        null;

      if (attachmentFile) {

        const uploadForm = new FormData();

        uploadForm.append(

          "file",

          attachmentFile,

        );

        const uploadResponse = await fetch(

          "/api/uploads",

          {

            method: "POST",

            body: uploadForm,

          },

        );

        const uploadPayload =

          (await uploadResponse.json()) as {

            success: boolean;

            url?: string;

            message?: string;

          };

        if (

          !uploadResponse.ok ||

          !uploadPayload.success ||

          !uploadPayload.url

        ) {

          throw new Error(

            uploadPayload.message ??

              "อัปโหลดไฟล์หลักฐานไม่สำเร็จ",

          );

        }

        evidenceFilePath = uploadPayload.url;

      }

      const usageAt = new Date(

        `${form.date}T${form.time}:00`,

      );

      const response = await fetch(

        "/api/records",

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify({

            machineId: selectedMachine.machineId,

            resourceTypeId:

              selectedResource.resourceTypeId,

            unitId:

              selectedResource.unit.unitId,

            quantity: Number(form.quantity),

            usageAt: usageAt.toISOString(),

            qrScanId:

              initialQrScanId || null,

            evidenceFilePath,

            remark:

              form.remark.trim() || null,

          }),

        },

      );

      const payload =

        (await response.json()) as {

          success: boolean;

          message?: string;

          data?: {

            usageId?: string;

            usageReference?: string;

          };

        };

      if (!response.ok || !payload.success) {

        throw new Error(

          payload.message ??

            "บันทึกข้อมูลไม่สำเร็จ",

        );

      }

      setSuccessMessage(

        payload.data?.usageReference

          ? `บันทึกเรียบร้อย • ${payload.data.usageReference}`

          : "บันทึกข้อมูลเรียบร้อยแล้ว",

      );

      setForm(createInitialForm());

      setAttachmentFile(null);

      setPhase("form");

      router.push("/operator/history");

    } catch (error) {

      console.error(

        "Create ResourceUsage error:",

        error,

      );

      setErrorMessage(

        error instanceof Error

          ? error.message

          : "ไม่สามารถบันทึกข้อมูลได้",

      );

    } finally {

      setIsSubmitting(false);

    }

  }

  return (

    <div className="min-w-0 space-y-4 pb-8 sm:space-y-5 sm:pb-10">

      <section className="min-w-0 rounded-[18px] border border-slate-200 bg-white shadow-sm sm:rounded-[22px]">

        <div className="flex min-w-0 flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h1 className="break-words text-[23px] font-black tracking-[-0.025em] text-slate-950 sm:text-[26px]">

              บันทึกการใช้ทรัพยากร

            </h1>

          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">

            <Link

              href="/operator/scan"

              className="inline-flex h-11 touch-manipulation items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition active:scale-[0.99] hover:bg-slate-50 sm:h-10 sm:px-4"

            >

              <QrCode className="h-4 w-4 text-violet-600" />

              สแกน QR

            </Link>

            <Link

              href="/operator/history"

              className="inline-flex h-11 touch-manipulation items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-bold text-white transition active:scale-[0.99] hover:bg-slate-800 sm:h-10 sm:px-4"

            >

              <History className="h-4 w-4" />

              ประวัติ

            </Link>

          </div>

        </div>

      </section>

      {isQrFlow && selectedMachine && (

        <section className="flex min-w-0 flex-col gap-3 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-4 sm:gap-4 sm:rounded-[22px] sm:px-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex min-w-0 items-start gap-3">

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">

              <QrCode className="h-5 w-5" />

            </span>

            <div>

              <p className="text-sm font-bold text-emerald-900">

                เครื่องจักรถูกเลือกจาก QR Code

              </p>

              <p className="mt-0.5 break-all text-xs text-emerald-700">

                Scan ID: {initialQrScanId}

              </p>

            </div>

          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700">

            <CheckCircle2 className="h-3.5 w-3.5" />

            ยืนยันแล้ว

          </span>

        </section>

      )}

      {successMessage && (

        <section className="flex min-w-0 items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-semibold text-emerald-800 sm:items-center sm:px-5 sm:py-4">

          <CheckCircle2 className="h-5 w-5 shrink-0" />

          {successMessage}

        </section>

      )}

      {errorMessage && (

        <section className="flex min-w-0 items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700 sm:px-5 sm:py-4">

          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          {errorMessage}

        </section>

      )}

      <section className="min-w-0 rounded-[18px] border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:rounded-[20px] sm:px-5">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <p className="text-sm font-bold text-slate-900">สรุปวันนี้</p>

          </div>

          {todayTotals.length === 0 ? (

            <p className="text-sm text-slate-400">ยังไม่มีรายการวันนี้</p>

          ) : (

            <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap">

              {todayTotals.slice(0, 4).map((item) => (

                <div

                  key={item.resourceTypeId}

                  className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 sm:justify-start"

                >

                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-600 sm:max-w-[150px] sm:flex-none">

                    {item.label}

                  </span>

                  <span className="text-sm font-black text-slate-900">

                    {item.total.toLocaleString("th-TH")}

                  </span>

                  <span className="text-[11px] font-semibold text-slate-400">

                    {item.unit}

                  </span>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

      <div className="space-y-5">

        {phase === "form" ? (

            <>

              <section className="min-w-0 rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[22px] sm:p-6">

                <div className="mb-5 flex min-w-0 items-start justify-between gap-3 sm:items-center sm:gap-4">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">

                      Step 01

                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">

                      เลือกเครื่องจักร

                    </h2>

                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">

                    {machineList.length} เครื่อง

                  </span>

                </div>

                <div className="relative mb-4">

                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input

                    value={search}

                    onChange={(event) => {

                      setSearch(

                        event.target.value,

                      );

                      setPage(1);

                    }}

                    placeholder="ค้นหาชื่อหรือรหัสเครื่องจักร"

                    className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-base text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white sm:h-11 sm:text-sm"

                  />

                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">

                  <div className="divide-y divide-slate-100">

                    {pageItems.map((machine) => {

                      const selected =

                        machine.machineId ===

                        selectedMachineId;

                      return (

                        <button

                          key={machine.machineId}

                          type="button"

                          onClick={() =>

                            setSelectedMachineId(

                              machine.machineId,

                            )

                          }

                          className={`flex w-full min-w-0 touch-manipulation items-center gap-3 px-3 py-3.5 text-left transition sm:gap-4 sm:px-4 ${

                            selected

                              ? "bg-emerald-50"

                              : "bg-white hover:bg-slate-50"

                          }`}

                        >

                          <span

                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${

                              selected

                                ? "bg-emerald-600 text-white"

                                : "bg-slate-100 text-slate-500"

                            }`}

                          >

                            <Wrench className="h-5 w-5" />

                          </span>

                          <span className="min-w-0 flex-1">

                            <span className="flex flex-wrap items-center gap-2">

                              <span className="break-words text-sm font-semibold text-slate-900 sm:text-base">

                                {machine.machineName}

                              </span>

                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">

                                {machine.machineCode}

                              </span>

                            </span>

                            <span className="mt-1 block truncate text-[11px] text-slate-500 sm:text-xs">

                              {machine.machineType} •{" "}

                              {machine.lineName}

                            </span>

                          </span>

                          <span

                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${

                              selected

                                ? "border-emerald-600 bg-emerald-600 text-white"

                                : "border-slate-300 text-transparent"

                            }`}

                          >

                            <Check className="h-3.5 w-3.5" />

                          </span>

                        </button>

                      );

                    })}

                    {pageItems.length === 0 && (

                      <div className="px-5 py-12 text-center text-sm text-slate-400">

                        ไม่พบเครื่องจักร

                      </div>

                    )}

                  </div>

                </div>

                {totalPages > 1 && (

                  <div className="mt-4 flex max-w-full items-center justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">

                    {Array.from(

                      { length: totalPages },

                      (_, index) =>

                        index + 1,

                    ).map((pageNumber) => (

                      <button

                        key={pageNumber}

                        type="button"

                        onClick={() =>

                          setPage(pageNumber)

                        }

                        className={`h-10 min-w-10 shrink-0 touch-manipulation rounded-lg px-2 text-xs font-semibold sm:h-8 sm:min-w-8 ${

                          page === pageNumber

                            ? "bg-slate-900 text-white"

                            : "text-slate-500 hover:bg-slate-100"

                        }`}

                      >

                        {pageNumber}

                      </button>

                    ))}

                  </div>

                )}

                {selectedMachine && (

                  <MachineCard

                    machine={selectedMachine}

                  />

                )}

              </section>

              <section className="min-w-0 rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[22px] sm:p-6">

                <div className="mb-5">

                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">

                    Step 02

                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-900">

                    ข้อมูลการใช้ทรัพยากร

                  </h2>

                </div>

                <div className="space-y-5">

                  <Field

                    label="ประเภททรัพยากร"

                    required

                  >

                    <select

                      value={

                        selectedResourceTypeId ??

                        ""

                      }

                      onChange={(event) =>

                        setSelectedResourceTypeId(

                          event.target.value

                            ? Number(

                                event.target

                                  .value,

                              )

                            : null,

                        )

                      }

                      className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-800 outline-none transition focus:border-emerald-400 sm:px-4 sm:text-sm"

                    >

                      <option value="">

                        เลือกประเภททรัพยากร

                      </option>

                      {resourceTypes.map(

                        (resource) => (

                          <option

                            key={

                              resource.resourceTypeId

                            }

                            value={

                              resource.resourceTypeId

                            }

                          >

                            {

                              resource.resourceName

                            }{" "}

                            —{" "}

                            {

                              resource.category

                                .categoryName

                            }

                          </option>

                        ),

                      )}

                    </select>

                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <Field

                      label="หน่วยวัด"

                      required

                    >

                      <div className="flex min-h-12 min-w-0 items-center break-words rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 sm:px-4">

                        {selectedResource

                          ? `${selectedResource.unit.unitName} (${selectedResource.unit.symbol})`

                          : "เลือกประเภททรัพยากรก่อน"}

                      </div>

                    </Field>

                    <Field

                      label="ปริมาณการใช้"

                      required

                    >

                      <div className="flex h-12 min-w-0 items-center rounded-xl border border-slate-200 px-3 focus-within:border-emerald-400 sm:px-4">

                        <input

                          type="number"

                          min="0"

                          step="0.01"

                          value={form.quantity}

                          onChange={(event) =>

                            updateForm(

                              "quantity",

                              event.target.value,

                            )

                          }

                          placeholder="0.00"

                          className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none sm:text-sm"

                        />

                        <span className="text-xs font-semibold text-slate-400">

                          {selectedResource?.unit

                            .symbol ?? ""}

                        </span>

                      </div>

                    </Field>

                  </div>

                  <Field

                    label="วันที่และเวลา"

                    required

                  >

                    <div className="grid gap-3 sm:grid-cols-2">

                      <input

                        type="date"

                        value={form.date}

                        onChange={(event) =>

                          updateForm(

                            "date",

                            event.target.value,

                          )

                        }

                        className="h-12 min-w-0 w-full rounded-xl border border-slate-200 px-3 text-base text-slate-700 outline-none focus:border-emerald-400 sm:px-4 sm:text-sm"

                      />

                      <input

                        type="time"

                        value={form.time}

                        onChange={(event) =>

                          updateForm(

                            "time",

                            event.target.value,

                          )

                        }

                        className="h-12 min-w-0 w-full rounded-xl border border-slate-200 px-3 text-base text-slate-700 outline-none focus:border-emerald-400 sm:px-4 sm:text-sm"

                      />

                    </div>

                  </Field>

                  <Field label="ผู้บันทึก">

                    <div className="flex min-h-12 min-w-0 items-center break-words rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 sm:px-4">

                      {currentUser.name}

                    </div>

                  </Field>

                  <Field label="หมายเหตุ">

                    <textarea

                      value={form.remark}

                      onChange={(event) =>

                        updateForm(

                          "remark",

                          event.target.value.slice(

                            0,

                            1000,

                          ),

                        )

                      }

                      rows={4}

                      placeholder="รายละเอียดเพิ่มเติม เช่น สภาพเครื่องจักรหรือเหตุการณ์ผิดปกติ"

                      className="w-full min-w-0 resize-none rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-700 outline-none focus:border-emerald-400 sm:px-4 sm:text-sm"

                    />

                    <p className="mt-1 text-right text-[11px] text-slate-400">

                      {form.remark.length} / 1000

                    </p>

                  </Field>

                  <Field label="หลักฐาน">

                    {attachmentFile ? (

                      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 sm:px-4">

                        <FileImage className="h-5 w-5 shrink-0 text-emerald-600" />

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-semibold text-slate-800">

                            {attachmentFile.name}

                          </p>

                          <p className="text-xs text-slate-500">

                            {(

                              attachmentFile.size /

                              1024 /

                              1024

                            ).toFixed(2)}{" "}

                            MB

                          </p>

                        </div>

                        <button

                          type="button"

                          onClick={() =>

                            setAttachmentFile(

                              null,

                            )

                          }

                          className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-rose-500"

                        >

                          <Trash2 className="h-4 w-4" />

                        </button>

                      </div>

                    ) : (

                      <label className="flex min-h-[150px] cursor-pointer touch-manipulation flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center transition hover:border-slate-400 hover:bg-slate-50 sm:px-5 sm:py-7">

                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">

                          <Upload className="h-5 w-5" />

                        </span>

                        <span className="mt-3 text-sm font-semibold text-slate-700">

                          แนบหลักฐาน

                        </span>

                        <span className="mt-1 text-xs text-slate-400">

                          JPG, PNG, PDF • สูงสุด 10MB

                        </span>

                        <input

                          type="file"

                          accept="image/jpeg,image/png,application/pdf"

                          className="hidden"

                          onChange={handleFile}

                        />

                      </label>

                    )}

                  </Field>

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">

                    <button

                      type="button"

                      onClick={resetForm}

                      className="inline-flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:w-auto"

                    >

                      <RotateCcw className="h-4 w-4" />

                      ล้างข้อมูล

                    </button>

                    <button

                      type="button"

                      onClick={goToReview}

                      className="inline-flex h-12 min-w-0 flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition active:scale-[0.99] hover:bg-emerald-700"

                    >

                      ตรวจสอบข้อมูล

                      <ArrowRight className="h-4 w-4" />

                    </button>

                  </div>

                </div>

              </section>

            </>

          ) : (

            selectedMachine &&

            selectedResource && (

              <ReviewCard

                machine={selectedMachine}

                resource={selectedResource}

                form={form}

                currentUser={currentUser.name}

                attachmentFile={attachmentFile}

                qrScanId={initialQrScanId}

                isSubmitting={isSubmitting}

                onBack={() =>

                  setPhase("form")

                }

                onConfirm={confirmSave}

              />

            )

          )}

      </div>

    </div>

  );

}

function MachineCard({

  machine,

}: {

  machine: MachineListItem;

}) {

  return (

    <div className="mt-4 min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">

      <div className="flex min-w-0 items-start gap-3">

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">

          <Wrench className="h-5 w-5" />

        </span>

        <div className="min-w-0 flex-1">

          <p className="font-bold text-slate-900">

            {machine.machineName}

          </p>

          <p className="mt-0.5 text-xs text-slate-500">

            {machine.machineCode} •{" "}

            {machine.machineType}

          </p>

        </div>

        <span className="max-w-[105px] shrink-0 truncate rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 sm:max-w-[160px]">

          {machine.operationalStatus}

        </span>

      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">

        <Meta

          icon={Factory}

          label="โรงงาน"

          value={machine.factoryName}

        />

        <Meta

          icon={Building2}

          label="อาคาร"

          value={machine.buildingName}

        />

        <Meta

          icon={MapPin}

          label="แผนก"

          value={machine.departmentName}

        />

        <Meta

          icon={Workflow}

          label="สายการผลิต"

          value={machine.lineName}

        />

      </div>

    </div>

  );

}

function Meta({

  icon: Icon,

  label,

  value,

}: {

  icon: typeof Factory;

  label: string;

  value: string;

}) {

  return (

    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-white/80 px-3 py-2.5">

      <Icon className="h-4 w-4 shrink-0 text-slate-400" />

      <div className="min-w-0">

        <p className="text-[10px] text-slate-400">

          {label}

        </p>

        <p className="truncate text-xs font-semibold text-slate-700">

          {value}

        </p>

      </div>

    </div>

  );

}

function Field({

  label,

  required,

  children,

}: {

  label: string;

  required?: boolean;

  children: React.ReactNode;

}) {

  return (

    <label className="block min-w-0">

      <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">

        {label}

        {required && (

          <span className="text-rose-500">

            *

          </span>

        )}

      </span>

      {children}

    </label>

  );

}

function ReviewCard({

  machine,

  resource,

  form,

  currentUser,

  attachmentFile,

  qrScanId,

  isSubmitting,

  onBack,

  onConfirm,

}: {

  machine: MachineListItem;

  resource: ResourceTypeListItem;

  form: FormValues;

  currentUser: string;

  attachmentFile: File | null;

  qrScanId?: string | null;

  isSubmitting: boolean;

  onBack: () => void;

  onConfirm: () => void;

}) {

  const rows = [

    [

      "เครื่องจักร",

      `${machine.machineName} (${machine.machineCode})`,

    ],

    [

      "ประเภททรัพยากร",

      resource.resourceName,

    ],

    [

      "ปริมาณ",

      `${form.quantity} ${resource.unit.symbol}`,

    ],

    [

      "วันที่และเวลา",

      `${form.date} ${form.time}`,

    ],

    ["ผู้บันทึก", currentUser],

    ["Scan ID", qrScanId || "Manual"],

    ["หมายเหตุ", form.remark || "-"],

    [

      "หลักฐาน",

      attachmentFile?.name || "-",

    ],

  ];

  return (

    <section className="min-w-0 rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[22px] sm:p-6">

      <div className="flex items-start gap-3 border-b border-slate-100 pb-5">

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

          <CheckCircle2 className="h-5 w-5" />

        </span>

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">

            Step 03

          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">

            ตรวจสอบก่อนบันทึก

          </h2>

        </div>

      </div>

      <dl className="divide-y divide-slate-100">

        {rows.map(([label, value]) => (

          <div

            key={label}

            className="grid min-w-0 gap-1 py-4 sm:grid-cols-[140px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)]"

          >

            <dt className="text-xs font-medium text-slate-400">

              {label}

            </dt>

            <dd className="min-w-0 break-words text-sm font-semibold text-slate-800">

              {value}

            </dd>

          </div>

        ))}

      </dl>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">

        <button

          type="button"

          onClick={onBack}

          disabled={isSubmitting}

          className="h-12 min-w-0 flex-1 touch-manipulation rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"

        >

          กลับไปแก้ไข

        </button>

        <button

          type="button"

          onClick={onConfirm}

          disabled={isSubmitting}

          className="inline-flex h-12 min-w-0 flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white transition active:scale-[0.99] hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"

        >

          {isSubmitting ? (

            <>

              <Loader2 className="h-4 w-4 animate-spin" />

              กำลังบันทึก

            </>

          ) : (

            <>

              <Check className="h-4 w-4" />

              ยืนยันและบันทึก

            </>

          )}

        </button>

      </div>

    </section>

  );

}