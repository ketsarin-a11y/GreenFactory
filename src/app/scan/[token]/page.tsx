import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { CheckCircle2, ClipboardList, Clock, Cpu, Home, MapPin, ScanLine, TriangleAlert } from "lucide-react";
import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Nameplate } from "@/components/data/nameplate";
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
          <div className="overflow-hidden rounded-[14px] border bg-card">
            <div className="bg-control-room px-5 pt-5 pb-6 text-white">
              <p className="inline-flex items-center gap-1.5 text-sm text-white/80">
                <CheckCircle2 className="size-4 text-brand-lime" aria-hidden /> ยืนยัน QR Code แล้ว
              </p>
              <p className="mt-4 text-sm text-white/70">{result.target.kind === "MACHINE" ? "เครื่องจักร" : "จุดตรวจ"}</p>
              <h1 id="target" className="mt-0.5 font-display text-[1.75rem] leading-tight font-semibold">{result.target.name}</h1>
              <Nameplate className="mt-3 border-white/25 bg-white/10 px-2 py-0.5 text-sm text-white">{result.target.code}</Nameplate>
            </div>
            <dl className="divide-y text-sm">
              {result.target.type && (
                <div className="flex items-start gap-3 px-5 py-3"><dt className="w-16 shrink-0 text-muted-foreground">ประเภท</dt><dd className="flex items-center gap-2"><Cpu className="size-4 shrink-0 text-muted-foreground" aria-hidden />{result.target.type}</dd></div>
              )}
              <div className="flex items-start gap-3 px-5 py-3"><dt className="w-16 shrink-0 text-muted-foreground">ตำแหน่ง</dt><dd className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />{result.target.location}</dd></div>
              <div className="flex items-center gap-3 px-5 py-3">
                <dt className="w-16 shrink-0 text-muted-foreground">สถานะ</dt>
                <dd>{result.target.status ? <Status map={MACHINE_STATUS} value={result.target.status} /> : <Status map={RECORD_STATUS} value="ACTIVE" />}</dd>
              </div>
            </dl>
          </div>
          <p className="mt-3 flex items-center gap-1.5 px-1 text-xs text-muted-foreground"><Clock className="size-3.5" aria-hidden /> การสแกนนี้ใช้บันทึกได้ 1 รายการภายใน 30 นาที</p>
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
        <section className="rounded-[14px] border bg-card p-5 text-center" aria-labelledby="err">
          <TriangleAlert className="mx-auto mb-3 size-8 text-status-critical" aria-hidden />
          <h1 id="err" className="font-display text-xl font-semibold">ใช้ QR Code นี้ไม่ได้</h1>
          <p className="mt-2 text-sm text-muted-foreground">ไม่พบ QR Code นี้ในโรงงานของคุณ หรือ QR Code ถูกระงับหรือยกเลิกแล้ว แจ้งผู้ดูแลระบบหากคิดว่าไม่ถูกต้อง</p>
          <div className="mt-6 grid gap-2">
            <Button asChild size="lg" className="h-11"><Link href="/operator/scan"><ScanLine /> สแกนใหม่</Link></Button>
            <Button asChild variant="outline" size="lg" className="h-11"><Link href="/operator/record"><ClipboardList /> บันทึกโดยเลือกเครื่องเอง</Link></Button>
          </div>
        </section>
      )}
    </main>
  );
}
