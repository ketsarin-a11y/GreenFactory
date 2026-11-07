import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Factory, Minus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { InstrumentBand } from "@/components/data/instrument-band";
import { EmptyState } from "@/components/data/empty-state";
import { Gauge } from "@/components/data/meter";
import { Nameplate } from "@/components/data/nameplate";
import { RECORD_STATUS, Status } from "@/components/data/status-badge";
import { Readiness } from "@/components/company/readiness";
import { requireTenantUser } from "@/server/auth/current-user";
import { ROLE_LABEL, isRole } from "@/server/auth/roles";
import { companyDashboard } from "@/server/queries/company/dashboard";
import { fmtCarbon, fmtNum, fmtPct } from "@/lib/format";
import { fmtDate, fmtDateTime, startOfBkkDay } from "@/lib/time";
import { cn } from "@/lib/utils";
import { FactoryTrend } from "./_components/factory-trend";

const MAX_FACTORIES = 4;

/** Delta with icon + text, colored by meaning (down is good for energy and carbon). */
function Delta({ change }: { change: number | null }) {
  if (change === null) return <span className="text-xs text-muted-foreground">ไม่มีข้อมูลเทียบ</span>;
  const Icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium tabular", change < 0 && "text-[#0a7d0a] dark:text-status-good", change > 0 && "text-status-critical")}>
      <Icon className="size-3.5" aria-hidden />{fmtPct(change)}
    </span>
  );
}

function ShareBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="mt-1.5 h-1.5 rounded-full bg-muted" aria-hidden>
      <div className="h-1.5 rounded-full" style={{ width: `${max > 0 ? Math.max(2, (value / max) * 100) : 0}%`, background: color }} />
    </div>
  );
}

export default async function Page() {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const d = await companyDashboard(user);
  const e = d.energy;
  const carbon = fmtCarbon(e.carbon.totalKg);
  const range = `${fmtDate(startOfBkkDay(e.from))} – ${fmtDate(startOfBkkDay(e.to))}`;

  const readinessById = new Map(d.factories.map((f) => [f.id, f]));
  const compared = [...e.factories].sort((a, b) => b.kwh - a.kwh).slice(0, MAX_FACTORIES).sort((a, b) => a.code.localeCompare(b.code));
  const color = new Map(compared.map((f, i) => [f.id, `var(--chart-${i + 1})`]));
  const maxKwh = Math.max(0, ...compared.map((f) => f.kwhPerDay));
  const maxCarbon = Math.max(0, ...compared.map((f) => f.carbonKg));
  // Change over the trend run (first vs last 7-day average) per factory; the biggest mover goes in the caption.
  const runChange = compared.map((f) => {
    const xs = e.trend.byFactory.get(f.id) ?? [];
    return { f, change: xs.length > 14 && xs[0] > 0 ? ((xs[xs.length - 1] - xs[0]) / xs[0]) * 100 : null };
  });
  const mover = runChange.filter((x) => x.change !== null).sort((a, b) => Math.abs(b.change!) - Math.abs(a.change!))[0];
  const trendSpan = e.trend.days.length;

  const todo = [
    { label: "เครื่องจักรที่ยังไม่มีเซนเซอร์", n: d.machines.noSensor, href: "/company/machines?setup=no-sensor" },
    { label: "เครื่องจักรที่ยังไม่มี QR Code", n: d.machines.noQr, href: "/company/machines?setup=no-qr" },
    { label: "ผู้ใช้ที่ยังไม่ระบุโรงงาน", n: d.users.noFactory, href: "/company/users?setup=no-factory" },
    { label: "ผู้ปฏิบัติงานที่ยังไม่ระบุแผนก", n: d.users.operatorNoDept, href: "/company/users?setup=no-department" },
  ];
  const open = todo.filter((t) => t.n > 0);
  const offline = d.sensors.OFFLINE + d.sensors.FAULT;

  return (
    <>
      <PageHeader title="ภาพรวมบริษัท" description={`${user.companyName ?? "บริษัท"} ${d.factories.length} โรงงาน ข้อมูล 30 วันเต็มล่าสุด ${range}`} />

      <InstrumentBand
        live={d.sensors.ONLINE > 0 && d.lastReadingAt ? `เซนเซอร์ส่งข้อมูลล่าสุด ${fmtDateTime(d.lastReadingAt)}` : undefined}
        readings={[
          { label: "ไฟฟ้ารวมทั้งบริษัท 30 วัน", value: fmtNum(e.elec.total, 0), unit: "kWh", change: e.elec.change, goodWhen: "down", spark: e.elec.daily, note: "เทียบ 30 วันก่อนหน้า", href: "/company/usage" },
          { label: "คาร์บอน 30 วัน", value: carbon.value, unit: carbon.unit, change: e.carbon.change, goodWhen: "down", spark: e.carbon.daily, note: "เทียบ 30 วันก่อนหน้า", href: "/company/reports" },
          { label: "ความพร้อมของระบบ", value: fmtNum(d.readiness.score, 0), unit: "%", note: open.length ? `ค้างตั้งค่า ${open.length} เรื่อง` : "ตั้งค่าครบแล้ว" },
          { label: "เซนเซอร์ออนไลน์", value: `${fmtNum(d.sensors.ONLINE)}/${fmtNum(d.sensors.total)}`, unit: "ตัว", note: offline ? `ขาดการเชื่อมต่อหรือผิดปกติ ${fmtNum(offline)} ตัว` : d.sensors.total ? "ทุกตัวส่งข้อมูลปกติ" : "ยังไม่มีเซนเซอร์", href: "/company/sensors" },
        ]}
      />

      <section aria-labelledby="compare" className="mb-8">
        <h2 id="compare" className="mb-1 text-lg font-semibold">เทียบโรงงาน</h2>
        <p className="mb-4 text-sm text-muted-foreground">ไฟฟ้า (kWh) และคาร์บอนของแต่ละโรงงานในช่วงเดียวกัน</p>
        {d.factories.length === 0 ? (
          <EmptyState icon={Factory} title="ยังไม่มีโรงงาน" description="เพิ่มโรงงานแรกเพื่อเริ่มตั้งค่าโครงสร้างและเครื่องจักร" action={<Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href="/company/factories">ไปที่หน้าโรงงาน</Link>} />
        ) : (
          <div className="grid gap-4">
            {e.hasData ? (
              <FactoryTrend
                days={e.trend.days}
                factories={compared.map((f) => ({ key: `f${f.id}`, label: f.name, color: color.get(f.id)!, daily: e.trend.byFactory.get(f.id) ?? [] }))}
                caption={
                  mover
                    ? `${mover.f.name}ใช้ไฟฟ้าต่อวัน${mover.change! < 0 ? "ลดลง" : "เพิ่มขึ้น"} ${fmtNum(Math.abs(mover.change!), 1)}% ในรอบ ${trendSpan} วัน เส้นกราฟเป็นค่าเฉลี่ย 7 วัน`
                    : `ค่าเฉลี่ย 7 วันย้อนหลัง ${trendSpan} วัน`
                }
              />
            ) : (
              <EmptyState icon={Factory} title="ยังไม่มีข้อมูลการใช้ไฟฟ้า" description="ข้อมูลจะขึ้นที่นี่เมื่อผู้ปฏิบัติงานสแกน QR บันทึกค่ามิเตอร์ หรือเซนเซอร์เริ่มส่งข้อมูล" />
            )}

            <div className="rounded-[10px] border bg-card">
              <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_120px] gap-6 border-b px-5 py-2.5 text-xs text-muted-foreground md:grid">
                <span>โรงงาน</span><span>ไฟฟ้าเฉลี่ยต่อวัน</span><span>คาร์บอน 30 วัน</span><span className="text-center">ความพร้อม</span>
              </div>
              <ul className="divide-y">
                {d.factories.map((rf) => {
                  const f = e.factories.find((x) => x.id === rf.id);
                  const c = fmtCarbon(f?.carbonKg ?? 0);
                  const r = readinessById.get(rf.id)!;
                  const swatch = color.get(rf.id) ?? "var(--muted-foreground)";
                  return (
                    <li key={rf.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-4 px-5 py-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_120px]">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2">
                          <span className="size-2.5 shrink-0 rounded-sm" style={{ background: swatch }} aria-hidden />
                          <span className="font-medium">{rf.name}</span>
                          <Nameplate>{rf.code}</Nameplate>
                          {rf.status !== "ACTIVE" && <Status map={RECORD_STATUS} value={rf.status} />}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground tabular">
                          เครื่องจักร {fmtNum(rf.machines)} เครื่อง มีเซนเซอร์ {fmtNum(rf.machinesWithSensor)} มี QR {fmtNum(rf.machinesWithQr)}
                        </p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-xs text-muted-foreground md:hidden">ไฟฟ้าเฉลี่ยต่อวัน</p>
                        <p className="flex items-baseline justify-between gap-2">
                          <span><span className="font-display text-xl font-semibold tabular">{fmtNum(f?.kwhPerDay ?? 0, 0)}</span> <span className="text-xs text-muted-foreground">kWh/วัน</span></span>
                          {f && <Delta change={f.kwhChange} />}
                        </p>
                        <ShareBar value={f?.kwhPerDay ?? 0} max={maxKwh} color={swatch} />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-xs text-muted-foreground md:hidden">คาร์บอน 30 วัน</p>
                        <p className="flex items-baseline justify-between gap-2">
                          <span><span className="font-display text-xl font-semibold tabular">{c.value}</span> <span className="text-xs text-muted-foreground">{c.unit}</span></span>
                          {f && <Delta change={f.carbonChange} />}
                        </p>
                        <ShareBar value={f?.carbonKg ?? 0} max={maxCarbon} color="var(--muted-foreground)" />
                      </div>
                      <div className="col-start-2 row-start-1 flex justify-center md:col-start-auto md:row-start-auto">
                        <Gauge percent={r.readiness} label={r.readiness >= 75 ? "พร้อม" : r.readiness >= 40 ? "ต้องเพิ่ม" : "เริ่มต้น"} size={112}
                          tone={r.readiness >= 75 ? "primary" : r.readiness >= 40 ? "warning" : "critical"} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="todo">
          <h2 id="todo" className="mb-2 font-semibold">ต้องตั้งค่าเพิ่ม</h2>
          {open.length === 0 ? (
            <p className="flex items-center gap-2 border-t py-3 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-status-good" aria-hidden />ตั้งค่าครบแล้ว ไม่มีรายการค้าง</p>
          ) : (
            <ul className="divide-y border-y">
              {open.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-primary">
                    <span>{t.label}</span>
                    <span className="font-display font-semibold tabular">{fmtNum(t.n)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <h3 className="mt-6 mb-2 text-sm font-semibold">คะแนนความพร้อมรายด้าน</h3>
          <ul className="space-y-2.5 border-t pt-3">
            {d.readiness.parts.map((p) => (
              <li key={p.key}>
                <p className="mb-1 flex justify-between gap-2 text-xs"><span>{p.label}</span><span className="text-muted-foreground">น้ำหนัก {p.weight * 100}%</span></p>
                <Readiness score={p.score} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="gov">
          <h2 id="gov" className="mb-2 font-semibold">การกำกับดูแลบัญชี</h2>
          <dl className="divide-y border-y text-sm">
            {([
              ["บัญชีที่ใช้งานอยู่", `${fmtNum(d.users.active)} จาก ${fmtNum(d.users.total)}`],
              ["ผู้จัดการโรงงาน", fmtNum(d.users.managers)],
              ["ผู้ปฏิบัติงาน", fmtNum(d.users.operators)],
              ["บัญชีที่ไม่ได้ใช้งาน", fmtNum(d.users.inactive)],
              ["ยังไม่ระบุโรงงานหรือแผนก", fmtNum(d.users.noFactory + d.users.operatorNoDept)],
            ] as const).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium tabular">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="latest">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 id="latest" className="font-semibold">ผู้ใช้ที่เพิ่มล่าสุด</h2>
            <Link href="/company/users" className="text-sm text-primary underline-offset-4 hover:underline">ดูทั้งหมด</Link>
          </div>
          <ul className="divide-y border-y">
            {d.latestUsers.map((u) => (
              <li key={u.userId} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{u.firstName} {u.lastName}</span>
                  <span className="block text-xs text-muted-foreground">{isRole(u.role.roleName) ? ROLE_LABEL[u.role.roleName] : u.role.roleName}</span>
                  <span className="block text-xs text-muted-foreground">{u.factory?.factoryName ?? "ยังไม่ระบุโรงงาน"}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
                  {u.status !== "ACTIVE" ? <Status map={RECORD_STATUS} value={u.status} /> : null}
                  {fmtDate(u.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
