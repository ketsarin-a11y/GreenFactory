"use client";

import { useState } from "react";
import { Ban, CheckCircle2, History, KeyRound, Loader2, MoreHorizontal, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field } from "@/components/account/field";
import { EmptyState } from "@/components/data/empty-state";
import { Status } from "@/components/data/status-badge";
import { ConfirmAction } from "@/components/platform/confirm-button";
import { TempPasswordInput } from "@/components/platform/temp-password";
import { DEVICE_LABEL_TH, LOGIN_STATUS } from "@/components/platform/labels";
import { useAction } from "@/hooks/use-action";
import { fmtDateTime } from "@/lib/time";
import { getUserLoginHistory, resetUserPassword, setUserStatus } from "@/server/actions/platform/users";
import { LOGIN_FAILURE_LABEL } from "@/server/domain/user-agent";
import { UserFormSheet, type EditableUser, type UserOptions } from "./user-form";

export function CreateUserButton({ options }: { options: UserOptions }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  return (
    <>
      <Button
        className="h-10"
        onClick={() => {
          setKey((k) => k + 1); // fresh form each time
          setOpen(true);
        }}
      >
        <Plus /> เพิ่มผู้ใช้งาน
      </Button>
      <UserFormSheet key={key} open={open} onOpenChange={setOpen} options={options} />
    </>
  );
}

type History = Awaited<ReturnType<typeof getUserLoginHistory>>;

export function UserActions({ user, status, isSelf, options }: { user: EditableUser; status: string; isSelf: boolean; options: UserOptions }) {
  const [dialog, setDialog] = useState<"edit" | "status" | "password" | "history" | null>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [password, setPassword] = useState("");
  const reset = useAction(resetUserPassword, { success: "ตั้งรหัสผ่านชั่วคราวแล้ว ผู้ใช้ถูกออกจากระบบทุกอุปกรณ์" });
  const load = useAction(getUserLoginHistory);
  const name = `${user.firstName} ${user.lastName}`;
  const suspend = status === "ACTIVE";
  const close = () => setDialog(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`การจัดการ ${name}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setDialog("edit")}>
            <Pencil /> แก้ไขข้อมูล
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={async () => {
              setDialog("history");
              setHistory(null);
              setHistory(await load.run({ userId: user.userId }));
            }}
          >
            <History /> ประวัติการเข้าสู่ระบบ
          </DropdownMenuItem>
          {!isSelf && (
            <>
              <DropdownMenuItem onSelect={() => setDialog("password")}>
                <KeyRound /> รีเซ็ตรหัสผ่าน
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant={suspend ? "destructive" : "default"} onSelect={() => setDialog("status")}>
                {suspend ? <Ban /> : <CheckCircle2 />} {suspend ? "ระงับใช้งาน" : "เปิดใช้งาน"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {dialog === "edit" && <UserFormSheet open onOpenChange={(o) => !o && close()} options={options} user={user} />}

      <ConfirmAction
        open={dialog === "status"}
        onOpenChange={(o) => !o && close()}
        action={setUserStatus}
        input={{ userId: user.userId, status: suspend ? "LOCKED" : "ACTIVE" }}
        title={suspend ? `ระงับ ${name}?` : `เปิดใช้งาน ${name}?`}
        description={suspend ? "ผู้ใช้จะถูกออกจากระบบทุกอุปกรณ์ทันที และเข้าสู่ระบบไม่ได้จนกว่าจะเปิดใช้งาน" : "ผู้ใช้จะเข้าสู่ระบบได้อีกครั้ง และล้างการล็อกจากการใส่รหัสผิด"}
        confirmLabel={suspend ? "ระงับใช้งาน" : "เปิดใช้งาน"}
        success={suspend ? "ระงับผู้ใช้แล้ว" : "เปิดใช้งานผู้ใช้แล้ว"}
        destructive={suspend}
      />

      <Dialog open={dialog === "password"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>รีเซ็ตรหัสผ่านของ {name}</DialogTitle>
            <DialogDescription>ตั้งรหัสผ่านชั่วคราวแล้วแจ้งผู้ใช้ทางช่องทางที่ปลอดภัย ผู้ใช้จะถูกออกจากระบบทุกอุปกรณ์</DialogDescription>
          </DialogHeader>
          <Field id={`pw-${user.userId}`} label="รหัสผ่านชั่วคราว" required error={reset.errors.password} hint="อย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข">
            <TempPasswordInput id={`pw-${user.userId}`} name="password" value={password} onChange={setPassword} />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={reset.pending}>ยกเลิก</Button>
            <Button
              disabled={reset.pending || !password}
              onClick={async () => {
                const r = await reset.run({ userId: user.userId, password });
                if (r.ok) {
                  setPassword("");
                  close();
                }
              }}
            >
              {reset.pending && <Loader2 className="animate-spin" />}ตั้งรหัสผ่าน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={dialog === "history"} onOpenChange={(o) => !o && close()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>ประวัติการเข้าสู่ระบบ</SheetTitle>
            <SheetDescription>{name} · 20 ครั้งล่าสุด</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            {!history ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> กำลังโหลด…</p>
            ) : !history.ok ? (
              <p className="text-sm text-status-critical">{history.message}</p>
            ) : history.data.length === 0 ? (
              <EmptyState title="ยังไม่เคยเข้าสู่ระบบ" />
            ) : (
              <ul className="divide-y text-sm">
                {history.data.map((l) => (
                  <li key={l.id} className="flex items-start justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="tabular">{fmtDateTime(new Date(l.loginAt))}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.browser} · {l.os} · {DEVICE_LABEL_TH[l.device]} · {l.ipAddress ?? "ไม่ทราบ IP"}
                      </p>
                      {l.status === "FAILED" && l.failureReason && <p className="text-xs text-status-critical">{LOGIN_FAILURE_LABEL[l.failureReason] ?? l.failureReason}</p>}
                    </div>
                    <Status map={LOGIN_STATUS} value={l.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
