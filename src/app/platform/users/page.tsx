import { Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SummaryStrip } from "@/components/platform/summary-strip";
import { UrlFilters } from "@/components/data/url-filters";
import { Pagination, pageParam } from "@/components/data/pagination";
import { EmptyState } from "@/components/data/empty-state";
import { RECORD_STATUS, Status } from "@/components/data/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtNum } from "@/lib/format";
import { fmtDate } from "@/lib/time";
import { requireUser } from "@/server/auth/current-user";
import { ROLES, ROLE_LABEL, isRole } from "@/server/auth/roles";
import { listUsers, userFormOptions } from "@/server/queries/platform/users";
import { CreateUserButton, UserActions } from "./_components/user-actions";

export default async function Page({ searchParams }: PageProps<"/platform/users">) {
  const me = await requireUser("PLATFORM_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const [d, options] = await Promise.all([listUsers(sp, page), userFormOptions()]);

  return (
    <>
      <PageHeader title="ผู้ใช้งาน" description="บัญชีผู้ใช้ของทุกบริษัทและผู้ดูแลแพลตฟอร์ม" actions={<CreateUserButton options={options} />} />
      <SummaryStrip
        items={[
          { label: "ทั้งหมด", value: fmtNum(d.stats.total, 0), unit: "คน", href: "/platform/users", active: !sp.status },
          { label: "ใช้งานอยู่", value: fmtNum(d.stats.active, 0), unit: "คน", href: "/platform/users?status=ACTIVE", active: sp.status === "ACTIVE" },
          { label: "ระงับใช้งาน", value: fmtNum(d.stats.locked, 0), unit: "คน", href: "/platform/users?status=LOCKED", active: sp.status === "LOCKED" },
          { label: "ปิดใช้งาน", value: fmtNum(d.stats.inactive, 0), unit: "คน", href: "/platform/users?status=INACTIVE", active: sp.status === "INACTIVE" },
          { label: "ใหม่ใน 30 วัน", value: fmtNum(d.stats.newUsers, 0), unit: "คน" },
        ]}
      />
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: "ค้นหาชื่อ อีเมล ชื่อผู้ใช้ หรือรหัสพนักงาน" },
          { type: "select", name: "company", label: "บริษัท", options: options.companies.map((c) => ({ value: String(c.id), label: c.name })) },
          { type: "select", name: "role", label: "บทบาท", options: ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] })) },
          {
            type: "select",
            name: "status",
            label: "สถานะ",
            options: [
              { value: "ACTIVE", label: "ใช้งานอยู่" },
              { value: "LOCKED", label: "ระงับใช้งาน" },
              { value: "INACTIVE", label: "ปิดใช้งาน" },
            ],
          },
        ]}
      />
      {d.rows.length === 0 ? (
        <EmptyState icon={Users} title="ไม่พบผู้ใช้งาน" description="ลองล้างตัวกรอง หรือกด “เพิ่มผู้ใช้งาน”" />
      ) : (
        <div className="rounded-[10px] border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ผู้ใช้</TableHead>
                <TableHead>บริษัท</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead>โรงงาน / แผนก</TableHead>
                <TableHead>ลงทะเบียน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="w-10"><span className="sr-only">การจัดการ</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.rows.map((u) => {
                const role = isRole(u.role.roleName) ? u.role.roleName : null;
                return (
                  <TableRow key={u.userId}>
                    <TableCell className="max-w-64">
                      <span className="block truncate font-medium">
                        {u.firstName} {u.lastName}
                        {u.userId === me.id && <span className="ml-1 text-xs font-normal text-muted-foreground">(คุณ)</span>}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">{u.email}</span>
                    </TableCell>
                    <TableCell>{u.company?.companyName ?? (role === "PLATFORM_ADMIN" ? "แพลตฟอร์มส่วนกลาง" : "—")}</TableCell>
                    <TableCell>{role ? ROLE_LABEL[role] : u.role.roleName}</TableCell>
                    <TableCell>
                      <span className="block">{u.factory?.factoryName ?? "—"}</span>
                      {u.departmentRef && <span className="block text-xs text-muted-foreground">{u.departmentRef.departmentName}</span>}
                    </TableCell>
                    <TableCell className="tabular">{fmtDate(u.createdAt)}</TableCell>
                    <TableCell><Status map={RECORD_STATUS} value={u.status} /></TableCell>
                    <TableCell>
                      {role && (
                        <UserActions
                          status={u.status}
                          isSelf={u.userId === me.id}
                          options={options}
                          user={{
                            userId: u.userId,
                            firstName: u.firstName,
                            lastName: u.lastName,
                            email: u.email,
                            username: u.username,
                            phone: u.phone,
                            employeeCode: u.employeeCode,
                            role,
                            companyId: u.companyId,
                            factoryId: u.factoryId,
                            departmentId: u.departmentId,
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={page} totalPages={d.totalPages} total={d.total} params={sp} pathname="/platform/users" />
    </>
  );
}
