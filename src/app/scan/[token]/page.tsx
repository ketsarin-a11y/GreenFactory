import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { CheckCircle2, ClipboardList, Cpu, Home, MapPin, ScanLine, TriangleAlert } from "lucide-react";
import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { MACHINE_STATUS, RECORD_STATUS, Status } from "@/components/data/status-badge";
import { requireTenantUser } from "@/server/auth/current-user";
import { scanQr } from "@/server/queries/operator";

export const metadata: Metadata = { title: "สแกน QR Code", robots: { index: false } };

export default async function Page({ params }: PageProps<"/scan/[token]">) {
  const user = await requireTenantUser("OPERATOR");
  const { token } = await params;
  const h = await headers();
  const result = await scanQr(user, token, {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip"),
    userAgent: h.get("user-agent"),
  });

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-6">
      <div className="mb-6"><Logo /></div>
      {result ? (
        <section className="flex flex-1 flex-col" aria-labelledby="target">
          <div className="rounded-xl border bg-card p-5">
            <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <CheckCircle2 className="size-4" aria-hidden /> ยืนยัน QR Code แล้ว
            </p>
            <p className="text-sm text-muted-foreground">{result.target.kind === "MACHINE" ? "เครื่องจักร" : "จุดตรวจ"}</p>
            <h1 id="target" className="text-2xl font-semibold tracking-tight">{result.target.name}</h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{result.target.code}</p>
            <dl className="mt-4 space-y-2.5 text-sm">
              {result.target.type && (
                <div className="flex gap-2"><dt className="sr-only">ประเภท</dt><Cpu className="size-4 shrink-0 text-muted-foreground" aria-hidden /><dd>{result.target.type}</dd></div>
              )}
              <div className="flex gap-2"><dt className="sr-only">ตำแหน่ง</dt><MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden /><dd>{result.target.location}</dd></div>
              <div className="flex items-center gap-2">
                <dt className="text-muted-foreground">สถานะ</dt>
                <dd>{result.target.status ? <Status map={MACHINE_STATUS} value={result.target.status} /> : <Status map={RECORD_STATUS} value="ACTIVE" />}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">ใช้บันทึกได้ภายใน 30 นาที • รหัสการสแกน <span className="font-mono">{result.scanId}</span></p>
          </div>
          <div className="sticky bottom-0 mt-auto space-y-2 bg-background pt-6 pb-2">
            <Button asChild size="lg" className="h-12 w-full text-base">
              <Link href={`/operator/record?scan=${result.scanId}`}><ClipboardList /> บันทึกการใช้ทรัพยากร</Link>
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="lg" className="h-11"><Link href="/operator/scan"><ScanLine /> สแกนอีกครั้ง</Link></Button>
              <Button asChild variant="outline" size="lg" className="h-11"><Link href="/operator"><Home /> หน้าหลัก</Link></Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border bg-card p-5 text-center" aria-labelledby="err">
          <TriangleAlert className="mx-auto mb-3 size-8 text-status-critical" aria-hidden />
          <h1 id="err" className="text-xl font-semibold">ใช้ QR Code นี้ไม่ได้</h1>
          <p className="mt-2 text-sm text-muted-foreground">ไม่พบ QR Code นี้ในโรงงานของคุณ หรือ QR Code ถูกระงับ/ยกเลิกแล้ว แจ้งผู้ดูแลระบบหากคิดว่าไม่ถูกต้อง</p>
          <div className="mt-6 grid gap-2">
            <Button asChild size="lg" className="h-11"><Link href="/operator/scan"><ScanLine /> สแกนใหม่</Link></Button>
            <Button asChild variant="outline" size="lg" className="h-11"><Link href="/operator/record"><ClipboardList /> บันทึกแบบเลือกเครื่องเอง</Link></Button>
          </div>
        </section>
      )}
    </main>
  );
}
