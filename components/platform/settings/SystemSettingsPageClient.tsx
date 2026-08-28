"use client";

import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Database,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Save,
  Search,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Tab =
  | "overview"
  | "security"
  | "companies"
  | "services"
  | "backup"
  | "features";

type CompanyStatus = "active" | "warning" | "suspended";

type Company = {
  id: number;
  name: string;
  users: number;
  factories: number;
  status: CompanyStatus;
};

type SystemSettings = {
  maintenanceMode: boolean;
  forceMfa: boolean;
  ipProtection: boolean;
  anomalyDetection: boolean;
  autoBlock: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  auditRetentionDays: number;
  loginRetentionDays: number;
  backupFrequency: string;
  carbonAnalyticsEnabled: boolean;
  sensorMonitoringEnabled: boolean;
  aiRecommendationsEnabled: boolean;
  machineQrEnabled: boolean;
  reportBuilderEnabled: boolean;
};

type SettingsResponse = {
  success: boolean;
  message?: string;
  data?: SystemSettings;
};

type CompaniesResponse = {
  success: boolean;
  data?: Array<{
    id: number;
    name: string;
    status: string;
    factories: number;
    users: number;
  }>;
};

type BackupResponse = {
  success: boolean;
  summary?: {
    latestCompletedAt?: string | null;
    successRate?: number;
    recoveryPointCount?: number;
  };
};

const DEFAULT_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  forceMfa: false,
  ipProtection: true,
  anomalyDetection: true,
  autoBlock: true,
  sessionTimeoutMinutes: 60,
  maxLoginAttempts: 5,
  auditRetentionDays: 365,
  loginRetentionDays: 180,
  backupFrequency: "DAILY",
  carbonAnalyticsEnabled: true,
  sensorMonitoringEnabled: true,
  aiRecommendationsEnabled: false,
  machineQrEnabled: true,
  reportBuilderEnabled: false,
};

const tabs: Array<{
  id: Tab;
  label: string;
  detail: string;
  icon: ReactNode;
}> = [
  { id: "overview", label: "ศูนย์ควบคุม", detail: "สถานะและการตั้งค่าสำคัญ", icon: <Activity className="h-5 w-5" /> },
  { id: "security", label: "ความปลอดภัย", detail: "นโยบายและการป้องกัน", icon: <ShieldCheck className="h-5 w-5" /> },
  { id: "companies", label: "ควบคุมบริษัท", detail: "ช่วยเหลือและระงับบริษัท", icon: <Building2 className="h-5 w-5" /> },
  { id: "services", label: "บริการระบบ", detail: "ตรวจสอบบริการหลัก", icon: <Server className="h-5 w-5" /> },
  { id: "backup", label: "สำรองและกู้คืน", detail: "Backup และ Retention", icon: <Database className="h-5 w-5" /> },
  { id: "features", label: "Feature Flags", detail: "เปิดหรือปิดฟีเจอร์", icon: <SlidersHorizontal className="h-5 w-5" /> },
];

export default function SystemSettingsPageClient() {
  const [tab, setTab] = useState<Tab>("overview");
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [backupLatest, setBackupLatest] = useState<string | null>(null);
  const [backupSuccessRate, setBackupSuccessRate] = useState(0);
  const [recoveryPointCount, setRecoveryPointCount] = useState(0);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [settingsResponse, companiesResponse, backupResponse] =
        await Promise.all([
          fetch("/api/platform/settings", {
            cache: "no-store",
            credentials: "include",
          }),
          fetch("/api/platform/companies?page=1&pageSize=100", {
            cache: "no-store",
            credentials: "include",
          }),
          fetch("/api/platform/backups", {
            cache: "no-store",
            credentials: "include",
          }),
        ]);

      const settingsResult =
        (await settingsResponse.json()) as SettingsResponse;
      const companiesResult =
        (await companiesResponse.json()) as CompaniesResponse;
      const backupResult =
        (await backupResponse.json()) as BackupResponse;

      if (
        !settingsResponse.ok ||
        !settingsResult.success ||
        !settingsResult.data
      ) {
        throw new Error(
          settingsResult.message ??
            "ไม่สามารถโหลดการตั้งค่าระบบได้",
        );
      }

      setSettings(settingsResult.data);

      if (companiesResponse.ok && companiesResult.success) {
        setCompanies(
          (companiesResult.data ?? []).map((company) => ({
            id: company.id,
            name: company.name,
            users: company.users,
            factories: company.factories,
            status:
              company.status === "SUSPENDED"
                ? "suspended"
                : company.status === "PENDING"
                  ? "warning"
                  : "active",
          })),
        );
      }

      if (backupResponse.ok && backupResult.success) {
        setBackupLatest(
          backupResult.summary?.latestCompletedAt ?? null,
        );
        setBackupSuccessRate(
          backupResult.summary?.successRate ?? 0,
        );
        setRecoveryPointCount(
          backupResult.summary?.recoveryPointCount ?? 0,
        );
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถโหลดข้อมูลได้",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredCompanies = useMemo(() => {
    const value = query.trim().toLowerCase();

    return value
      ? companies.filter((company) =>
          company.name.toLowerCase().includes(value),
        )
      : companies;
  }, [companies, query]);

  const activeCompanies = companies.filter(
    (company) => company.status === "active",
  ).length;

  function updateSetting<K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveSettings() {
    if (busy) return;

    try {
      setBusy("save");
      setError("");

      const response = await fetch("/api/platform/settings", {
        method: "PUT",
        cache: "no-store",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const result = (await response.json()) as SettingsResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message ??
            "ไม่สามารถบันทึกการตั้งค่าระบบได้",
        );
      }

      setSettings(result.data);
      notify(result.message ?? "บันทึกการตั้งค่าแล้ว");
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถบันทึกการตั้งค่าได้";

      setError(message);
      notify(message);
    } finally {
      setBusy(null);
    }
  }

  async function toggleCompany(company: Company) {
    const nextStatus =
      company.status === "suspended"
        ? "ACTIVE"
        : "SUSPENDED";

    try {
      setBusy(`company-${company.id}`);

      const response = await fetch(
        `/api/platform/companies/${company.id}`,
        {
          method: "PATCH",
          cache: "no-store",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "ไม่สามารถเปลี่ยนสถานะบริษัทได้",
        );
      }

      setCompanies((current) =>
        current.map((item) =>
          item.id === company.id
            ? {
                ...item,
                status:
                  nextStatus === "ACTIVE"
                    ? "active"
                    : "suspended",
              }
            : item,
        ),
      );

      notify(
        nextStatus === "ACTIVE"
          ? "เปิดใช้งานบริษัทแล้ว"
          : "ระงับบริษัทแล้ว",
      );
    } catch (caught) {
      notify(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถเปลี่ยนสถานะบริษัทได้",
      );
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[520px] place-items-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-emerald-700" />
          <p className="mt-3 text-sm font-semibold text-slate-600">
            กำลังโหลดการตั้งค่าระบบ
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
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">
              ศูนย์ควบคุมแพลตฟอร์ม
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              จัดการความปลอดภัย บริษัท Backup และ Feature Flags
              จากส่วนกลาง
            </p>
          </div>

          <button
            type="button"
            onClick={() => void saveSettings()}
            disabled={busy === "save"}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-50"
          >
            {busy === "save" ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            บันทึกการตั้งค่า
          </button>
        </header>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="สถานะแพลตฟอร์ม"
            value={
              settings.maintenanceMode
                ? "Maintenance"
                : "Operational"
            }
            detail={
              settings.maintenanceMode
                ? "อยู่ในโหมดบำรุงรักษา"
                : "แพลตฟอร์มเปิดให้บริการ"
            }
            icon={<CheckCircle2 className="h-5 w-5" />}
            tone="emerald"
          />

          <Metric
            label="บริษัทในระบบ"
            value={String(companies.length)}
            detail={`${activeCompanies} บริษัทใช้งานปกติ`}
            icon={<Building2 className="h-5 w-5" />}
            tone="blue"
          />

          <Metric
            label="Recovery Point"
            value={String(recoveryPointCount)}
            detail={
              backupLatest
                ? `ล่าสุด ${backupLatest}`
                : "ยังไม่มีข้อมูลสำรอง"
            }
            icon={<Database className="h-5 w-5" />}
            tone="violet"
          />

          <Metric
            label="ระดับความปลอดภัย"
            value="Protected"
            detail="นโยบายส่วนกลางพร้อมใช้งาน"
            icon={<ShieldCheck className="h-5 w-5" />}
            tone="rose"
          />
        </section>

        <div className="grid gap-5 xl:grid-cols-[285px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm xl:sticky xl:top-5">
            <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Platform Controls
            </p>

            <nav className="space-y-1">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    tab === item.id
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    {item.icon}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-bold">
                      {item.label}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {item.detail}
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="min-w-0">
            {tab === "overview" && (
              <Panel
                title="ภาพรวมสุขภาพแพลตฟอร์ม"
                detail="สถานะรวมจากระบบจริง"
                icon={<Activity className="h-5 w-5" />}
              >
                <div className="grid gap-4 lg:grid-cols-3">
                  <Health title="Application" value="Online" detail="API ตอบสนองอยู่" />
                  <Health title="Database" value="Connected" detail="MySQL/Prisma พร้อมใช้งาน" />
                  <Health title="Backup" value={`${backupSuccessRate}%`} detail="อัตราสำเร็จของ Backup" />
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-bold">Maintenance Mode</p>
                    <p className="mt-1 text-sm text-slate-500">
                      บันทึกลงฐานข้อมูลเมื่อกด Save
                    </p>
                  </div>

                  <Toggle
                    checked={settings.maintenanceMode}
                    onChange={(value) =>
                      updateSetting("maintenanceMode", value)
                    }
                  />
                </div>
              </Panel>
            )}

            {tab === "security" && (
              <div className="space-y-5">
                <Panel
                  title="ระบบป้องกันทั้งแพลตฟอร์ม"
                  detail="นโยบายความปลอดภัยส่วนกลาง"
                  icon={<ShieldCheck className="h-5 w-5" />}
                >
                  <div className="space-y-3">
                    <ToggleRow title="บังคับใช้ MFA" detail="นโยบาย MFA" checked={settings.forceMfa} onChange={(v) => updateSetting("forceMfa", v)} />
                    <ToggleRow title="IP Reputation Protection" detail="ป้องกัน IP เสี่ยง" checked={settings.ipProtection} onChange={(v) => updateSetting("ipProtection", v)} />
                    <ToggleRow title="Anomaly Detection" detail="ตรวจจับพฤติกรรมผิดปกติ" checked={settings.anomalyDetection} onChange={(v) => updateSetting("anomalyDetection", v)} />
                    <ToggleRow title="Auto Block" detail="บล็อกภัยคุกคามอัตโนมัติ" checked={settings.autoBlock} onChange={(v) => updateSetting("autoBlock", v)} />
                  </div>
                </Panel>

                <Panel
                  title="Session และ Login"
                  detail="ค่าความปลอดภัยที่บันทึกใน SystemSetting"
                  icon={<Wrench className="h-5 w-5" />}
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <NumberField
                      label="Session Timeout"
                      value={settings.sessionTimeoutMinutes}
                      suffix="นาที"
                      onChange={(v) =>
                        updateSetting("sessionTimeoutMinutes", v)
                      }
                    />
                    <NumberField
                      label="Login ผิดสูงสุด"
                      value={settings.maxLoginAttempts}
                      suffix="ครั้ง"
                      onChange={(v) =>
                        updateSetting("maxLoginAttempts", v)
                      }
                    />
                  </div>
                </Panel>
              </div>
            )}

            {tab === "companies" && (
              <Panel
                title="ควบคุมบริษัท"
                detail="ดึงข้อมูลจาก company จริง"
                icon={<Building2 className="h-5 w-5" />}
              >
                <div className="relative mb-5 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ค้นหาชื่อบริษัท..."
                    className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm"
                  />
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[760px]">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">บริษัท</th>
                        <th className="px-4 py-3">ผู้ใช้</th>
                        <th className="px-4 py-3">โรงงาน</th>
                        <th className="px-4 py-3">สถานะ</th>
                        <th className="px-4 py-3 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredCompanies.map((company) => (
                        <tr key={company.id} className="text-sm">
                          <td className="px-4 py-4 font-bold">{company.name}</td>
                          <td className="px-4 py-4">{company.users}</td>
                          <td className="px-4 py-4">{company.factories}</td>
                          <td className="px-4 py-4"><CompanyBadge status={company.status} /></td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => void toggleCompany(company)}
                              disabled={busy === `company-${company.id}`}
                              className={`rounded-lg px-3 py-2 text-xs font-bold ${
                                company.status === "suspended"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {company.status === "suspended"
                                ? "เปิดใช้งาน"
                                : "ระงับบริษัท"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}

            {tab === "services" && (
              <Panel
                title="บริการระบบ"
                detail="แสดงสถานะของบริการที่หน้านี้เชื่อมต่อจริง"
                icon={<Server className="h-5 w-5" />}
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  <ServiceCard title="Core API" detail="/api/platform/settings" />
                  <ServiceCard title="Primary Database" detail="MySQL + Prisma" />
                  <ServiceCard title="Backup Service" detail="mysqldump + backup_record" />
                  <ServiceCard title="Session Service" detail="JWT + HttpOnly Cookie" />
                </div>

                <button
                  onClick={() => void loadData()}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
                >
                  <RefreshCw className="h-4 w-4" />
                  ตรวจสอบใหม่
                </button>
              </Panel>
            )}

            {tab === "backup" && (
              <Panel
                title="Backup และ Retention"
                detail="นโยบายเก็บ Log และลิงก์ไป Backup จริง"
                icon={<Database className="h-5 w-5" />}
              >
                <div className="grid gap-5 md:grid-cols-3">
                  <label>
                    <span className="mb-2 block text-sm font-bold">
                      ความถี่การสำรอง
                    </span>
                    <select
                      value={settings.backupFrequency}
                      onChange={(e) =>
                        updateSetting("backupFrequency", e.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-4"
                    >
                      <option value="DAILY">ทุกวัน</option>
                      <option value="WEEKLY">ทุกสัปดาห์</option>
                      <option value="MONTHLY">ทุกเดือน</option>
                    </select>
                  </label>

                  <NumberField
                    label="เก็บ Audit Log"
                    value={settings.auditRetentionDays}
                    suffix="วัน"
                    onChange={(v) =>
                      updateSetting("auditRetentionDays", v)
                    }
                  />

                  <NumberField
                    label="เก็บ Login Log"
                    value={settings.loginRetentionDays}
                    suffix="วัน"
                    onChange={(v) =>
                      updateSetting("loginRetentionDays", v)
                    }
                  />
                </div>

                <Link
                  href="/platform/backups"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white"
                >
                  เปิด Backup & Recovery
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Panel>
            )}

            {tab === "features" && (
              <Panel
                title="Feature Flags"
                detail="ค่าบันทึกจริงลง SystemSetting"
                icon={<SlidersHorizontal className="h-5 w-5" />}
              >
                <div className="space-y-3">
                  <ToggleRow title="Carbon Analytics" detail="วิเคราะห์คาร์บอน" checked={settings.carbonAnalyticsEnabled} onChange={(v) => updateSetting("carbonAnalyticsEnabled", v)} />
                  <ToggleRow title="Sensor Monitoring" detail="ติดตามเซนเซอร์" checked={settings.sensorMonitoringEnabled} onChange={(v) => updateSetting("sensorMonitoringEnabled", v)} />
                  <ToggleRow title="AI Recommendations" detail="คำแนะนำจาก AI" checked={settings.aiRecommendationsEnabled} onChange={(v) => updateSetting("aiRecommendationsEnabled", v)} />
                  <ToggleRow title="Machine QR" detail="เข้าถึงเครื่องจักรผ่าน QR" checked={settings.machineQrEnabled} onChange={(v) => updateSetting("machineQrEnabled", v)} />
                  <ToggleRow title="New Report Builder" detail="เครื่องมือรายงานเวอร์ชันทดลอง" checked={settings.reportBuilderEnabled} onChange={(v) => updateSetting("reportBuilderEnabled", v)} />
                </div>
              </Panel>
            )}
          </main>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function Panel({ title, detail, icon, children }: { title: string; detail: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</span>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Metric({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: ReactNode; tone: "emerald" | "blue" | "violet" | "rose" }) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    rose: "bg-rose-50 text-rose-600",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{detail}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}>{icon}</span>
      </div>
    </div>
  );
}

function Health({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function ServiceCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex justify-between gap-4">
        <div>
          <p className="font-bold">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
        <span className="h-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          Healthy
        </span>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-emerald-600" : "bg-slate-300"
      }`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
        checked ? "left-6" : "left-1"
      }`} />
    </button>
  );
}

function ToggleRow({ title, detail, checked, onChange }: { title: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl border border-slate-200 p-4">
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function NumberField({ label, value, suffix, onChange }: { label: string; value: number; suffix: string; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <div className="relative">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-11 w-full rounded-xl border border-slate-200 px-4 pr-16 text-sm"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>
      </div>
    </label>
  );
}

function CompanyBadge({ status }: { status: CompanyStatus }) {
  const config = {
    active: ["ใช้งานปกติ", "bg-emerald-50 text-emerald-700"],
    warning: ["รอตรวจสอบ", "bg-amber-50 text-amber-700"],
    suspended: ["ถูกระงับ", "bg-rose-50 text-rose-700"],
  }[status];

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${config[1]}`}>
      {config[0]}
    </span>
  );
}