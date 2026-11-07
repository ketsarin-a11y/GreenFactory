"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, Loader2, Lock, Minus, RotateCcw, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/utils";
import { ROLE_LABEL, isRole } from "@/server/auth/roles";
import { saveRolePermissions } from "@/server/actions/platform/roles";

type Level = "FULL" | "VIEW" | "NONE";
const NEXT: Record<Level, Level> = { FULL: "VIEW", VIEW: "NONE", NONE: "FULL" };
const LEVEL: Record<Level, { icon: LucideIcon; label: string; cls: string }> = {
  FULL: { icon: CheckCircle2, label: "ใช้งานได้", cls: "bg-primary/10 text-primary" },
  VIEW: { icon: Eye, label: "ดูอย่างเดียว", cls: "bg-muted text-foreground" },
  NONE: { icon: Minus, label: "ไม่มีสิทธิ์", cls: "text-muted-foreground" },
};

export function PermissionMatrix({ roles, permissions, levels }: {
  roles: { id: number; name: string; users: number }[];
  permissions: { id: number; code: string; name: string; group: string; description: string | null }[];
  levels: Record<string, Level>;
}) {
  const [saved, setSaved] = useState(levels);
  const [current, setCurrent] = useState(levels);
  const { run, pending } = useAction(saveRolePermissions, { success: (d) => `บันทึกสิทธิ์แล้ว ${d.count} รายการ` });
  const lvl = (map: Record<string, Level>, r: number, p: number) => map[`${r}:${p}`] ?? "NONE";

  const changes = useMemo(
    () =>
      roles.flatMap((r) =>
        permissions.flatMap((p) => (lvl(current, r.id, p.id) !== lvl(saved, r.id, p.id) ? [{ roleId: r.id, permissionId: p.id, level: lvl(current, r.id, p.id) }] : [])),
      ),
    [roles, permissions, current, saved],
  );
  const dirty = changes.length > 0;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const groups = [...new Set(permissions.map((p) => p.group))];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-3 text-sm" aria-label="ความหมายของสัญลักษณ์">
          {(Object.keys(LEVEL) as Level[]).map((k) => {
            const L = LEVEL[k];
            return (
              <li key={k} className="flex items-center gap-1.5">
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", L.cls)}>
                  <L.icon className="size-3.5" aria-hidden />
                  {L.label}
                </span>
              </li>
            );
          })}
          <li className="text-xs text-muted-foreground">คลิกที่ช่องเพื่อสลับระดับ</li>
        </ul>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-sm text-muted-foreground tabular">ยังไม่บันทึก {changes.length} รายการ</span>}
          <Button variant="outline" className="h-10" disabled={!dirty || pending} onClick={() => setCurrent(saved)}>
            <RotateCcw /> ย้อนกลับ
          </Button>
          <Button
            className="h-10"
            disabled={!dirty || pending}
            onClick={async () => {
              const r = await run({ changes });
              if (r.ok) setSaved(current);
            }}
          >
            {pending && <Loader2 className="animate-spin" />}บันทึกการเปลี่ยนแปลง
          </Button>
        </div>
      </div>

      <div className="rounded-[10px] border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-56">สิทธิ์</TableHead>
              {roles.map((r) => (
                <TableHead key={r.id} className="min-w-36 text-center">
                  <span className="block">{isRole(r.name) ? ROLE_LABEL[r.name] : r.name}</span>
                  <span className="block text-xs font-normal text-muted-foreground tabular">{r.users.toLocaleString("th-TH")} คน</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((g) => (
              <Fragment key={g}>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableCell colSpan={roles.length + 1} className="text-xs font-semibold">{g}</TableCell>
                </TableRow>
                {permissions
                  .filter((p) => p.group === g)
                  .map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <span className="block font-medium">{p.name}</span>
                        {p.description && <span className="block text-xs text-muted-foreground">{p.description}</span>}
                      </TableCell>
                      {roles.map((r) => {
                        const v = lvl(current, r.id, p.id);
                        const L = LEVEL[v];
                        const locked = r.name === "PLATFORM_ADMIN";
                        const changed = v !== lvl(saved, r.id, p.id);
                        return (
                          <TableCell key={r.id} className="text-center">
                            <button
                              type="button"
                              disabled={locked || pending}
                              onClick={() => setCurrent((m) => ({ ...m, [`${r.id}:${p.id}`]: NEXT[v] }))}
                              aria-label={`${p.name} สำหรับ ${isRole(r.name) ? ROLE_LABEL[r.name] : r.name}: ${L.label}${locked ? " (แก้ไขไม่ได้)" : ""}`}
                              className={cn(
                                "inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                                L.cls,
                                !locked && "hover:ring-1 hover:ring-border",
                                changed && "ring-2 ring-status-warning",
                                locked && "cursor-not-allowed opacity-80",
                              )}
                            >
                              {locked ? <Lock className="size-3.5" aria-hidden /> : <L.icon className="size-3.5" aria-hidden />}
                              {L.label}
                            </button>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
