"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  Factory,
  LoaderCircle,
  MapPin,
  PenLine,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Workflow,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ScanPageProps {
  params: Promise<{
    token: string;
  }>;
}

interface ScanResult {
  targetType: "MACHINE" | "CHECKPOINT";
  scanId: string;
  qrId: string;
  token: string;

  machine?: {
    machineId: number;
    machineCode: string;
    machineName: string;
    operationalStatus: string;
    machineType: string;
  };

  checkpoint?: {
    checkpointId: number;
    checkpointCode: string;
    checkpointName: string;
    checkpointType: string | null;
  };

  organization: {
    factoryId: number;
    factoryName: string;
    buildingId: number;
    buildingName: string;
    departmentId: number;
    departmentName: string;
    lineId: number;
    lineName: string;
  };
}

interface ScanApiResponse {
  success: boolean;
  message?: string;
  data?: ScanResult;
}

interface RequestEntry {
  createdAt: number;
  promise: Promise<ScanApiResponse>;
}

class ScanRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ScanRequestError";
    this.status = status;
  }
}

const scanRequestCache = new Map<string, RequestEntry>();

const REQUEST_DEDUPE_MS = 4_000;

function requestScan(token: string): Promise<ScanApiResponse> {
  const now = Date.now();

  const cached = scanRequestCache.get(token);

  if (cached && now - cached.createdAt < REQUEST_DEDUPE_MS) {
    return cached.promise;
  }

  const promise = fetch(
    `/api/qr/scan/${encodeURIComponent(token)}`,
    {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    },
  ).then(async (response) => {
    const contentType =
      response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      await response.text();

      throw new ScanRequestError(
        response.status,
        response.status === 404
          ? "ไม่พบ API สำหรับตรวจสอบ QR Code"
          : `ระบบตรวจสอบ QR Code เกิดข้อผิดพลาด (${response.status})`,
      );
    }

    const payload =
      (await response.json()) as ScanApiResponse;

    if (
      !response.ok ||
      !payload.success ||
      !payload.data
    ) {
      throw new ScanRequestError(
        response.status,
        payload.message ?? "ไม่สามารถอ่าน QR Code ได้",
      );
    }

    return payload;
  });

  scanRequestCache.set(token, {
    createdAt: now,
    promise,
  });

  window.setTimeout(() => {
    const current = scanRequestCache.get(token);

    if (current?.promise === promise) {
      scanRequestCache.delete(token);
    }
  }, REQUEST_DEDUPE_MS);

  return promise;
}

export default function QRTokenPage({
  params,
}: ScanPageProps) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] =
    useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const { token } = await params;
        const normalizedToken = token.trim();

        if (!normalizedToken) {
          throw new Error(
            "QR Code นี้ไม่มี Token ที่ถูกต้อง",
          );
        }

        const payload =
          await requestScan(normalizedToken);

        if (!active || !payload.data) {
          return;
        }

        setResult(payload.data);
      } catch (err) {
        if (!active) {
          return;
        }

        if (
          err instanceof ScanRequestError &&
          err.status === 401
        ) {
          const { token } = await params;
          const normalizedToken = token.trim();

          const returnTo =
            `/scan/${encodeURIComponent(normalizedToken)}`;

          window.location.replace(
            `/login?returnTo=${encodeURIComponent(returnTo)}`,
          );

          return;
        }

        setResult(null);

        if (
          err instanceof ScanRequestError &&
          err.status === 403
        ) {
          setError(
            "บัญชีนี้ไม่มีสิทธิ์เข้าถึง QR Code ของโรงงานนี้",
          );
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "เกิดข้อผิดพลาดในการอ่าน QR Code",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [params, reloadKey]);

  const viewModel = useMemo(() => {
    if (!result) {
      return null;
    }

    const isMachine =
      result.targetType === "MACHINE";

    const targetName = isMachine
      ? result.machine?.machineName ??
        "ไม่พบชื่อเครื่องจักร"
      : result.checkpoint?.checkpointName ??
        "ไม่พบชื่อจุดตรวจ";

    const targetCode = isMachine
      ? result.machine?.machineCode ?? "-"
      : result.checkpoint?.checkpointCode ?? "-";

    const targetType = isMachine
      ? result.machine?.machineType ?? "เครื่องจักร"
      : result.checkpoint?.checkpointType ??
        "จุดตรวจ";

    const status = isMachine
      ? result.machine?.operationalStatus ?? "UNKNOWN"
      : "ACTIVE";

    const recordUrl = isMachine
      ? `/operator/record?machineId=${
          result.machine?.machineId ?? ""
        }&scanId=${encodeURIComponent(result.scanId)}`
      : `/operator/record?checkpointId=${
          result.checkpoint?.checkpointId ?? ""
        }&scanId=${encodeURIComponent(result.scanId)}`;

    return {
      isMachine,
      targetName,
      targetCode,
      targetType,
      status,
      recordUrl,
    };
  }, [result]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !result || !viewModel) {
    return (
      <ErrorState
        message={
          error || "ไม่พบข้อมูลจาก QR Code นี้"
        }
        onRetry={() => {
          setResult(null);
          setError("");
          setReloadKey((value) => value + 1);
        }}
      />
    );
  }

  const { organization } = result;

  return (
    <main className="min-h-screen bg-[#f5f8f6] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-[980px]">
        <header className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/operator/scan"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dce6e0] bg-white px-3 text-xs font-semibold text-[#607068] shadow-sm transition hover:bg-[#f0f5f2]"
          >
            <ArrowLeft className="h-4 w-4" />
            สแกนอีกครั้ง
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified QR
          </div>
        </header>

        <section className="overflow-hidden rounded-[28px] border border-[#dbe5df] bg-white shadow-[0_24px_70px_rgba(28,66,46,0.08)]">
          <div className="relative overflow-hidden border-b border-[#dce8e1] bg-[#123e2d] px-5 py-6 text-white sm:px-7 sm:py-7">
            <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-12 h-48 w-48 rounded-full bg-teal-200/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15 backdrop-blur">
                  {viewModel.isMachine ? (
                    <Wrench className="h-6 w-6" />
                  ) : (
                    <QrCode className="h-6 w-6" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300/15 px-2.5 py-1 text-[10px] font-bold text-emerald-100 ring-1 ring-emerald-200/15">
                      <Check className="h-3 w-3" />
                      อ่าน QR สำเร็จ
                    </span>

                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/75 ring-1 ring-white/10">
                      {viewModel.isMachine
                        ? "MACHINE"
                        : "CHECKPOINT"}
                    </span>
                  </div>

                  <h1 className="mt-3 break-words text-[26px] font-black leading-tight tracking-[-0.035em] sm:text-[32px]">
                    {viewModel.targetName}
                  </h1>

                  <p className="mt-2 font-mono text-[11px] font-semibold tracking-[0.06em] text-white/60 sm:text-xs">
                    {viewModel.targetCode}
                  </p>
                </div>
              </div>

              <StatusPill status={viewModel.status} />
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="p-5 sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                    Asset Information
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-[#24352c]">
                    ข้อมูลหน้างาน
                  </h2>
                </div>

                <span className="rounded-xl border border-[#e0e8e3] bg-[#f8fbf9] px-3 py-2 text-[10px] font-semibold text-[#65746c]">
                  Scan ID · {result.scanId.slice(-8)}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard
                  icon={
                    viewModel.isMachine
                      ? Wrench
                      : QrCode
                  }
                  label={
                    viewModel.isMachine
                      ? "ประเภทเครื่องจักร"
                      : "ประเภทจุดตรวจ"
                  }
                  value={viewModel.targetType}
                />

                <InfoCard
                  icon={Factory}
                  label="โรงงาน"
                  value={organization.factoryName}
                />

                <InfoCard
                  icon={Building2}
                  label="อาคาร"
                  value={organization.buildingName}
                />

                <InfoCard
                  icon={MapPin}
                  label="แผนก"
                  value={organization.departmentName}
                />
              </div>

              <div className="mt-3">
                <InfoCard
                  icon={Workflow}
                  label="สายการผลิต"
                  value={organization.lineName}
                  fullWidth
                />
              </div>

              <div className="mt-6 rounded-[18px] border border-emerald-100 bg-emerald-50/55 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                    <ShieldCheck className="h-4 w-4" />
                  </span>

                  <div>
                    <p className="text-xs font-bold text-emerald-900">
                      ตรวจสอบตำแหน่งแล้ว
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-emerald-800/70">
                      ข้อมูลเครื่องจักรและโครงสร้างโรงงานถูกตรวจจาก
                      Secure Token ก่อนสร้างรายการบันทึก
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="border-t border-[#e1e9e4] bg-[#fafcfb] p-5 sm:p-7 lg:border-l lg:border-t-0">
              <div className="rounded-[22px] border border-[#dfe8e3] bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <PenLine className="h-5 w-5" />
                </div>

                <h2 className="mt-4 text-base font-bold text-[#273830]">
                  พร้อมบันทึกข้อมูล
                </h2>

                <p className="mt-1.5 text-[11px] leading-5 text-[#7e8a84]">
                  ระบบจะส่ง Asset และ Scan ID
                  ไปยังหน้าบันทึกโดยอัตโนมัติ
                  ไม่ต้องเลือกเครื่องจักรซ้ำ
                </p>

                <Link
                  href={viewModel.recordUrl}
                  className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#177d55] px-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(23,125,85,0.22)] transition hover:-translate-y-0.5 hover:bg-[#126d49]"
                >
                  <PenLine className="h-4 w-4" />
                  บันทึกการใช้ทรัพยากร
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/operator"
                  className="mt-2.5 flex min-h-[44px] w-full items-center justify-center rounded-[13px] border border-[#dfe6e2] bg-white px-4 text-xs font-semibold text-[#65726b] transition hover:bg-[#f4f7f5]"
                >
                  กลับหน้าหลัก Operator
                </Link>
              </div>

              <div className="mt-3 rounded-[18px] border border-[#e2e8e4] bg-white px-4 py-3.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9aa49f]">
                  Secure Scan
                </p>

                <p className="mt-1.5 break-all font-mono text-[10px] leading-5 text-[#66756d]">
                  {result.token}
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f8f6] px-5">
      <section className="w-full max-w-sm rounded-[26px] border border-[#dfe7e2] bg-white p-7 text-center shadow-[0_22px_65px_rgba(24,61,41,0.08)]">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-emerald-50 text-emerald-700">
          <QrCode className="h-7 w-7" />
          <LoaderCircle className="absolute -bottom-1 -right-1 h-6 w-6 animate-spin rounded-full bg-white p-1 text-emerald-600 shadow-sm" />
        </div>

        <h1 className="mt-5 text-lg font-bold text-[#273830]">
          กำลังตรวจสอบ QR Code
        </h1>

        <p className="mt-2 text-xs leading-5 text-[#859189]">
          กำลังยืนยัน Token
          และตรวจสอบสิทธิ์การเข้าถึง Asset
        </p>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#edf2ef]">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-emerald-500" />
        </div>
      </section>
    </main>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f8f6] px-5 py-8">
      <section className="w-full max-w-md overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-[0_24px_70px_rgba(86,40,40,0.08)]">
        <div className="bg-rose-50 px-6 py-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-rose-500 shadow-sm ring-1 ring-rose-100">
            <AlertCircle className="h-6 w-6" />
          </span>

          <h1 className="mt-4 text-xl font-black tracking-[-0.02em] text-[#362b2d]">
            ใช้ QR Code นี้ไม่ได้
          </h1>

          <p className="mt-2 text-xs leading-6 text-rose-700/70">
            {message}
          </p>
        </div>

        <div className="space-y-2.5 p-5">
          <button
            type="button"
            onClick={onRetry}
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[13px] bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            ตรวจสอบอีกครั้ง
          </button>

          <Link
            href="/operator/scan"
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[13px] border border-[#dfe6e2] bg-white px-4 text-xs font-semibold text-[#617067] transition hover:bg-[#f5f8f6]"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปสแกน QR ใหม่
          </Link>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  fullWidth = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`flex min-h-[82px] items-center gap-3 rounded-[17px] border border-[#e0e8e3] bg-white px-4 py-3.5 transition hover:border-[#cddbd3] hover:bg-[#fbfdfc] ${
        fullWidth ? "w-full" : ""
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#eff6f2] text-[#287455]">
        <Icon className="h-[18px] w-[18px]" />
      </span>

      <div className="min-w-0">
        <p className="text-[10px] font-medium text-[#97a19c]">
          {label}
        </p>

        <p className="mt-1 break-words text-[13px] font-bold text-[#415148]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: string;
}) {
  const normalized = status.toUpperCase();

  const normal =
    normalized === "NORMAL" ||
    normalized === "ACTIVE";

  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold ring-1 ${
        normal
          ? "bg-emerald-300/15 text-emerald-100 ring-emerald-200/20"
          : "bg-amber-300/15 text-amber-100 ring-amber-200/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          normal
            ? "bg-emerald-300"
            : "bg-amber-300"
        }`}
      />

      {normal ? "สถานะปกติ" : status}
    </span>
  );
}