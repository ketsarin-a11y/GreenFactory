"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/server/actions/auth";

/** Seeded demo accounts (prisma/seed/demo.ts). Shown only when NEXT_PUBLIC_DEMO_MODE=true. */
const DEMO_ACCOUNTS = [
  { org: "VOLTERA", email: "operator@voltera.example", role: "พนักงานหน้างาน", note: "โรงงานชลบุรี" },
  { org: "VOLTERA", email: "manager@voltera.example", role: "ผู้จัดการโรงงาน", note: "โรงงานชลบุรี" },
  { org: "VOLTERA", email: "manager.rayong@voltera.example", role: "ผู้จัดการโรงงาน", note: "โรงงานระยอง" },
  { org: "VOLTERA", email: "admin@voltera.example", role: "ผู้ดูแลบริษัท", note: "Voltera" },
  { org: "SIAMFOOD", email: "manager@siamfood.example", role: "ผู้จัดการโรงงาน", note: "Siam Food" },
  { org: "SIAMFOOD", email: "admin@siamfood.example", role: "ผู้ดูแลบริษัท", note: "Siam Food" },
  { org: "GFPLATFORM", email: "admin@greenfactory.dev", role: "ผู้ดูแลแพลตฟอร์ม", note: "GreenFactory" },
];

export function LoginForm({ returnTo, demo = false }: { returnTo: string; demo?: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);
  const [show, setShow] = useState(false);
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const password = useRef<HTMLInputElement>(null);
  return (
    <>
      <form action={formAction} className="space-y-5" noValidate>
        <input type="hidden" name="returnTo" value={returnTo} />
        {state?.error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="organizationCode">รหัสองค์กร</Label>
          <Input id="organizationCode" name="organizationCode" value={org} onChange={(e) => setOrg(e.target.value)} required autoComplete="organization" autoCapitalize="characters" className="h-10 font-display tracking-wide uppercase" placeholder="เช่น VOLTERA" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">อีเมล</Label>
          <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" className="h-10" placeholder="name@company.com" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">ลืมรหัสผ่าน?</Link>
          </div>
          <div className="relative">
            <Input ref={password} id="password" name="password" type={show ? "text" : "password"} required autoComplete="current-password" className="h-10 pr-10" />
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

      {demo && (
        <section aria-labelledby="demo" className="mt-10 border-t pt-6">
          <h2 id="demo" className="text-sm font-semibold">ทดลองใช้บัญชีเดโม</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เลือกบทบาทเพื่อกรอกรหัสองค์กรและอีเมลให้ แล้วพิมพ์รหัสผ่านเอง
          </p>
          <p className="mt-2 text-sm">รหัสผ่านเดโม: <span className="font-mono">Demo1234</span></p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.email}>
                <button
                  type="button"
                  onClick={() => { setOrg(a.org); setEmail(a.email); password.current?.focus(); }}
                  className="flex min-h-11 w-full flex-col items-start rounded-md border bg-card px-3 py-2 text-left text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="font-medium">{a.role}</span>
                  <span className="text-xs text-muted-foreground">{a.note}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
