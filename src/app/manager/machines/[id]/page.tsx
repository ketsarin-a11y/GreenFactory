import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Sparkline } from "@/components/data/sparkline";
import { Nameplate } from "@/components/data/nameplate";
import { Meta, Panel } from "@/components/manager/panel";
import { TrendChart } from "@/components/data/trend-chart";
import { ALERT_STATUS, CONNECTION, MACHINE_STATUS, QR_STATUS, SEVERITY, Status } from "@/components/data/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtRange, fmtTime, SOURCE_LABEL } from "@/components/manager/format";
import { fmtNum } from "@/lib/format";
import { fmtDate, fmtDateTime } from "@/lib/time";
import { resourceColor, resourceIcon } from "@/lib/resources";
import { requireTenantUser } from "@/server/auth/current-user";
import { getMachine, normMachineStatus } from "@/server/queries/manager/machines";

const None = ({ text }: { text: string }) => <p className="py-4 text-center text-sm text-muted-foreground">{text}</p>;

export default async function Page({ params }: PageProps<"/manager/machines/[id]">) {
  const user = await requireTenantUser("MANAGER");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const d = await getMachine(user, id);
  if (!d) notFound();
  const m = d.machine;
  const line = m.productionLine, dep = line.department, b = dep.building;
  const facts: [string, string][] = [
    ["ประเภท", m.machineType.machineTypeName], ["ผู้ผลิต / รุ่น", [m.manufacturer, m.model].filter(Boolean).join(" ") || "—"],
    ["หมายเลขเครื่อง", m.serialNumber ?? "—"], ["วันที่ติดตั้ง", m.installationDate ? fmtDate(m.installationDate) : "—"],
    ["อาคาร", b.buildingName], ["ไลน์ผลิต", line.lineName], ["หมายเหตุตำแหน่ง", m.locationNote ?? "—"],
  ];

  return (
    <>
      <Link href="/manager/machines" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" aria-hidden />เครื่องจักรทั้งหมด</Link>
      <PageHeader
        title={m.machineName}
        description={<Meta factory={b.factory.factoryName}><Nameplate>{m.machineCode}</Nameplate><span>{m.machineType.machineTypeName}</span><span>{dep.departmentName}</span></Meta>}
        actions={<Status map={MACHINE_STATUS} value={normMachineStatus(m.operationalStatus)} />}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Panel title="การใช้ 30 วันล่าสุด" description={fmtRange(d.from, d.to)}>
            {d.trends.length === 0 ? <None text="ยังไม่มีข้อมูลการใช้ใน 30 วันล่าสุด" /> : (
              <ul className="-my-3 divide-y">
                {d.trends.map((t) => {
                  const Icon = resourceIcon(t.resourceCode);
                  const color = resourceColor(t.resourceCode);
                  const withData = t.days.filter((x) => x.value !== null).length;
                  return (
                    <li key={t.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 py-3 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)_150px]">
                      <span className="flex min-w-0 items-center gap-2 text-sm"><Icon className="size-4 shrink-0" style={{ color }} aria-hidden /><span className="truncate">{t.resourceName}</span></span>
                      <Sparkline values={t.days.map((x) => x.value ?? 0)} color={color} className="col-span-2 h-9 sm:col-span-1" label={`${t.resourceName} 30 วัน`} />
                      <span className="row-start-1 col-start-2 text-right sm:col-start-3">
                        <span className="font-display text-lg font-semibold tabular">{fmtNum(t.total)}</span> <span className="text-xs text-muted-foreground">{t.unit}</span>
                        <span className="block text-xs text-muted-foreground">มีข้อมูล {withData} วัน</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="เซนเซอร์" description={d.sensors.length ? "ค่าล่าสุดและ 24 ชั่วโมงก่อนหน้า เฉลี่ยทุก 15 นาที" : undefined}>
            {d.sensors.length === 0 ? <None text="ยังไม่ได้ติดตั้งเซนเซอร์ ให้ผู้ดูแลระบบของบริษัทเพิ่มเซนเซอร์ให้เครื่องนี้" /> : (
              <ul className="-my-4 divide-y">
                {d.sensors.map((s) => (
                  <li key={s.id} className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-medium">
                          {s.connection === "ONLINE" && (
                            <span className="relative flex size-2" aria-hidden><span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-lime opacity-60 motion-reduce:hidden" /><span className="relative inline-flex size-2 rounded-full bg-brand-lime" /></span>
                          )}
                          {s.name}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"><Nameplate>{s.code}</Nameplate><span>{s.type}</span>{s.protocol && <span>{s.protocol}</span>}</p>
                      </div>
                      <div className="text-right">
                        {s.latest ? (
                          <>
                            <p><span className="font-display text-2xl font-semibold tabular">{fmtNum(s.latest.value)}</span> <span className="text-sm text-muted-foreground">{s.latest.unit}</span></p>
                            <p className="mt-0.5 flex items-center justify-end gap-2 text-xs text-muted-foreground"><span className="tabular">{fmtDateTime(s.latest.at)}</span><Status map={CONNECTION} value={s.connection} /></p>
                          </>
                        ) : (
                          <p className="flex items-center gap-2 text-sm text-muted-foreground">ยังไม่มีค่าที่อ่านได้ <Status map={CONNECTION} value={s.connection} /></p>
                        )}
                      </div>
                    </div>
                    {s.series.length > 1 && s.latest && (
                      <div className="mt-3">
                        <TrendChart data={s.series.map((x) => ({ label: fmtTime(x.at), value: x.value }))} series={[{ key: "value", label: s.name, color: "var(--chart-1)" }]} unit={s.latest.unit} height={150} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="บันทึกล่าสุด" description={`ทั้งหมด ${fmtNum(d.usageCount)} รายการ`}>
            {d.recent.length === 0 ? <None text="ยังไม่มีการบันทึก" /> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>วันเวลา</TableHead><TableHead>ทรัพยากร</TableHead><TableHead className="text-right">ปริมาณ</TableHead><TableHead>ที่มา</TableHead><TableHead>อ้างอิง</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {d.recent.map((r) => (
                      <TableRow key={r.usageId}>
                        <TableCell className="whitespace-nowrap tabular">{fmtDateTime(r.usageAt)}</TableCell>
                        <TableCell>{r.resourceType.resourceName}</TableCell>
                        <TableCell className="text-right whitespace-nowrap tabular">{fmtNum(r.quantity)} <span className="text-muted-foreground">{r.unit.symbol}</span></TableCell>
                        <TableCell>{SOURCE_LABEL[r.sourceType] ?? r.sourceType}</TableCell>
                        <TableCell><Nameplate>{r.usageReference}</Nameplate></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Panel>
        </div>

        <aside className="h-fit rounded-[10px] border bg-card">
          <div className="p-5">
            <h2 className="mb-3 font-semibold">ข้อมูลเครื่องจักร</h2>
            <dl className="space-y-2.5 text-sm">
              {facts.map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="shrink-0 text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>)}
            </dl>
          </div>
          <div className="border-t p-5">
            <h2 className="mb-2 font-semibold">QR Code</h2>
            {m.qrCodes.length === 0 ? <p className="text-sm text-muted-foreground">ยังไม่มี QR Code</p> : (
              <ul className="divide-y text-sm">
                {m.qrCodes.map((q) => <li key={String(q.qrId)} className="flex items-center justify-between gap-2 py-2"><Nameplate>{q.qrCode}</Nameplate><Status map={QR_STATUS} value={q.qrStatus} /></li>)}
              </ul>
            )}
          </div>
          <div className="border-t p-5">
            <h2 className="mb-2 font-semibold">การแจ้งเตือนล่าสุด</h2>
            {m.alerts.length === 0 ? <p className="text-sm text-muted-foreground">ไม่มีการแจ้งเตือน</p> : (
              <ul className="divide-y text-sm">
                {m.alerts.map((a) => (
                  <li key={String(a.alertId)} className="py-2.5">
                    <Link href={`/manager/alerts?alert=${a.alertId}`} className="font-medium hover:text-primary">{a.title}</Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Status map={SEVERITY} value={a.severity} /><Status map={ALERT_STATUS} value={a.status} /><span className="tabular">{fmtDateTime(a.triggeredAt)}</span></div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
