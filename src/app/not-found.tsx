import Link from "next/link";
import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <Link href="/" aria-label="GreenFactory Insight หน้าแรก">
        <Logo />
      </Link>
      <p className="mt-12 font-mono text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">ไม่พบหน้าที่คุณต้องการ</h1>
      <p className="mt-3 max-w-md text-muted-foreground">ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้ายไปแล้ว</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="h-10 px-5">
          <Link href="/">กลับหน้าแรก</Link>
        </Button>
        <Button asChild variant="outline" className="h-10 px-5">
          <Link href="/login">เข้าสู่ระบบ</Link>
        </Button>
      </div>
    </main>
  );
}
