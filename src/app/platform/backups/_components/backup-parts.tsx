"use client";

import { useState } from "react";
import { DatabaseBackup, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/account/field";
import { useAction } from "@/hooks/use-action";
import { createBackup, restoreBackup } from "@/server/actions/platform/backups";

export function CreateBackupButton({ disabled }: { disabled: boolean }) {
  const { run, pending } = useAction(createBackup, { success: (d) => `สำรองข้อมูลสำเร็จ (${d.code}) และผ่านการตรวจสอบแล้ว` });
  return (
    <Button className="h-10" disabled={disabled || pending} onClick={() => run({})}>
      {pending ? <Loader2 className="animate-spin" /> : <DatabaseBackup />}
      {pending ? "กำลังสำรองข้อมูล…" : "สำรองข้อมูลตอนนี้"}
    </Button>
  );
}

export function RestoreButton({ backupId, code, disabled }: { backupId: number; code: string; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [reason, setReason] = useState("");
  const { run, pending, errors } = useAction(restoreBackup, { success: "กู้คืนข้อมูลสำเร็จ" });
  return (
    <>
      <Button variant="outline" size="sm" disabled={disabled} onClick={() => setOpen(true)}>
        <RotateCcw /> กู้คืน
      </Button>
      <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>กู้คืนจาก {code}</DialogTitle>
            <DialogDescription>
              ข้อมูลทั้งฐานข้อมูลจะถูกแทนที่ด้วยข้อมูล ณ เวลาที่สำรอง ข้อมูลที่บันทึกหลังจากนั้นจะหายไป ผู้ใช้ทุกคนควรหยุดใช้งานระหว่างกู้คืน
            </DialogDescription>
          </DialogHeader>
          <Field id="reason" label="เหตุผล" required error={errors.reason} hint="บันทึกไว้ใน Audit Log">
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
          </Field>
          <Field id="confirm" label="พิมพ์ RESTORE เพื่อยืนยัน" required error={errors.confirm}>
            <Input id="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-10 font-mono" autoComplete="off" />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>ยกเลิก</Button>
            <Button
              variant="destructive"
              disabled={pending || confirm !== "RESTORE" || reason.trim().length < 5}
              onClick={async () => {
                const r = await run({ backupId, confirm, reason });
                if (r.ok) setOpen(false);
              }}
            >
              {pending && <Loader2 className="animate-spin" />}กู้คืนข้อมูล
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
