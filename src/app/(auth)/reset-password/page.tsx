import Link from "next/link";
import { ResetForm } from "./reset-form";

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">ตั้งรหัสผ่านใหม่</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">อย่างน้อย 8 ตัวอักษร มีทั้งตัวอักษรและตัวเลข</p>
      {typeof token === "string" && token ? (
        <ResetForm token={token} />
      ) : (
        <p className="text-sm">
          ลิงก์ไม่ครบถ้วน <Link href="/forgot-password" className="font-medium text-primary hover:underline">ขอลิงก์ใหม่</Link>
        </p>
      )}
    </>
  );
}
