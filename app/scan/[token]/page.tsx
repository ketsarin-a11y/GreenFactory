"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, QrCode } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { qrCodeService } from "@/services/qr-code.service";
import type { QRCodeItem } from "@/types/qr-code";

export default function ScanTokenPage() {
  const params = useParams<{ token: string }>();
  const [item, setItem] = useState<QRCodeItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    qrCodeService.findByToken(params.token).then((result) => {
      setItem(result);
      setLoading(false);
    });
  }, [params.token]);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f4f7f4] text-[12px] text-[#6f7b8a]">กำลังตรวจสอบ QR Code...</main>;
  }

  if (!item) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7f4] px-5">
        <section className="w-full max-w-[460px] rounded-[24px] bg-white p-8 text-center shadow-[0_24px_70px_rgba(25,44,34,0.12)]">
          <AlertTriangle className="mx-auto h-10 w-10 text-[#c14d4d]" />
          <h1 className="mt-5 text-[22px] font-semibold text-[#263247]">ไม่พบ QR Code</h1>
          <p className="mt-3 text-[11px] leading-5 text-[#7b8694]">Token นี้ไม่ถูกต้องหรือไม่มีอยู่ในระบบ</p>
        </section>
      </main>
    );
  }

  const blocked = item.status !== "ACTIVE";

  return (
    <main className="min-h-screen bg-[#f4f7f4] px-5 py-10">
      <section className="mx-auto w-full max-w-[560px] rounded-[26px] bg-white p-7 shadow-[0_24px_70px_rgba(25,44,34,0.12)]">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#e8f5ed] text-[#2d8057]"><QrCode className="h-5 w-5" /></span>
          <div><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#2d8057]">GreenFactory Scan</p><h1 className="mt-1 text-[20px] font-semibold text-[#263247]">{item.targetName}</h1></div>
        </div>

        <div className={`mt-6 rounded-[16px] border p-4 ${blocked ? "border-[#f0caca] bg-[#fff7f7]" : "border-[#cfe7da] bg-[#f3faf6]"}`}>
          <div className="flex items-center gap-3">
            {blocked ? <AlertTriangle className="h-5 w-5 text-[#b14848]" /> : <CheckCircle2 className="h-5 w-5 text-[#24734b]" />}
            <div><p className="text-[10px] font-semibold text-[#344054]">{blocked ? "QR Code ไม่สามารถใช้งานได้" : "QR Code พร้อมใช้งาน"}</p><p className="mt-1 text-[8px] text-[#7b8694]">สถานะ: {item.status}</p></div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ["รหัส QR", item.code],
            ["รหัสอุปกรณ์", item.targetCode],
            ["อาคาร", item.building],
            ["แผนก", item.department],
            ["สายการผลิต", item.productionLine],
            ["ประเภท", item.targetType === "MACHINE" ? "เครื่องจักร" : "จุดตรวจ"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[13px] border border-[#e4e8ed] bg-[#fbfcfd] p-4"><p className="text-[8px] text-[#98a2b3]">{label}</p><p className="mt-1 text-[10px] font-medium text-[#475467]">{value}</p></div>
          ))}
        </div>

        {!blocked && (
          <a href={`/operator/resource-entry?qr=${encodeURIComponent(item.token)}`} className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[13px] bg-[#1f8f62] px-5 text-[11px] font-semibold text-white">ไปยังหน้าบันทึกข้อมูล<ArrowRight className="h-4 w-4" /></a>
        )}
      </section>
    </main>
  );
}
