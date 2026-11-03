import { ClipboardList, UserCheck, Users, UserCog } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
import { Pagination, pageParam } from "@/components/data/pagination";
import { UrlFilters } from "@/components/data/url-filters";
import { requireTenantUser } from "@/server/auth/current-user";
import { ROLE_LABEL } from "@/server/auth/roles";
import { listUsers, USER_PAGE } from "@/server/queries/company/users";
import { factoryDepartmentOptions, factoryFilterOptions } from "@/server/queries/company/options";
import { fmtNum } from "@/lib/format";
import { UsersView } from "./_components/users-view";

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export default async function Page({ searchParams }: PageProps<"/company/users">) {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const [data, tree, factories] = await Promise.all([
    listUsers(user, { q: str(sp.q), role: str(sp.role), status: str(sp.status), factory: Number(str(sp.factory)) || undefined, setup: str(sp.setup), page }),
    factoryDepartmentOptions(user),
    factoryFilterOptions(user),
  ]);
  const s = data.stats;
  return (
    <>
      <PageHeader title="ผู้ใช้งาน" description="บัญชีผู้จัดการโรงงานและผู้ปฏิบัติงานของบริษัท" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="ผู้ใช้งานทั้งหมด" value={fmtNum(s.all)} icon={Users} />
        <StatTile label="บัญชีใช้งานอยู่" value={fmtNum(s.active)} icon={UserCheck} />
        <StatTile label="ผู้จัดการ / ผู้ปฏิบัติงาน" value={`${fmtNum(s.managers)} / ${fmtNum(s.operators)}`} icon={UserCog} />
        <StatTile label="ต้องตั้งค่าเพิ่ม" value={fmtNum(s.needsSetup)} icon={ClipboardList} hint="ไม่มีโรงงาน หรือผู้ปฏิบัติงานไม่มีแผนก" />
      </div>
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: "ค้นหาชื่อ อีเมล หรือรหัสพนักงาน" },
          { type: "select", name: "role", label: "บทบาท", options: (["COMPANY_ADMIN", "MANAGER", "OPERATOR"] as const).map((r) => ({ value: r, label: ROLE_LABEL[r] })) },
          { type: "select", name: "status", label: "สถานะ", options: [{ value: "ACTIVE", label: "ใช้งานอยู่" }, { value: "LOCKED", label: "ระงับใช้งาน" }, { value: "INACTIVE", label: "ปิดใช้งาน" }] },
          { type: "select", name: "factory", label: "โรงงาน", options: factories },
          { type: "select", name: "setup", label: "การตั้งค่า", options: [{ value: "no-factory", label: "ยังไม่ระบุโรงงาน" }, { value: "no-department", label: "ผู้ปฏิบัติงานไม่มีแผนก" }] },
        ]}
      />
      <UsersView rows={data.rows} tree={tree} />
      <Pagination page={page} totalPages={Math.ceil(data.total / USER_PAGE)} total={data.total} params={sp} pathname="/company/users" />
    </>
  );
}
