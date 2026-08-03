"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Factory,
  LoaderCircle,
  MapPin,
  PenLine,
  Workflow,
  Wrench,
} from "lucide-react";

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

export default function QRTokenPage({
  params,
}: ScanPageProps) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { token } = await params;

        const response = await fetch(
          `/api/qr/scan/${encodeURIComponent(token)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(
            payload.message ?? "ไม่สามารถอ่าน QR Code ได้",
          );
        }

        setResult(payload.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "เกิดข้อผิดพลาดในการอ่าน QR Code",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-3 text-sm text-slate-500">
            กำลังตรวจสอบ QR Code
          </p>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <section className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-7 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            ไม่สามารถใช้ QR Code นี้ได้
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <Link
            href="/operator/scan"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            กลับไปสแกนใหม่
          </Link>
        </section>
      </main>
    );
  }

  const targetName =
    result.targetType === "MACHINE"
      ? result.machine?.machineName
      : result.checkpoint?.checkpointName;

  const targetCode =
    result.targetType === "MACHINE"
      ? result.machine?.machineCode
      : result.checkpoint?.checkpointCode;

  const recordUrl =
    result.targetType === "MACHINE"
      ? `/operator/record?machineId=${result.machine?.machineId}&scanId=${result.scanId}`
      : `/operator/record?checkpointId=${result.checkpoint?.checkpointId}&scanId=${result.scanId}`;

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />

            <div>
              <p className="text-sm font-semibold text-emerald-700">
                อ่าน QR Code สำเร็จ
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {targetName}
              </h1>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              รหัส
            </p>

            <p className="mt-1 text-lg font-bold text-slate-800">
              {targetCode}
            </p>
          </div>

          {result.targetType === "MACHINE" && result.machine && (
            <InfoRow
              icon={Wrench}
              label="ประเภทเครื่องจักร"
              value={result.machine.machineType}
            />
          )}

          <InfoRow
            icon={Factory}
            label="โรงงาน"
            value={result.organization.factoryName}
          />

          <InfoRow
            icon={Building2}
            label="อาคาร"
            value={result.organization.buildingName}
          />

          <InfoRow
            icon={MapPin}
            label="แผนก"
            value={result.organization.departmentName}
          />

          <InfoRow
            icon={Workflow}
            label="ไลน์การผลิต"
            value={result.organization.lineName}
          />

          <Link
            href={recordUrl}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <PenLine className="h-4 w-4" />
            บันทึกการใช้ทรัพยากร
          </Link>
        </div>
      </section>
    </main>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Factory;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 px-4 py-3.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}