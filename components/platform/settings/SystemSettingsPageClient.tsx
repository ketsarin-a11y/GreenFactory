"use client";

import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Database,
  RefreshCw,
  Save,
  Search,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wrench,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

type Tab = "overview" | "security" | "companies" | "services" | "backup" | "features";
type CompanyStatus = "active" | "warning" | "suspended";
type ServiceStatus = "healthy" | "warning" | "offline";

type Company = {
  id: number;
  name: string;
  users: number;
  factories: number;
  status: CompanyStatus;
};

type Service = {
  id: string;
  name: string;
  detail: string;
  status: ServiceStatus;
  response: string;
};

type FeatureFlag = {
  id: string;
  name: string;
  detail: string;
  enabled: boolean;
};

const companiesSeed: Company[] = [
  { id: 1, name: "Siam Advanced Manufacturing", users: 128, factories: 4, status: "active" },
  { id: 2, name: "Eastern Electronics", users: 76, factories: 2, status: "warning" },
  { id: 3, name: "Metro Industrial Group", users: 45, factories: 1, status: "active" },
  { id: 4, name: "North Green Components", users: 31, factories: 1, status: "suspended" },
];

const servicesSeed: Service[] = [
  { id: "api", name: "Core API", detail: "บริการหลักของแพลตฟอร์ม", status: "healthy", response: "82 ms" },
  { id: "database", name: "Primary Database", detail: "ฐานข้อมูลของทุกบริษัท", status: "healthy", response: "24 ms" },
  { id: "storage", name: "File Storage", detail: "เอกสาร รายงาน และไฟล์แนบ", status: "warning", response: "214 ms" },
  { id: "email", name: "Email Gateway", detail: "อีเมลแจ้งเตือนและรีเซ็ตรหัสผ่าน", status: "healthy", response: "116 ms" },
  { id: "sensor", name: "Sensor Gateway", detail: "ข้อมูลจากเครื่องจักรและเซนเซอร์", status: "healthy", response: "64 ms" },
  { id: "queue", name: "Background Jobs", detail: "งานประมวลผลเบื้องหลัง", status: "healthy", response: "41 ms" },
];

const featureSeed: FeatureFlag[] = [
  { id: "carbon", name: "Carbon Analytics", detail: "วิเคราะห์การปล่อยคาร์บอน", enabled: true },
  { id: "sensor", name: "Sensor Monitoring", detail: "ติดตามข้อมูลเซนเซอร์", enabled: true },
  { id: "ai", name: "AI Recommendations", detail: "คำแนะนำด้านพลังงาน", enabled: false },
  { id: "qr", name: "Machine QR", detail: "เข้าถึงเครื่องจักรผ่าน QR", enabled: true },
  { id: "report", name: "New Report Builder", detail: "เครื่องมือรายงานเวอร์ชันทดลอง", enabled: false },
];

const tabs: Array<{ id: Tab; label: string; detail: string; icon: ReactNode }> = [
  { id: "overview", label: "ศูนย์ควบคุม", detail: "สถานะและเหตุการณ์สำคัญ", icon: <Activity className="h-5 w-5" /> },
  { id: "security", label: "ความปลอดภัย", detail: "นโยบายและการป้องกัน", icon: <ShieldCheck className="h-5 w-5" /> },
  { id: "companies", label: "ควบคุมบริษัท", detail: "ช่วยเหลือและระงับบริษัท", icon: <Building2 className="h-5 w-5" /> },
  { id: "services", label: "บริการระบบ", detail: "ตรวจสอบและกู้คืนบริการ", icon: <Server className="h-5 w-5" /> },
  { id: "backup", label: "สำรองและกู้คืน", detail: "Backup และ Retention", icon: <Database className="h-5 w-5" /> },
  { id: "features", label: "Feature Flags", detail: "เปิดหรือปิดฟีเจอร์", icon: <SlidersHorizontal className="h-5 w-5" /> },
];

export default function SystemSettingsPageClient() {
  const [tab, setTab] = useState<Tab>("overview");
  const [maintenance, setMaintenance] = useState(false);
  const [forceMfa, setForceMfa] = useState(false);
  const [ipProtection, setIpProtection] = useState(true);
  const [anomalyDetection, setAnomalyDetection] = useState(true);
  const [autoBlock, setAutoBlock] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [maxLogin, setMaxLogin] = useState(5);
  const [auditDays, setAuditDays] = useState(365);
  const [loginDays, setLoginDays] = useState(180);
  const [backupFrequency, setBackupFrequency] = useState("DAILY");
  const [companies, setCompanies] = useState(companiesSeed);
  const [services, setServices] = useState(servicesSeed);
  const [features, setFeatures] = useState(featureSeed);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const filteredCompanies = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? companies.filter((c) => c.name.toLowerCase().includes(value)) : companies;
  }, [companies, query]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function run(id: string, message: string, callback?: () => void) {
    setBusy(id);
    window.setTimeout(() => {
      callback?.();
      setBusy(null);
      notify(message);
    }, 650);
  }

  function suspendCompany(id: number) {
    setCompanies((current) =>
      current.map((company) =>
        company.id === id
          ? { ...company, status: company.status === "suspended" ? "active" : "suspended" }
          : company,
      ),
    );
    notify("อัปเดตสถานะบริษัทเรียบร้อยแล้ว");
  }

  function restartService(id: string) {
    run(`service-${id}`, "กู้คืนบริการเรียบร้อยแล้ว", () =>
      setServices((current) =>
        current.map((service) =>
          service.id === id ? { ...service, status: "healthy", response: "58 ms" } : service,
        ),
      ),
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
            <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">ศูนย์ควบคุมแพลตฟอร์ม</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              จัดการความปลอดภัย ช่วยเหลือทุกบริษัท ตรวจสอบบริการ สำรองข้อมูล และควบคุมฟีเจอร์ส่วนกลาง
            </p>
          </div>
          <button
            type="button"
            onClick={() => run("save", "บันทึกการตั้งค่าทั้งระบบเรียบร้อยแล้ว")}
            disabled={busy === "save"}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-50"
          >
            {busy === "save" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            บันทึกการตั้งค่า
          </button>
        </header>

        <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="สถานะแพลตฟอร์ม" value={maintenance ? "Maintenance" : "Operational"} detail={maintenance ? "กำลังปิดปรับปรุง" : "ทุกบริการพร้อมใช้งาน"} icon={<CheckCircle2 className="h-5 w-5" />} tone="emerald" />
          <Metric label="บริษัทในระบบ" value={String(companies.length)} detail={`${companies.filter((c) => c.status === "active").length} บริษัทใช้งานปกติ`} icon={<Building2 className="h-5 w-5" />} tone="blue" />
          <Metric label="บริการพร้อมใช้" value={`${services.filter((s) => s.status === "healthy").length}/${services.length}`} detail="ติดตามจากศูนย์กลาง" icon={<Server className="h-5 w-5" />} tone="violet" />
          <Metric label="ระดับความปลอดภัย" value="Protected" detail="ระบบป้องกันภัยเปิดใช้งาน" icon={<ShieldCheck className="h-5 w-5" />} tone="rose" />
        </section>

        <div className="grid gap-5 xl:grid-cols-[285px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm xl:sticky xl:top-5">
            <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Platform Controls</p>
            <nav className="space-y-1">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    tab === item.id ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tab === item.id ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{item.label}</span>
                    <span className="block truncate text-xs text-slate-400">{item.detail}</span>
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="min-w-0">
            {tab === "overview" && (
              <Panel title="ภาพรวมสุขภาพแพลตฟอร์ม" detail="มุมมองรวมสำหรับตรวจสอบและตัดสินใจแก้ไขปัญหา" icon={<Activity className="h-5 w-5" />}>
                <div className="grid gap-4 lg:grid-cols-3">
                  <Health title="Core Services" value={`${services.filter((s) => s.status === "healthy").length}/${services.length}`} detail="บริการพร้อมใช้งาน" />
                  <Health title="Security Events" value="0 Critical" detail="ไม่พบเหตุการณ์ร้ายแรง" />
                  <Health title="Average Response" value="86 ms" detail="อยู่ในเกณฑ์ปกติ" />
                </div>
                <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold">{maintenance ? "ระบบอยู่ในโหมดบำรุงรักษา" : "แพลตฟอร์มเปิดให้บริการตามปกติ"}</p>
                    <p className="mt-1 text-sm text-slate-500">Platform Admin ยังสามารถเข้าถึงระบบได้ระหว่างการบำรุงรักษา</p>
                  </div>
                  <Toggle checked={maintenance} onChange={setMaintenance} />
                </div>
              </Panel>
            )}

            {tab === "security" && (
              <div className="space-y-5">
                <Panel title="ระบบป้องกันทั้งแพลตฟอร์ม" detail="นโยบายเหล่านี้มีผลกับผู้ใช้ทุกบริษัท" icon={<ShieldCheck className="h-5 w-5" />}>
                  <div className="space-y-3">
                    <ToggleRow title="บังคับใช้ MFA" detail="ผู้ใช้ทุกคนต้องยืนยันตัวตนขั้นที่สอง" checked={forceMfa} onChange={setForceMfa} />
                    <ToggleRow title="IP Reputation Protection" detail="ป้องกัน IP ที่มีความเสี่ยง" checked={ipProtection} onChange={setIpProtection} />
                    <ToggleRow title="Anomaly Detection" detail="ตรวจจับพฤติกรรมที่ผิดปกติ" checked={anomalyDetection} onChange={setAnomalyDetection} />
                    <ToggleRow title="บล็อกภัยคุกคามอัตโนมัติ" detail="ระงับ Session ที่เข้าเกณฑ์อันตราย" checked={autoBlock} onChange={setAutoBlock} />
                  </div>
                </Panel>
                <Panel title="Session และการเข้าสู่ระบบ" detail="กำหนดขอบเขตเพื่อลดความเสี่ยง" icon={<Wrench className="h-5 w-5" />}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <NumberField label="Session Timeout" value={sessionTimeout} suffix="นาที" onChange={setSessionTimeout} />
                    <NumberField label="Login ผิดสูงสุด" value={maxLogin} suffix="ครั้ง" onChange={setMaxLogin} />
                  </div>
                  <button type="button" onClick={() => run("logout", "ยกเลิก Session ของผู้ใช้ทั้งหมดแล้ว")} className="mt-5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700">
                    Force Logout ทั้งระบบ
                  </button>
                </Panel>
              </div>
            )}

            {tab === "companies" && (
              <Panel title="ควบคุมและช่วยเหลือทุกบริษัท" detail="ตรวจสอบ ระงับ หรือช่วยกู้บัญชีผู้ดูแลบริษัท" icon={<Building2 className="h-5 w-5" />}>
                <div className="relative mb-5 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาชื่อบริษัท..." className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-emerald-500" />
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="min-w-[760px] w-full">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                      <tr><th className="px-4 py-3">บริษัท</th><th className="px-4 py-3">ผู้ใช้</th><th className="px-4 py-3">โรงงาน</th><th className="px-4 py-3">สถานะ</th><th className="px-4 py-3 text-right">จัดการ</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredCompanies.map((company) => (
                        <tr key={company.id} className="text-sm">
                          <td className="px-4 py-4 font-bold">{company.name}</td>
                          <td className="px-4 py-4 text-slate-600">{company.users}</td>
                          <td className="px-4 py-4 text-slate-600">{company.factories}</td>
                          <td className="px-4 py-4"><CompanyBadge status={company.status} /></td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => run(`reset-${company.id}`, `ส่งคำขอรีเซ็ตรหัสผ่านให้ ${company.name} แล้ว`)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">รีเซ็ต Admin</button>
                              <button type="button" onClick={() => suspendCompany(company.id)} className={`rounded-lg px-3 py-2 text-xs font-bold ${company.status === "suspended" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                {company.status === "suspended" ? "เปิดใช้งาน" : "ระงับบริษัท"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}

            {tab === "services" && (
              <Panel title="บริการและโครงสร้างพื้นฐาน" detail="ตรวจสอบและกู้คืนบริการจากศูนย์กลาง" icon={<Server className="h-5 w-5" />}>
                <div className="grid gap-4 lg:grid-cols-2">
                  {services.map((service) => (
                    <div key={service.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="font-bold">{service.name}</p><p className="mt-1 text-sm text-slate-500">{service.detail}</p></div>
                        <ServiceBadge status={service.status} />
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-xs font-semibold text-slate-400">Response {service.response}</span>
                        <button type="button" onClick={() => restartService(service.id)} disabled={busy === `service-${service.id}`} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-50">
                          <RefreshCw className={`h-3.5 w-3.5 ${busy === `service-${service.id}` ? "animate-spin" : ""}`} /> Restart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {tab === "backup" && (
              <Panel title="การสำรองข้อมูลและ Recovery" detail="กำหนดรอบสำรองและเรียกใช้คำสั่งฉุกเฉิน" icon={<Database className="h-5 w-5" />}>
                <div className="grid gap-5 md:grid-cols-3">
                  <label><span className="mb-2 block text-sm font-bold">ความถี่การสำรอง</span><select value={backupFrequency} onChange={(e) => setBackupFrequency(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"><option value="DAILY">ทุกวัน</option><option value="WEEKLY">ทุกสัปดาห์</option><option value="MONTHLY">ทุกเดือน</option></select></label>
                  <NumberField label="เก็บ Audit Log" value={auditDays} suffix="วัน" onChange={setAuditDays} />
                  <NumberField label="เก็บ Login Log" value={loginDays} suffix="วัน" onChange={setLoginDays} />
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => run("backup", "สำรองข้อมูลระบบเรียบร้อยแล้ว")} className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white">สำรองข้อมูลตอนนี้</button>
                  <button type="button" onClick={() => run("restore", "เริ่มกระบวนการกู้คืนข้อมูลแล้ว")} className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white">เริ่มกู้คืนข้อมูล</button>
                </div>
              </Panel>
            )}

            {tab === "features" && (
              <Panel title="Feature Flags ทั้งแพลตฟอร์ม" detail="ควบคุมการเปิดหรือปิดฟีเจอร์สำหรับทุกบริษัท" icon={<SlidersHorizontal className="h-5 w-5" />}>
                <div className="space-y-3">
                  {features.map((feature) => (
                    <ToggleRow key={feature.id} title={feature.name} detail={feature.detail} checked={feature.enabled} onChange={() => setFeatures((current) => current.map((item) => item.id === feature.id ? { ...item, enabled: !item.enabled } : item))} />
                  ))}
                </div>
              </Panel>
            )}
          </main>
        </div>
      </div>

      {toast && <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-2xl">{toast}</div>}
    </div>
  );
}

function Panel({ title, detail, icon, children }: { title: string; detail: string; icon: ReactNode; children: ReactNode }) {
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-start gap-3 border-b border-slate-200 px-5 py-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</span><div><h2 className="text-lg font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">{detail}</p></div></div><div className="p-5 sm:p-6">{children}</div></section>;
}

function Metric({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: ReactNode; tone: "emerald" | "blue" | "violet" | "rose" }) {
  const toneClass = { emerald: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600", rose: "bg-rose-50 text-rose-600" }[tone];
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-4"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}>{icon}</span></div></div>;
}

function Health({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-emerald-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} /></button>;
}

function ToggleRow({ title, detail, checked, onChange }: { title: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-5 rounded-xl border border-slate-200 p-4"><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-sm text-slate-500">{detail}</p></div><Toggle checked={checked} onChange={onChange} /></div>;
}

function NumberField({ label, value, suffix, onChange }: { label: string; value: number; suffix: string; onChange: (value: number) => void }) {
  return <label><span className="mb-2 block text-sm font-bold">{label}</span><div className="relative"><input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="h-11 w-full rounded-xl border border-slate-200 px-4 pr-16 text-sm" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span></div></label>;
}

function CompanyBadge({ status }: { status: CompanyStatus }) {
  const config = { active: ["ใช้งานปกติ", "bg-emerald-50 text-emerald-700"], warning: ["ต้องตรวจสอบ", "bg-amber-50 text-amber-700"], suspended: ["ถูกระงับ", "bg-rose-50 text-rose-700"] }[status];
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${config[1]}`}>{config[0]}</span>;
}

function ServiceBadge({ status }: { status: ServiceStatus }) {
  const config = { healthy: ["Healthy", "bg-emerald-50 text-emerald-700"], warning: ["Warning", "bg-amber-50 text-amber-700"], offline: ["Offline", "bg-rose-50 text-rose-700"] }[status];
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${config[1]}`}>{config[0]}</span>;
}
