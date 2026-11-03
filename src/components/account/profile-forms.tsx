"use client";

import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "@/hooks/use-action";
import { changePassword, updateProfile, uploadAvatar } from "@/server/actions/account";
import { Field } from "./field";

export function AvatarUploader({ name, url }: { name: string; url: string | null }) {
  const input = useRef<HTMLInputElement>(null);
  const { run, pending } = useAction(uploadAvatar, { success: "อัปเดตรูปโปรไฟล์แล้ว" });
  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        {url && <AvatarImage src={url} alt="" />}
        <AvatarFallback className="bg-accent text-lg font-medium text-accent-foreground">{name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <div>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) { const fd = new FormData(); fd.set("file", f); run(fd); }
            e.target.value = "";
          }}
        />
        <Button variant="outline" size="sm" onClick={() => input.current?.click()} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Camera />} เปลี่ยนรูป
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">JPG, PNG หรือ WebP ไม่เกิน 5 MB</p>
      </div>
    </div>
  );
}

export function ProfileForm({ defaults }: { defaults: { firstName: string; lastName: string; phone: string } }) {
  const { run, pending, errors } = useAction(updateProfile, { success: "บันทึกข้อมูลส่วนตัวแล้ว" });
  return (
    <form action={async (fd) => { await run(fd); }} className="grid gap-4 sm:grid-cols-2">
      <Field id="firstName" label="ชื่อ" error={errors.firstName} required>
        <Input id="firstName" name="firstName" defaultValue={defaults.firstName} required />
      </Field>
      <Field id="lastName" label="นามสกุล" error={errors.lastName} required>
        <Input id="lastName" name="lastName" defaultValue={defaults.lastName} required />
      </Field>
      <Field id="phone" label="เบอร์โทรศัพท์" error={errors.phone}>
        <Input id="phone" name="phone" type="tel" defaultValue={defaults.phone} />
      </Field>
      <div className="flex items-end sm:justify-end">
        <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />}บันทึก</Button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const form = useRef<HTMLFormElement>(null);
  const { run, pending, errors } = useAction(changePassword, { success: "เปลี่ยนรหัสผ่านแล้ว อุปกรณ์อื่นจะถูกออกจากระบบ" });
  return (
    <form ref={form} action={async (fd) => { const r = await run(fd); if (r.ok) form.current?.reset(); }} className="grid gap-4 sm:grid-cols-3">
      <Field id="current" label="รหัสผ่านปัจจุบัน" error={errors.current} required>
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </Field>
      <Field id="next" label="รหัสผ่านใหม่" hint="อย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข" required>
        <Input id="next" name="next" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <Field id="confirm" label="ยืนยันรหัสผ่านใหม่" required>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <div className="sm:col-span-3 sm:flex sm:justify-end">
        <Button type="submit" variant="outline" disabled={pending}>{pending && <Loader2 className="animate-spin" />}เปลี่ยนรหัสผ่าน</Button>
      </div>
    </form>
  );
}
