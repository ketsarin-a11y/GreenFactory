"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QrImage } from "@/components/company/qr-image";
import type { QrRow } from "@/server/queries/company/qr";

const PER_PAGE = 6;

/** A4 sheets, 2 × 3 labels, 37 mm QR. Print CSS hides the app shell around it. */
export function PrintSheet({ rows }: { rows: QrRow[] }) {
  const pages = Array.from({ length: Math.ceil(rows.length / PER_PAGE) }, (_, i) => rows.slice(i * PER_PAGE, (i + 1) * PER_PAGE));
  return (
    <>
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          body * { visibility: hidden; }
          .qr-print, .qr-print * { visibility: visible; }
          .qr-print { position: absolute; inset: 0 auto auto 0; width: 190mm; }
          .qr-sheet { break-after: page; border: 0 !important; padding: 0 !important; }
          .qr-sheet:last-child { break-after: auto; }
        }
      `}</style>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">พิมพ์ป้าย QR Code</h1>
          <p className="text-sm text-muted-foreground">{rows.length} ป้าย · {pages.length} หน้า A4 · ใช้ตั้งค่าพิมพ์ “ขนาดจริง (100%)”</p>
        </div>
        <Button className="h-10" onClick={() => window.print()}><Printer /> พิมพ์</Button>
      </div>
      <div className="qr-print space-y-6">
        {pages.map((page, i) => (
          <section key={i} className="qr-sheet mx-auto grid w-[190mm] grid-cols-2 grid-rows-3 gap-[4mm] rounded-xl border bg-white p-[4mm] text-black" style={{ height: "277mm" }}>
            {page.map((q) => (
              <article key={q.id} className="flex flex-col items-center justify-center gap-[2mm] rounded-lg border border-dashed border-neutral-400 p-[4mm] text-center">
                <QrImage token={q.token} size={140} alt={`QR ${q.qrCode}`} className="h-[37mm] w-[37mm]" />
                <p className="text-[13pt] leading-tight font-semibold">{q.targetName}</p>
                <p className="font-mono text-[10pt]">{q.qrCode} · {q.targetCode}</p>
                <p className="text-[9pt] leading-snug text-neutral-600">{q.building} › {q.department} › {q.line}</p>
                {q.status !== "ACTIVE" && <p className="text-[9pt] font-medium">สถานะ: ระงับชั่วคราว</p>}
              </article>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
