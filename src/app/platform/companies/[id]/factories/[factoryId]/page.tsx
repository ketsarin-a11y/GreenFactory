import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { RECORD_STATUS, Status } from "@/components/data/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checklist, InfoList } from "@/components/platform/checklist";
import { fmtNum } from "@/lib/format";
import { requireUser } from "@/server/auth/current-user";
import { factoryDetail } from "@/server/queries/platform/companies";

export default async function Page({ params }: PageProps<"/platform/companies/[id]/factories/[factoryId]">) {
  await requireUser("PLATFORM_ADMIN");
  const p = await params;
  const companyId = Number(p.id);
  const factoryId = Number(p.factoryId);
  if (!Number.isInteger(companyId) || !Number.isInteger(factoryId)) notFound();
  const d = await factoryDetail(companyId, factoryId);
  if (!d) notFound();
  const { factory: f } = d;
  const lat = f.latitude === null ? null : Number(f.latitude);
  const lng = f.longitude === null ? null : Number(f.longitude);
  const mapUrl = f.googleMapUrl ?? (lat !== null && lng !== null ? `https://www.google.com/maps?q=${lat},${lng}` : null);
  const card = "rounded-xl border bg-card p-5";

  return (
    <>
      <Link href={`/platform/companies/${companyId}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {f.company.companyName}
      </Link>
      <PageHeader
        title={f.factoryName}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono">{f.factoryCode}</span>
            <Status map={RECORD_STATUS} value={f.status} />
            <span>ข้อมูลโครงสร้างเท่านั้น — ผู้ดูแลแพลตฟอร์มไม่เห็นข้อมูลพลังงานหรือคาร์บอนของลูกค้า</span>
          </span>
        }
      />
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <section className={`${card} lg:col-span-2`}>
          <h2 className="mb-4 font-semibold">ข้อมูลโรงงาน</h2>
          <InfoList
            items={[
              ["ที่อยู่", f.address],
              ["จังหวัด", f.province],
              ["รหัสไปรษณีย์", f.postalCode],
              ["โทรศัพท์", f.phone],
              ["อีเมล", f.email],
              ["พิกัด", lat !== null && lng !== null ? <span className="tabular">{lat.toFixed(6)}, {lng.toFixed(6)}</span> : null],
              ["แผนที่", mapUrl && <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">เปิดใน Google Maps <ExternalLink className="size-3.5" /></a>],
              ["เครื่องจักร", <span key="m" className="tabular">{fmtNum(d.machines, 0)} เครื่อง</span>],
            ]}
          />
        </section>
        <section className={card}>
          <h2 className="mb-4 font-semibold">ความพร้อมของโรงงาน</h2>
          <Checklist items={d.checklist} />
        </section>
      </div>
      <h2 className="mb-3 font-semibold">อาคาร</h2>
      {f.buildings.length ? (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส</TableHead>
                <TableHead>ชื่ออาคาร</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead className="text-right">ชั้น</TableHead>
                <TableHead className="text-right">แผนก</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {f.buildings.map((b) => (
                <TableRow key={b.buildingId}>
                  <TableCell className="font-mono text-xs">{b.buildingCode}</TableCell>
                  <TableCell>{b.buildingName}</TableCell>
                  <TableCell>{b.buildingType ?? "—"}</TableCell>
                  <TableCell className="text-right tabular">{b.floorCount ?? "—"}</TableCell>
                  <TableCell className="text-right tabular">{fmtNum(b._count.departments, 0)}</TableCell>
                  <TableCell><Status map={RECORD_STATUS} value={b.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={Building} title="ยังไม่มีอาคาร" description="ผู้ดูแลบริษัทเพิ่มอาคารได้ที่หน้าโครงสร้างโรงงาน" />
      )}
    </>
  );
}
