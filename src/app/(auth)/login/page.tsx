import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { homeFor, safeReturnTo } from "@/server/auth/roles";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const returnTo = safeReturnTo(typeof sp.returnTo === "string" ? sp.returnTo : null);
  const user = await getCurrentUser();
  if (user) redirect(returnTo ?? homeFor(user.role));
  return (
    <>
      <h1 className="font-display text-2xl font-semibold tracking-tight">เข้าสู่ระบบ</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">ใช้รหัสองค์กรที่ได้รับจากผู้ดูแลระบบของบริษัท</p>
      <LoginForm returnTo={returnTo ?? ""} demo={process.env.NEXT_PUBLIC_DEMO_MODE === "true"} />
    </>
  );
}
