"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/server/actions/auth";

export function LoginForm({ returnTo }: { returnTo: string }) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);
  const [show, setShow] = useState(false);
  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="returnTo" value={returnTo} />
      {state?.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="organizationCode">รหัสองค์กร</Label>
        <Input id="organizationCode" name="organizationCode" required autoComplete="organization" autoCapitalize="characters" className="h-10 font-mono uppercase" placeholder="เช่น VOLTERA" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" name="email" type="email" required autoComplete="username" className="h-10" placeholder="name@company.com" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">รหัสผ่าน</Label>
          <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">ลืมรหัสผ่าน?</Link>
        </div>
        <div className="relative">
          <Input id="password" name="password" type={show ? "text" : "password"} required autoComplete="current-password" className="h-10 pr-10" />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground" aria-label={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="remember" name="remember" defaultChecked />
        <Label htmlFor="remember" className="font-normal text-muted-foreground">จดจำการเข้าสู่ระบบ 7 วัน</Label>
      </div>
      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        เข้าสู่ระบบ
      </Button>
    </form>
  );
}
