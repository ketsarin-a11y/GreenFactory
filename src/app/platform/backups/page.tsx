import { CheckCircle2, Download, HardDriveDownload, TriangleAlert } from "lucide-react";
import { Nameplate } from "@/components/data/nameplate";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { Status, StatusBadge } from "@/components/data/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BACKUP_STATUS, fmtBytes } from "@/components/platform/labels";
import { fmtNum } from "@/lib/format";
import { fmtDateTime } from "@/lib/time";
import { requireUser } from "@/server/auth/current-user";
import { backupOverview } from "@/server/queries/platform/backups";
import { CreateBackupButton, RestoreButton } from "./_components/backup-parts";

export default async function Page() {
  await requireUser("PLATFORM_ADMIN");
  const d = await backupOverview();
  const running = d.rows.some((r) => r.status === "RUNNING");

  return (
    <>
      <PageHeader
        title="สำรองและกู้คืนข้อมูล"
        description="สำรองทั้งฐานข้อมูลด้วย mysqldump ตรวจสอบไฟล์ทุกครั้ง และกู้คืนได้เมื่อยืนยันด้วยการพิมพ์ RESTORE"
        actions={<CreateBackupButton disabled={!d.dump.available || running} />}
      />

      {!d.dump.available ? (
        <Alert className="mb-6">
          <TriangleAlert aria-hidden />
          <AlertTitle>เครื่องนี้ยังสำรองข้อมูลไม่ได้</AlertTitle>
          <AlertDescription>
            <p>
              ไม่พบโปรแกรม <code className="font-mono">{d.dump.bin}</code> ({d.dump.error}) ระบบจึงปิดปุ่มสำรองข้อมูลไว้
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>ติดตั้ง MySQL client tools (mysqldump และ mysql) เวอร์ชันเดียวกับเซิร์ฟเวอร์ MySQL 8 บนเครื่องที่รันแอป</li>
              <li>หรือกำหนด <code className="font-mono">MYSQLDUMP_PATH</code> และ <code className="font-mono">MYSQL_PATH</code> ใน .env ให้ชี้ไปยังโปรแกรม</li>
              <li>บนโฮสต์แบบ serverless (เช่น Vercel) ให้ใช้ระบบสำรองของผู้ให้บริการฐานข้อมูลแทน</li>
            </ul>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[10px] border bg-card px-5 py-3 text-sm">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[#0a7d0a] dark:text-status-good" aria-hidden />
            <span className="font-mono text-xs">{d.dump.version}</span>
          </span>
          <span>
            โปรแกรมกู้คืน {d.client.available ? <span className="font-mono text-xs">{d.client.version}</span> : <StatusBadge tone="warning">ไม่พบโปรแกรม mysql</StatusBadge>}
          </span>
          <span className="text-muted-foreground">
            เก็บไฟล์ที่ <code className="font-mono text-xs">{d.dir}</code>
          </span>
        </div>
      )}

      {d.rows.length === 0 ? (
        <EmptyState icon={HardDriveDownload} title="ยังไม่มีข้อมูลสำรอง" description={d.dump.available ? "กด “สำรองข้อมูลตอนนี้” เพื่อสร้างไฟล์สำรองชุดแรก" : "ตั้งค่า mysqldump ตามคำแนะนำด้านบนก่อน"} />
      ) : (
        <div className="rounded-[10px] border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส</TableHead>
                <TableHead>เริ่ม</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>ตรวจสอบ</TableHead>
                <TableHead className="text-right">ขนาด</TableHead>
                <TableHead className="text-right">ใช้เวลา</TableHead>
                <TableHead>โดย</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Nameplate>{r.code}</Nameplate>
                    {r.restoredAt && <span className="block text-xs text-muted-foreground">กู้คืนเมื่อ {fmtDateTime(r.restoredAt)} โดย {r.restoredBy}</span>}
                    {r.errorMessage && <span className="block max-w-72 truncate text-xs text-status-critical" title={r.errorMessage}>{r.errorMessage}</span>}
                  </TableCell>
                  <TableCell className="tabular whitespace-nowrap">{fmtDateTime(r.startedAt)}</TableCell>
                  <TableCell><Status map={BACKUP_STATUS} value={r.status} /></TableCell>
                  <TableCell>{r.verified ? <StatusBadge tone="good">ผ่าน</StatusBadge> : <StatusBadge tone="neutral">ไม่ผ่าน</StatusBadge>}</TableCell>
                  <TableCell className="text-right tabular">{fmtBytes(r.size)}</TableCell>
                  <TableCell className="text-right tabular">{r.durationSeconds === null ? "—" : `${fmtNum(r.durationSeconds, 0)} วิ`}</TableCell>
                  <TableCell>{r.createdByName ?? "ระบบ"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {r.status === "COMPLETED" && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/api/platform/backups/${r.id}/download`} download>
                            <Download /> ดาวน์โหลด
                          </a>
                        </Button>
                      )}
                      {r.status === "COMPLETED" && r.verified && <RestoreButton backupId={r.id} code={r.code} disabled={!d.client.available} />}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
