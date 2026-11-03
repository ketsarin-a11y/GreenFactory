"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "@/server/actions/auth";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPasswordAction, undefined);
  return (
    <>
      <h1 className="font-display text-2xl font-semibold tracking-tight">ลืมรหัสผ่าน</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">กรอกอีเมลที่ใช้เข้าสู่ระบบ เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้</p>
      {state?.success ? (
        <Alert>
          <MailCheck />
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      ) : (
        <form action={action} className="space-y-5">
          {state?.error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" className="h-10" />
          </div>
          <Button type="submit" className="h-10 w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            ส่งลิงก์ตั้งรหัสผ่าน
          </Button>
        </form>
      )}
      <Link href="/login" className="mt-6 inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        กลับไปหน้าเข้าสู่ระบบ
      </Link>
    </>
  );
}
