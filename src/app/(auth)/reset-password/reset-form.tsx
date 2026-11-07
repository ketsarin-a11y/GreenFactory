"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "@/server/actions/auth";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);
  if (state?.success)
    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle2 />
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
        <Button asChild className="h-10 w-full"><Link href="/login">ไปหน้าเข้าสู่ระบบ</Link></Button>
      </div>
    );
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      {state?.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="password">รหัสผ่านใหม่</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="h-10" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">ยืนยันรหัสผ่านใหม่</Label>
        <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="h-10" />
      </div>
      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        บันทึกรหัสผ่านใหม่
      </Button>
    </form>
  );
}
