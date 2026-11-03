import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { ChartCard } from "@/components/data/chart-card";
import { TrendChart } from "@/components/data/trend-chart";
import { ALERT_STATUS, CONNECTION, MACHINE_STATUS, QR_STATUS, SEVERITY, Status } from "@/components/data/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDay, fmtDayLong, SOURCE_LABEL } from "@/components/manager/format";
import { fmtNum } from "@/lib/format";
import { fmtDate, fmtDateTime } from "@/lib/time";
import { resourceColor } from "@/lib/resources";
import { requireTenantUser } from "@/server/auth/current-user";
import { getMachine, normMachineStatus } from "@/server/queries/manager/machines";

const Card = ({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) => (
  <section className={`rounded-xl border bg-card p-5 ${className ?? ""}`}><h2 className="mb-3 font-semibold">{title}</h2>{children}</section>
);
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
    ["รหัส", m.machineCode], ["ประเภท", m.machineType.machineTypeName], ["ผู้ผลิต / รุ่น", [m.manufacturer, m.model].filter(Boolean).join(" ") || "—"],
    ["หมายเลขเครื่อง", m.serialNumber ?? "—"], ["วันที่ติดตั้ง", m.installationDate ? fmtDate(m.installationDate) : "—"],
    ["ตำแหน่ง", `${b.factory.factoryName} › ${b.buildingName} › ${dep.departmentName} › ${line.lineName}`], ["หมายเหตุตำแหน่ง", m.locationNote ?? "—"],
    ["บันทึกทั้งหมด", `${fmtNum(d.usageCount)} รายการ`],
  ];

  return (
    <>
      <Link href="/manager/machines" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" />เครื่องจักรทั้งหมด</Link>
      <PageHeader title={m.machineName} description={<span className="font-mono">{m.machineCode}</span>} actions={<Status map={MACHINE_STATUS} value={normMachineStatus(m.operationalStatus)} />} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {d.trends.length === 0 ? (
            <Card title="การใช้ 30 วันล่าสุด"><None text="ยังไม่มีข้อมูลการใช้ใน 30 วันล่าสุด" /></Card>
          ) : (
            d.trends.map((t) => (
              <ChartCard key={t.key} title={`${t.resourceName} 30 วันล่าสุด`} description={`รวม ${fmtNum(t.total)} ${t.unit} · ${fmtDayLong(d.from)} – ${fmtDayLong(d.to)}`}
                table={{ columns: ["วันที่", `ค่า (${t.unit})`], rows: t.days.map((x) => [fmtDayLong(x.day), fmtNum(x.value)]) }}>
                <TrendChart data={t.days.map((x) => ({ label: fmtDay(x.day), value: x.value }))} series={[{ key: "value", label: t.resourceName, color: resourceColor(t.resourceCode) }]} unit={t.unit} height={200} />
              </ChartCard>
            ))
          )}
          <Card title="บันทึกล่าสุด">
            {d.recent.length === 0 ? <None text="ยังไม่มีการบันทึก" /> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>วันเวลา</TableHead><TableHead>ทรัพยากร</TableHead><TableHead className="text-right">ปริมาณ</TableHead><TableHead>ที่มา</TableHead><TableHead>อ้างอิง</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {d.recent.map((r) => (
                      <TableRow key={r.usageId}>
                        <TableCell className="tabular">{fmtDateTime(r.usageAt)}</TableCell>
                        <TableCell>{r.resourceType.resourceName}</TableCell>
                        <TableCell className="text-right tabular">{fmtNum(r.quantity)} {r.unit.symbol}</TableCell>
                        <TableCell>{SOURCE_LABEL[r.sourceType] ?? r.sourceType}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{r.usageReference}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="ข้อมูลเครื่องจักร">
            <dl className="space-y-2.5 text-sm">
              {facts.map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="shrink-0 text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>)}
            </dl>
          </Card>
          <Card title={`เซนเซอร์ (${d.sensors.length})`}>
            {d.sensors.length === 0 ? <None text="ยังไม่ได้ติดตั้งเซนเซอร์" /> : (
              <ul className="divide-y text-sm">
                {d.sensors.map((s) => (
                  <li key={s.id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2"><span className="font-medium">{s.name}</span><Status map={CONNECTION} value={s.connection} /></div>
                    <p className="mt-0.5 text-xs text-muted-foreground"><span className="font-mono">{s.code}</span> · {s.type}{s.protocol && ` · ${s.protocol}`}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.latest ? <>ค่าล่าสุด <span className="tabular font-medium text-foreground">{fmtNum(s.latest.value)} {s.latest.unit}</span> · {fmtDateTime(s.latest.at)}</> : "ยังไม่มีค่าที่อ่านได้"}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title={`QR Code (${m.qrCodes.length})`}>
            {m.qrCodes.length === 0 ? <None text="ยังไม่มี QR Code" /> : (
              <ul className="divide-y text-sm">
                {m.qrCodes.map((q) => (
                  <li key={String(q.qrId)} className="flex items-center justify-between gap-2 py-2"><span className="font-mono text-xs">{q.qrCode}</span><Status map={QR_STATUS} value={q.qrStatus} /></li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="การแจ้งเตือนล่าสุด">
            {m.alerts.length === 0 ? <None text="ไม่มีการแจ้งเตือน" /> : (
              <ul className="divide-y text-sm">
                {m.alerts.map((a) => (
                  <li key={String(a.alertId)} className="py-2.5">
                    <Link href={`/manager/alerts?alert=${a.alertId}`} className="font-medium hover:text-primary">{a.title}</Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Status map={SEVERITY} value={a.severity} /><Status map={ALERT_STATUS} value={a.status} /><span className="tabular">{fmtDateTime(a.triggeredAt)}</span></div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
