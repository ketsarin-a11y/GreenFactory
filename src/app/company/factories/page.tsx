import { CheckCircle2, Factory, Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
import { requireTenantUser } from "@/server/auth/current-user";
import { companyTree, factoryCounts } from "@/server/queries/company/tree";
import { factoryProfile } from "@/server/domain/readiness";
import { fmtNum } from "@/lib/format";
import { FactoriesView, type FactoryRow } from "./_components/factories-view";

export default async function Page() {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const tree = await companyTree(user);
  const rows: FactoryRow[] = tree.map((f) => {
    const c = factoryCounts(f);
    const profile = factoryProfile({
      code: f.factoryCode, name: f.factoryName, address: f.address, province: f.province, phone: f.phone, email: f.email,
      latitude: f.latitude, longitude: f.longitude, googleMapUrl: f.googleMapUrl, ...c,
    });
    return {
      id: f.factoryId, factoryCode: f.factoryCode, factoryName: f.factoryName, address: f.address, province: f.province, postalCode: f.postalCode,
      country: f.country, latitude: f.latitude === null ? null : Number(f.latitude), longitude: f.longitude === null ? null : Number(f.longitude),
      googleMapUrl: f.googleMapUrl, phone: f.phone, email: f.email, timezone: f.timezone, status: f.status,
      counts: { buildings: c.buildings, departments: c.departments, lines: c.lines, users: c.users, machines: c.allMachines, sensors: c.machinesWithSensor },
      readiness: profile.score, missing: profile.checks.filter((x) => !x.ok).map((x) => x.label),
    };
  });
  const users = rows.reduce((a, r) => a + r.counts.users, 0);
  return (
    <>
      <PageHeader title="โรงงาน" description="ข้อมูลโรงงานในบริษัท ตำแหน่งที่ตั้ง และความครบถ้วนของการตั้งค่า" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="โรงงานทั้งหมด" value={fmtNum(rows.length)} unit="แห่ง" icon={Factory} />
        <StatTile label="เปิดใช้งาน" value={fmtNum(rows.filter((r) => r.status === "ACTIVE").length)} unit="แห่ง" icon={Factory} />
        <StatTile label="ข้อมูลพร้อม (≥ 75%)" value={fmtNum(rows.filter((r) => r.readiness >= 75).length)} unit="แห่ง" icon={CheckCircle2} />
        <StatTile label="ผู้ใช้ในโรงงาน" value={fmtNum(users)} unit="คน" icon={Users} />
      </div>
      <FactoriesView rows={rows} />
    </>
  );
}
