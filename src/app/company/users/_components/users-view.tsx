"use client";

import { useState } from "react";
import { KeyRound, Lock, MoreHorizontal, Pencil, Plus, Unlock, Users, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field } from "@/components/account/field";
import { EmptyState } from "@/components/data/empty-state";
import { Nameplate } from "@/components/data/nameplate";
import { RECORD_STATUS, Status } from "@/components/data/status-badge";
import { FormSheet } from "@/components/company/form-sheet";
import { ConfirmDialog, type Confirm } from "@/components/company/confirm-dialog";
import { Cascade, type HNode } from "@/components/company/cascade";
import { SelectField } from "@/components/company/select-field";
import { useAction } from "@/hooks/use-action";
import { fmtDateTime } from "@/lib/time";
import { ROLE_LABEL, isRole } from "@/server/auth/roles";
import { createUser, resetUserPassword, setUserStatus, updateUser } from "@/server/actions/company/users";
import type { UserRow } from "@/server/queries/company/users";

const roleLabel = (r: string) => (isRole(r) ? ROLE_LABEL[r] : r);

/** 12 chars, letters + digits, from the browser CSPRNG. */
function tempPassword(): string {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const s = Array.from(bytes, (b) => abc[b % abc.length]).join("");
  return /\d/.test(s) && /[A-Za-z]/.test(s) ? s : tempPassword();
}

export function UsersView({ rows, tree }: { rows: UserRow[]; tree: HNode[] }) {
  const [editing, setEditing] = useState<UserRow | "new" | null>(null);
  const [resetting, setResetting] = useState<UserRow | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const status = useAction(setUserStatus, { success: "เปลี่ยนสถานะบัญชีแล้ว" });

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button className="h-10" onClick={() => setEditing("new")}><Plus /> สร้างผู้ใช้</Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={Users} title="ไม่พบผู้ใช้งาน" description="ลองล้างตัวกรอง หรือเพิ่มผู้ใช้งานใหม่" />
      ) : (
        <div className="overflow-x-auto rounded-[10px] border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ผู้ใช้</TableHead>
                <TableHead>รหัสพนักงาน</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead>โรงงาน / แผนก</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>เข้าสู่ระบบล่าสุด</TableHead>
                <TableHead className="w-10"><span className="sr-only">จัดการ</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <p className="font-medium">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </TableCell>
                  <TableCell>{u.employeeCode ? <Nameplate>{u.employeeCode}</Nameplate> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                  <TableCell>{roleLabel(u.role)}</TableCell>
                  <TableCell className="text-xs">
                    <p>{u.factory ?? (u.role === "COMPANY_ADMIN" ? "ทุกโรงงาน" : <span className="text-status-critical">ยังไม่ระบุโรงงาน</span>)}</p>
                    <p className="text-muted-foreground">{u.department ?? (u.role === "OPERATOR" ? <span className="text-status-critical">ยังไม่ระบุแผนก</span> : "—")}</p>
                  </TableCell>
                  <TableCell><Status map={RECORD_STATUS} value={u.status} /></TableCell>
                  <TableCell className="tabular text-xs text-muted-foreground">{u.lastLogin ? fmtDateTime(new Date(u.lastLogin)) : "ยังไม่เคย"}</TableCell>
                  <TableCell>
                    {u.manageable && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`จัดการ ${u.firstName}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setEditing(u)}><Pencil /> แก้ไข</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setResetting(u)}><KeyRound /> ตั้งรหัสผ่านชั่วคราว</DropdownMenuItem>
                          {u.status === "ACTIVE" ? (
                            <DropdownMenuItem variant="destructive" onSelect={() => setConfirm({
                              title: "ระงับบัญชี", description: `${u.firstName} ${u.lastName} จะถูกออกจากระบบทุกอุปกรณ์ทันที และเข้าสู่ระบบไม่ได้จนกว่าจะเปิดใช้งาน`,
                              confirmLabel: "ระงับบัญชี", destructive: true, run: () => status.run({ id: u.id, status: "LOCKED" }),
                            })}><Lock /> ระงับบัญชี</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onSelect={() => status.run({ id: u.id, status: "ACTIVE" })}><Unlock /> เปิดใช้งาน</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <UserSheet key={editing === "new" ? "new" : editing?.id ?? "none"} editing={editing} tree={tree} onClose={() => setEditing(null)} />
      <ResetSheet key={`reset-${resetting?.id ?? "none"}`} user={resetting} onClose={() => setResetting(null)} />
      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} pending={status.pending} />
    </>
  );
}

function UserSheet({ editing, tree, onClose }: { editing: UserRow | "new" | null; tree: HNode[]; onClose: () => void }) {
  const u = editing === "new" ? null : editing;
  const [role, setRole] = useState(u?.role === "MANAGER" ? "MANAGER" : "OPERATOR");
  const save = useAction(u ? updateUser : createUser, { success: u ? "บันทึกการแก้ไขแล้ว" : "เพิ่มผู้ใช้งานแล้ว" });
  const errors = save.errors;
  const text = (name: "firstName" | "lastName" | "employeeCode" | "phone", label: string, required = false) => (
    <Field id={`u-${name}`} label={label} error={errors[name]} required={required}>
      <Input id={`u-${name}`} name={name} defaultValue={u?.[name] ?? ""} className="h-10" required={required} />
    </Field>
  );
  return (
    <FormSheet open={editing !== null} onOpenChange={(o) => !o && onClose()} title={u ? `แก้ไข ${u.firstName} ${u.lastName}` : "เพิ่มผู้ใช้งาน"}
      description={u ? u.email : "ชื่อผู้ใช้สร้างจากอีเมลโดยอัตโนมัติ"} pending={save.pending}
      onSubmit={async (fd) => { if (u) fd.set("id", String(u.id)); return (await save.run(fd)).ok; }}>
      <div className="grid gap-4 sm:grid-cols-2">
        {text("firstName", "ชื่อ", true)}
        {text("lastName", "นามสกุล", true)}
        {text("employeeCode", "รหัสพนักงาน", true)}
        {text("phone", "เบอร์โทรศัพท์")}
      </div>
      {!u && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="u-email" label="อีเมล" error={errors.email} required>
            <Input id="u-email" name="email" type="email" className="h-10" required autoComplete="off" />
          </Field>
          <Field id="u-password" label="รหัสผ่านเริ่มต้น" error={errors.password} hint="อย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข" required>
            <Input id="u-password" name="password" type="text" className="h-10 font-mono" required minLength={8} autoComplete="new-password" />
          </Field>
        </div>
      )}
      <Field id="u-role" label="บทบาท" error={errors.role} required>
        <SelectField id="u-role" name="role" value={role} onChange={setRole} options={[{ value: "MANAGER", label: ROLE_LABEL.MANAGER }, { value: "OPERATOR", label: ROLE_LABEL.OPERATOR }]} />
      </Field>
      <Cascade tree={tree} errors={errors} idPrefix="u" defaultPath={u ? [String(u.factoryId ?? ""), String(u.departmentId ?? "")].filter(Boolean) : []}
        levels={[{ name: "factoryId", label: "โรงงาน", required: true }, role === "OPERATOR" ? { name: "departmentId", label: "แผนก", required: true } : { name: "departmentId", label: "แผนก", optional: "ไม่ระบุแผนก" }]} />
    </FormSheet>
  );
}

function ResetSheet({ user, onClose }: { user: UserRow | null; onClose: () => void }) {
  const [pw, setPw] = useState("");
  const { run, pending, errors } = useAction(resetUserPassword, { success: "ตั้งรหัสผ่านชั่วคราวแล้ว ผู้ใช้ถูกออกจากระบบทุกอุปกรณ์" });
  return (
    <FormSheet open={user !== null} onOpenChange={(o) => !o && onClose()} title="ตั้งรหัสผ่านชั่วคราว" submitLabel="ตั้งรหัสผ่าน"
      description={user ? `${user.firstName} ${user.lastName} จะถูกออกจากระบบทุกอุปกรณ์ แจ้งรหัสนี้ให้ผู้ใช้และให้เปลี่ยนที่หน้าโปรไฟล์` : undefined}
      pending={pending} onSubmit={async () => (await run({ id: user!.id, password: pw })).ok}>
      <Field id="r-pw" label="รหัสผ่านชั่วคราว" error={errors.password} hint="อย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข" required>
        <div className="flex gap-2">
          <Input id="r-pw" value={pw} onChange={(e) => setPw(e.target.value)} className="h-10 font-mono" required minLength={8} autoComplete="new-password" />
          <Button type="button" variant="outline" className="h-10" onClick={() => setPw(tempPassword())}><Wand2 /> สุ่ม</Button>
        </div>
      </Field>
    </FormSheet>
  );
}
