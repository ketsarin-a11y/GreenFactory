import { CircleCheck, CircleMinus, Eye, Info, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireTenantUser } from "@/server/auth/current-user";
import { ROLE_LABEL } from "@/server/auth/roles";
import { roleMatrix, type Level } from "@/server/queries/company/roles";

const LEVEL: Record<Level, { label: string; icon: typeof Eye; cls: string }> = {
  FULL: { label: "จัดการได้", icon: CircleCheck, cls: "text-[#0a7d0a] dark:text-status-good" },
  VIEW: { label: "ดูอย่างเดียว", icon: Eye, cls: "text-foreground" },
  NONE: { label: "ไม่มีสิทธิ์", icon: CircleMinus, cls: "text-muted-foreground" },
};

function LevelCell({ level }: { level: Level }) {
  const l = LEVEL[level];
  return <span className={`inline-flex items-center gap-1.5 text-sm ${l.cls}`}><l.icon className="size-4" aria-hidden />{l.label}</span>;
}

export default async function Page() {
  await requireTenantUser("COMPANY_ADMIN");
  const groups = await roleMatrix();
  return (
    <>
      <PageHeader title="บทบาทและสิทธิ์" description="สิ่งที่ผู้จัดการโรงงานและผู้ปฏิบัติงานทำได้ในระบบ" />
      <div className="mb-4 flex gap-3 rounded-xl border bg-card p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <div>
          <p>สิทธิ์ของแต่ละบทบาทกำหนดโดยผู้ดูแลแพลตฟอร์ม GreenFactory และใช้เหมือนกันทุกบริษัท หน้านี้แสดงเพื่อให้ตรวจสอบได้ว่าควรมอบบทบาทใดให้ใคร</p>
          <p className="mt-1 text-muted-foreground">ผู้ดูแลบริษัท (คุณ) จัดการได้ทุกส่วนของบริษัท ส่วนผู้จัดการและผู้ปฏิบัติงานเห็นเฉพาะโรงงานของตนเอง</p>
        </div>
      </div>
      <ul className="mb-4 flex flex-wrap gap-4 text-sm" aria-label="คำอธิบายระดับสิทธิ์">
        {(Object.keys(LEVEL) as Level[]).map((l) => <li key={l}><LevelCell level={l} /></li>)}
      </ul>
      {groups.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="ยังไม่มีการกำหนดสิทธิ์" description="ติดต่อผู้ดูแลแพลตฟอร์มเพื่อกำหนดสิทธิ์ของบทบาท" />
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <section key={g.code} className="overflow-x-auto rounded-xl border bg-card">
              <h2 className="border-b px-4 py-3 font-semibold">{g.name}</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>สิทธิ์</TableHead>
                    <TableHead className="w-44">{ROLE_LABEL.MANAGER}</TableHead>
                    <TableHead className="w-44">{ROLE_LABEL.OPERATOR}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {g.rows.map((r) => (
                    <TableRow key={r.code}>
                      <TableCell>
                        <p className="font-medium">{r.name}</p>
                        {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                      </TableCell>
                      <TableCell><LevelCell level={r.MANAGER} /></TableCell>
                      <TableCell><LevelCell level={r.OPERATOR} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
