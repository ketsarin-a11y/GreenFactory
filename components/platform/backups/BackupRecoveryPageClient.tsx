"use client";

import {
  AlertTriangle,
  Archive,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Database,
  Download,
  FileArchive,
  Filter,
  HardDrive,
  History,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type BackupStatus = "COMPLETED" | "RUNNING" | "FAILED";
type BackupType = "AUTOMATIC" | "MANUAL";
type StorageType = "LOCAL" | "CLOUD";

type BackupRecord = {
  id: string;
  databaseId: number;
  createdAt: string;
  createdDate: string;
  type: BackupType;
  scope: string;
  size: string;
  duration: string;
  status: BackupStatus;
  storage: StorageType;
  createdBy: string;
  verified: boolean;
  canDownload: boolean;
  canRestore: boolean;
  errorMessage: string | null;
  restoredAt: string | null;
};

type RecoveryPoint = {
  id: string;
  label: string;
  createdAt: string;
  size: string;
  status: "READY";
  databases: number;
  files: number;
};

type BackupSummary = {
  total: number;
  completed: number;
  failed: number;
  running: number;
  successRate: number;
  storageUsed: string;
  recoveryPointCount: number;
  latestCompletedAt: string | null;
};

type BackupApiResponse = {
  success: boolean;
  message?: string;
  data?: BackupRecord[];
  recoveryPoints?: RecoveryPoint[];
  summary?: BackupSummary;
};

const EMPTY_SUMMARY: BackupSummary = {
  total: 0,
  completed: 0,
  failed: 0,
  running: 0,
  successRate: 0,
  storageUsed: "0 B",
  recoveryPointCount: 0,
  latestCompletedAt: null,
};

export default function BackupRecoveryPageClient() {
  const [records, setRecords] = useState<BackupRecord[]>([]);
  const [recoveryPoints, setRecoveryPoints] = useState<RecoveryPoint[]>([]);
  const [summary, setSummary] = useState<BackupSummary>(EMPTY_SUMMARY);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | BackupStatus>("ALL");
  const [typeFilter, setTypeFilter] =
    useState<"ALL" | BackupType>("ALL");
  const [page, setPage] = useState(1);

  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedRecovery, setSelectedRecovery] =
    useState<RecoveryPoint | null>(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const [backupScope, setBackupScope] = useState<"FULL" | "DATABASE">(
    "FULL",
  );
  const [backupStorage, setBackupStorage] =
    useState<StorageType>("LOCAL");
  const [autoVerify, setAutoVerify] = useState(true);

  const [retentionDays, setRetentionDays] = useState(30);
  const [backupTime, setBackupTime] = useState("02:00");

  const [restoreReason, setRestoreReason] = useState("");
  const [restoreConfirmation, setRestoreConfirmation] =
    useState("");

  const pageSize = 4;

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/platform/backups", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const result = (await response.json()) as BackupApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "ไม่สามารถโหลดข้อมูล Backup ได้",
        );
      }

      setRecords(result.data ?? []);
      setRecoveryPoints(result.recoveryPoints ?? []);
      setSummary(result.summary ?? EMPTY_SUMMARY);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถโหลดข้อมูล Backup ได้",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesKeyword =
        !keyword ||
        record.id.toLowerCase().includes(keyword) ||
        record.createdBy.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        record.status === statusFilter;

      const matchesType =
        typeFilter === "ALL" ||
        record.type === typeFilter;

      return matchesKeyword && matchesStatus && matchesType;
    });
  }, [query, records, statusFilter, typeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / pageSize),
  );

  const safePage = Math.min(page, totalPages);

  const paginatedRecords = filteredRecords.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  async function startBackup() {
    if (busyAction) return;

    setShowBackupModal(false);
    setBusyAction("create-backup");
    setError("");

    try {
      const response = await fetch("/api/platform/backups", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: backupScope,
          storage: backupStorage,
          autoVerify,
        }),
      });

      const result = (await response.json()) as BackupApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "ไม่สามารถสำรองข้อมูลได้",
        );
      }

      notify(result.message ?? "สำรองข้อมูลเสร็จสมบูรณ์แล้ว");
      await loadData(true);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถสำรองข้อมูลได้";

      setError(message);
      notify(message);
    } finally {
      setBusyAction(null);
    }
  }

  async function retryBackup(record: BackupRecord) {
    setBackupScope(
      record.scope === "DATABASE" ? "DATABASE" : "FULL",
    );
    setBackupStorage("LOCAL");
    setShowBackupModal(true);
  }

  function downloadBackup(record: BackupRecord) {
    if (!record.canDownload) {
      notify("Backup นี้ยังไม่พร้อมให้ดาวน์โหลด");
      return;
    }

    window.location.href = `/api/platform/backups/${encodeURIComponent(
      record.id,
    )}/download`;
  }

  async function restoreRecoveryPoint(point: RecoveryPoint) {
    if (busyAction) return;

    setBusyAction(`restore-${point.id}`);
    setError("");

    try {
      const response = await fetch(
        `/api/platform/backups/${encodeURIComponent(
          point.id,
        )}/restore`,
        {
          method: "POST",
          cache: "no-store",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirmation: restoreConfirmation,
            reason: restoreReason,
          }),
        },
      );

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "ไม่สามารถกู้คืนระบบได้",
        );
      }

      setSelectedRecovery(null);
      setRestoreReason("");
      setRestoreConfirmation("");

      notify(result.message ?? "กู้คืนระบบเรียบร้อยแล้ว");

      await loadData(true);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถกู้คืนระบบได้";

      setError(message);
      notify(message);
    } finally {
      setBusyAction(null);
    }
  }

  function exportCsv() {
    const header =
      "Backup ID,Created At,Type,Scope,Size,Duration,Status,Storage,Created By,Verified\n";

    const rows = filteredRecords
      .map((record) =>
        [
          record.id,
          record.createdAt,
          record.type,
          record.scope,
          record.size,
          record.duration,
          record.status,
          record.storage,
          record.createdBy,
          record.verified ? "YES" : "NO",
        ]
          .map((value) =>
            `"${String(value).replaceAll('"', '""')}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF", header + rows], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "backup-history.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    notify("ส่งออกประวัติการสำรองข้อมูลแล้ว");
  }

  if (loading) {
    return (
      <div className="grid min-h-[520px] place-items-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-emerald-700" />
          <p className="mt-3 text-sm font-semibold text-slate-600">
            กำลังโหลดข้อมูล Backup
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Platform Administration
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500">
                Backup & Recovery
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[30px]">
              สำรองและการกู้คืน
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              สำรองฐานข้อมูลจริง ดาวน์โหลดไฟล์ SQL และกู้คืนระบบจาก
              Recovery Point ที่ตรวจสอบแล้ว
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPolicyModal(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <CalendarClock className="h-4 w-4" />
              ตั้งค่านโยบาย
            </button>

            <button
              type="button"
              onClick={() => setShowBackupModal(true)}
              disabled={busyAction === "create-backup"}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:opacity-50"
            >
              {busyAction === "create-backup" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              สำรองข้อมูลตอนนี้
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="สำรองล่าสุด"
            value={summary.latestCompletedAt ?? "ยังไม่มีข้อมูล"}
            description="อ่านจาก backup_record จริง"
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconClassName="bg-emerald-50 text-emerald-600"
          />

          <MetricCard
            label="Recovery Point"
            value={String(summary.recoveryPointCount)}
            description="Backup ที่ผ่านการ Verify"
            icon={<RotateCcw className="h-5 w-5" />}
            iconClassName="bg-blue-50 text-blue-600"
          />

          <MetricCard
            label="พื้นที่จัดเก็บ"
            value={summary.storageUsed}
            description="รวมขนาดไฟล์ Backup ที่สำเร็จ"
            icon={<HardDrive className="h-5 w-5" />}
            iconClassName="bg-violet-50 text-violet-600"
          />

          <MetricCard
            label="ความสำเร็จ"
            value={`${summary.successRate}%`}
            description={`${summary.failed} รายการล้มเหลว`}
            icon={<Archive className="h-5 w-5" />}
            iconClassName="bg-amber-50 text-amber-600"
          />
        </section>

        <section className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel
            title="สถานะระบบสำรองข้อมูล"
            description="ตรวจสอบบริการที่ใช้สร้าง Backup บนเครื่องนี้"
            icon={<Cloud className="h-5 w-5" />}
            action={
              <button
                type="button"
                onClick={() => void loadData(true)}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                รีเฟรช
              </button>
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
              <HealthCard
                title="Backup Service"
                value="Ready"
                detail="mysqldump พร้อมใช้งาน"
                tone="success"
              />
              <HealthCard
                title="Local Storage"
                value="Connected"
                detail="storage/backups"
                tone="success"
              />
              <HealthCard
                title="Cloud Storage"
                value="Not configured"
                detail="ยังไม่ได้เชื่อม Cloud"
                tone="warning"
              />
            </div>
          </Panel>

          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-900 to-emerald-700 p-5 text-white shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              Recovery readiness
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {summary.recoveryPointCount > 0
                ? "พร้อมกู้คืนระบบ"
                : "ยังไม่มี Recovery Point"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-emerald-100">
              {summary.recoveryPointCount > 0
                ? "มีข้อมูลสำรองที่ผ่านการตรวจสอบและพร้อมใช้กู้คืน"
                : "สร้าง Backup พร้อมเปิดการตรวจสอบความสมบูรณ์ก่อน"}
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width:
                    summary.recoveryPointCount > 0 ? "100%" : "0%",
                }}
              />
            </div>
          </div>
        </section>

        <section className="mb-5">
          <Panel
            title="Recovery Points"
            description="เลือก Backup ที่ผ่านการตรวจสอบเพื่อกู้คืนฐานข้อมูล"
            icon={<History className="h-5 w-5" />}
          >
            {recoveryPoints.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {recoveryPoints.map((point) => (
                  <div
                    key={point.id}
                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Database className="h-5 w-5" />
                      </span>
                      <RecoveryBadge status={point.status} />
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-900">
                      {point.label}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {point.id}
                    </p>

                    <div className="mt-4 space-y-2 text-sm text-slate-500">
                      <InfoLine
                        label="สร้างเมื่อ"
                        value={point.createdAt}
                      />
                      <InfoLine label="ขนาด" value={point.size} />
                      <InfoLine
                        label="ฐานข้อมูล"
                        value={`${point.databases} DB`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecovery(point);
                        setRestoreReason("");
                        setRestoreConfirmation("");
                      }}
                      className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                    >
                      <RotateCcw className="h-4 w-4" />
                      เริ่มกู้คืนจากจุดนี้
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="ยังไม่มี Recovery Point" />
            )}
          </Panel>
        </section>

        <section>
          <Panel
            title="ประวัติการสำรองข้อมูล"
            description="ประวัติจากฐานข้อมูลจริง ดาวน์โหลด และสำรองซ้ำ"
            icon={<FileArchive className="h-5 w-5" />}
            action={
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            }
          >
            <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="ค้นหา Backup ID หรือผู้ดำเนินการ..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value as
                      | "ALL"
                      | BackupStatus,
                  );
                  setPage(1);
                }}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none"
              >
                <option value="ALL">ทุกสถานะ</option>
                <option value="COMPLETED">สำเร็จ</option>
                <option value="RUNNING">กำลังทำงาน</option>
                <option value="FAILED">ล้มเหลว</option>
              </select>

              <select
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(
                    event.target.value as
                      | "ALL"
                      | BackupType,
                  );
                  setPage(1);
                }}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none"
              >
                <option value="ALL">ทุกประเภท</option>
                <option value="AUTOMATIC">อัตโนมัติ</option>
                <option value="MANUAL">สั่งด้วยตนเอง</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[1050px] border-collapse">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Backup ID</th>
                    <th className="px-4 py-3">วันที่และเวลา</th>
                    <th className="px-4 py-3">ประเภท</th>
                    <th className="px-4 py-3">ขนาด</th>
                    <th className="px-4 py-3">ระยะเวลา</th>
                    <th className="px-4 py-3">Storage</th>
                    <th className="px-4 py-3">สถานะ</th>
                    <th className="px-4 py-3 text-right">
                      การจัดการ
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedRecords.map((record) => (
                    <tr key={record.id} className="text-sm">
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-900">
                          {record.id}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {record.createdBy}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {record.createdAt}
                      </td>

                      <td className="px-4 py-4">
                        <TypeBadge type={record.type} />
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-700">
                        {record.size}
                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {record.duration}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                          {record.storage === "CLOUD" ? (
                            <Cloud className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Server className="h-4 w-4 text-violet-500" />
                          )}
                          {record.storage === "CLOUD"
                            ? "Cloud"
                            : "Local"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={record.status} />
                        {record.errorMessage && (
                          <p className="mt-1 max-w-[220px] truncate text-xs text-rose-500">
                            {record.errorMessage}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {record.status === "FAILED" ? (
                            <button
                              type="button"
                              onClick={() => retryBackup(record)}
                              className="inline-flex h-9 items-center gap-2 rounded-xl bg-amber-50 px-3 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              สำรองใหม่
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                downloadBackup(record)
                              }
                              disabled={!record.canDownload}
                              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                            >
                              <Download className="h-3.5 w-3.5" />
                              ดาวน์โหลด
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {paginatedRecords.length === 0 && (
                <div className="bg-white px-5 py-14 text-center">
                  <Filter className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm font-bold text-slate-700">
                    ไม่พบรายการสำรองข้อมูล
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                แสดง {paginatedRecords.length} จาก{" "}
                {filteredRecords.length} รายการ
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1),
                    )
                  }
                  disabled={safePage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="min-w-20 text-center text-sm font-semibold text-slate-600">
                  หน้า {safePage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(totalPages, current + 1),
                    )
                  }
                  disabled={safePage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Panel>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[80] flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-2xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-slate-700">
            {toast}
          </p>
        </div>
      )}

      {showBackupModal && (
        <Modal onClose={() => setShowBackupModal(false)}>
          <ModalHeader
            icon={<UploadCloud className="h-6 w-6" />}
            title="สร้างข้อมูลสำรองใหม่"
            description="สร้างไฟล์ SQL จริงจากฐานข้อมูล GreenFactory"
            onClose={() => setShowBackupModal(false)}
          />

          <div className="space-y-5">
            <SelectField
              label="ขอบเขตข้อมูล"
              value={backupScope}
              onChange={(value) =>
                setBackupScope(
                  value === "DATABASE"
                    ? "DATABASE"
                    : "FULL",
                )
              }
              options={[
                {
                  value: "FULL",
                  label: "Full Database Backup",
                },
                {
                  value: "DATABASE",
                  label: "Database Only",
                },
              ]}
            />

            <SelectField
              label="ตำแหน่งจัดเก็บ"
              value={backupStorage}
              onChange={(value) =>
                setBackupStorage(value as StorageType)
              }
              options={[
                {
                  value: "LOCAL",
                  label: "Local Backup Server",
                },
                {
                  value: "CLOUD",
                  label: "Cloud Storage (ยังไม่เชื่อมต่อ)",
                },
              ]}
            />

            <ToggleRow
              title="ตรวจสอบความสมบูรณ์หลังสำรอง"
              description="กำหนด Backup นี้เป็น Recovery Point เมื่อสำเร็จ"
              checked={autoVerify}
              onChange={setAutoVerify}
            />
          </div>

          <ModalFooter
            onCancel={() => setShowBackupModal(false)}
            onConfirm={startBackup}
            confirmLabel="เริ่มสำรองข้อมูล"
          />
        </Modal>
      )}

      {showPolicyModal && (
        <Modal onClose={() => setShowPolicyModal(false)}>
          <ModalHeader
            icon={<CalendarClock className="h-6 w-6" />}
            title="นโยบายการสำรองข้อมูล"
            description="หน้านี้บันทึกเฉพาะค่าหน้าจอ จนกว่าจะเชื่อม Scheduler ในขั้นถัดไป"
            onClose={() => setShowPolicyModal(false)}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                เวลาสำรองอัตโนมัติ
              </span>

              <input
                type="time"
                value={backupTime}
                onChange={(event) =>
                  setBackupTime(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
              />
            </label>

            <NumberField
              label="เก็บข้อมูลสำรอง"
              value={retentionDays}
              suffix="วัน"
              onChange={setRetentionDays}
            />
          </div>

          <ModalFooter
            onCancel={() => setShowPolicyModal(false)}
            onConfirm={() => {
              setShowPolicyModal(false);
              notify(
                "บันทึกค่าหน้าจอแล้ว — Scheduler จะเชื่อมในขั้นต่อไป",
              );
            }}
            confirmLabel="บันทึกนโยบาย"
          />
        </Modal>
      )}

      {selectedRecovery && (
        <Modal onClose={() => setSelectedRecovery(null)}>
          <ModalHeader
            icon={<AlertTriangle className="h-6 w-6" />}
            title="ยืนยันการกู้คืนฐานข้อมูล"
            description="การกู้คืนจะเขียนข้อมูลจากไฟล์ SQL กลับเข้าสู่ MySQL"
            onClose={() => setSelectedRecovery(null)}
            warning
          />

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
            <p className="text-sm font-bold text-amber-900">
              {selectedRecovery.label}
            </p>

            <div className="mt-3 space-y-2 text-sm text-amber-800">
              <InfoLine
                label="Recovery Point"
                value={selectedRecovery.id}
              />
              <InfoLine
                label="สร้างเมื่อ"
                value={selectedRecovery.createdAt}
              />
              <InfoLine
                label="ขนาด"
                value={selectedRecovery.size}
              />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                เหตุผลในการกู้คืน
              </span>
              <textarea
                value={restoreReason}
                onChange={(event) =>
                  setRestoreReason(event.target.value)
                }
                rows={3}
                placeholder="เช่น กู้คืนหลังข้อมูลผิดพลาดจากการทดสอบ"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                พิมพ์ RESTORE เพื่อยืนยัน
              </span>
              <input
                value={restoreConfirmation}
                onChange={(event) =>
                  setRestoreConfirmation(event.target.value)
                }
                placeholder="RESTORE"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-amber-500"
              />
            </label>
          </div>

          <ModalFooter
            onCancel={() => setSelectedRecovery(null)}
            onConfirm={() =>
              void restoreRecoveryPoint(selectedRecovery)
            }
            confirmLabel={
              busyAction === `restore-${selectedRecovery.id}`
                ? "กำลังกู้คืน..."
                : "เริ่มกู้คืนระบบ"
            }
            warning
          />
        </Modal>
      )}
    </div>
  );
}

function Panel({
  title,
  description,
  icon,
  action,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            {icon}
          </span>

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          </div>
        </div>

        {action}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon,
  iconClassName,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-xl font-bold text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

function HealthCard({
  title,
  value,
  detail,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  tone: "success" | "warning";
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        tone === "success"
          ? "border-emerald-100 bg-emerald-50/60"
          : "border-amber-100 bg-amber-50/60"
      }`}
    >
      <p className="text-sm font-semibold text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-xl font-bold text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-12 text-center">
      <Database className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-3 text-sm font-bold text-slate-700">
        {text}
      </p>
    </div>
  );
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: BackupStatus;
}) {
  const config = {
    COMPLETED: {
      label: "สำเร็จ",
      className: "bg-emerald-50 text-emerald-700",
    },
    RUNNING: {
      label: "กำลังทำงาน",
      className: "bg-blue-50 text-blue-700",
    },
    FAILED: {
      label: "ล้มเหลว",
      className: "bg-rose-50 text-rose-700",
    },
  }[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function TypeBadge({ type }: { type: BackupType }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        type === "AUTOMATIC"
          ? "bg-violet-50 text-violet-700"
          : "bg-blue-50 text-blue-700"
      }`}
    >
      {type === "AUTOMATIC"
        ? "อัตโนมัติ"
        : "สั่งด้วยตนเอง"}
    </span>
  );
}

function RecoveryBadge({
  status,
}: {
  status: RecoveryPoint["status"];
}) {
  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
      พร้อมกู้คืน
    </span>
  );
}

function NumberField({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <div className="relative">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(event) =>
            onChange(Number(event.target.value) || 0)
          }
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-16 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
        />

        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
          {suffix}
        </span>
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl border border-slate-200 p-4">
      <div>
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="ปิดหน้าต่าง"
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-slate-950/35 backdrop-blur-[2px]"
      />

      <div className="fixed left-1/2 top-1/2 z-[70] max-h-[90vh] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        {children}
      </div>
    </>
  );
}

function ModalHeader({
  icon,
  title,
  description,
  onClose,
  warning = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClose: () => void;
  warning?: boolean;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            warning
              ? "bg-amber-50 text-amber-600"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {icon}
        </span>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-950">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ModalFooter({
  onCancel,
  onConfirm,
  confirmLabel,
  warning = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  warning?: boolean;
}) {
  return (
    <div className="mt-6 flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        ยกเลิก
      </button>

      <button
        type="button"
        onClick={onConfirm}
        className={`h-10 rounded-xl px-4 text-sm font-bold text-white transition ${
          warning
            ? "bg-amber-600 hover:bg-amber-700"
            : "bg-emerald-800 hover:bg-emerald-900"
        }`}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
