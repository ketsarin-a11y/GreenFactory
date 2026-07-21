
"use client";
 
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import jsQR from "jsqr";
import {
  Flashlight,
  FlashlightOff,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Package,
  Wrench,
  Workflow,
  Building2,
  MapPin,
  CircleDot,
  RotateCcw,
  PenLine,
  Lightbulb,
  ScanLine,
} from "lucide-react";
import type { EquipmentListItem } from "@/lib/record-queries";
 
/**
 * components/operator/ScanPage.tsx
 * -----------------------------------
 * หน้า "สแกน QR Code" ทั้งหมดในไฟล์เดียว (ไม่แยกโฟลเดอร์ย่อย) — ใช้กล้องจริง (jsQR)
 * + ไฟฉาย (ถ้าอุปกรณ์รองรับ) + เลือกภาพจากแกลเลอรีมาสแกนแทนได้
 * จับคู่ผลสแกนกับ equipmentCode ที่ดึงมาจาก DB จริง (ผ่าน app/operator/scan/page.tsx)
 *
 * หมายเหตุ: การ์ดรายละเอียดเครื่องจักรแสดงเฉพาะ field ที่มีอยู่ใน schema จริงตอนนี้
 * (ประเภทเครื่องจักร, ไลน์การผลิต, แผนก, ตำแหน่ง, สถานะ) — ยังไม่มี "จุดตรวจ",
 * "รอบการบำรุงรักษา", "วันที่บำรุงรักษาล่าสุด" เพราะไม่มี field พวกนี้ใน Equipment
 * model ตอนนี้ (เพิ่มได้ถ้าต้องการ)
 */
 
type ScanState = "idle" | "success" | "not_found";
 
interface ScanPageProps {
  equipmentList: EquipmentListItem[];
}
 
export default function ScanPage({ equipmentList }: ScanPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const frameRef = useRef<number>(0);
 
  const [cameraError, setCameraError] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [matchedEquipment, setMatchedEquipment] = useState<EquipmentListItem | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState("");
 
  useEffect(() => {
    let cancelled = false;
 
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        trackRef.current = track ?? null;
 
        const capabilities = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined;
        setTorchSupported(Boolean(capabilities?.torch));
 
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          frameRef.current = requestAnimationFrame(scanFrame);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้อง หรือเลือกภาพจากแกลเลอรีแทน");
      }
    }
 
    function scanFrame() {
      if (scanState !== "idle") return; // หยุดสแกนต่อเมื่อเจอผลแล้ว รอผู้ใช้กด "สแกนใหม่"
 
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(imageData.data, imageData.width, imageData.height);
          if (result?.data) {
            handleCodeDetected(result.data);
            return;
          }
        }
      }
      frameRef.current = requestAnimationFrame(scanFrame);
    }
 
    startCamera();
 
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanState === "idle"]);
 
  function handleCodeDetected(code: string) {
    const trimmed = code.trim();
    setLastScannedCode(trimmed);
    const match = equipmentList.find((eq) => eq.equipmentCode?.toLowerCase() === trimmed.toLowerCase());
    setMatchedEquipment(match ?? null);
    setScanState(match ? "success" : "not_found");
  }
 
  async function toggleTorch() {
    const track = trackRef.current;
    if (!track || !torchSupported) return;
    try {
      const next = !torchOn;
      // @ts-expect-error - torch เป็น non-standard constraint ที่ TypeScript lib ยังไม่รู้จัก แต่เบราว์เซอร์ที่รองรับ (ส่วนใหญ่ Android Chrome) จะใช้ได้จริง
      await track.applyConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
    } catch (err) {
      console.error("Torch toggle error:", err);
    }
  }
 
  function handleGalleryPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // ให้เลือกไฟล์เดิมซ้ำได้อีกครั้งถ้าจำเป็น
    if (!file) return;
 
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQR(imageData.data, imageData.width, imageData.height);
        if (result?.data) {
          handleCodeDetected(result.data);
        } else {
          setScanState("not_found");
          setLastScannedCode("");
          setMatchedEquipment(null);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
 
  function handleRescan() {
    setScanState("idle");
    setMatchedEquipment(null);
    setLastScannedCode("");
    // useEffect ที่ผูกกับ scanState === "idle" จะรีสตาร์ตกล้อง + scan loop ให้เองอัตโนมัติ
  }
 
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="flex flex-col gap-6">
        {/* กล้อง */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900">
          {cameraError ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <AlertCircle size={28} className="text-red-400" />
              <p className="text-sm text-slate-300">{cameraError}</p>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
              >
                <ImageIcon size={16} />
                เลือกภาพจากแกลเลอรี
              </button>
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
 
              {torchSupported && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur"
                >
                  {torchOn ? <FlashlightOff size={14} /> : <Flashlight size={14} />}
                  {torchOn ? "ปิดไฟฉาย" : "เปิดไฟฉาย"}
                </button>
              )}
 
              {scanState === "idle" && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
                  <p className="text-center text-sm font-medium">
                    สแกน QR Code
                    <br />
                    ให้อยู่ในกรอบสี่เหลี่ยม
                  </p>
                  <div className="relative h-56 w-56">
                    <CornerBrackets />
                    <span className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-emerald-400/80" />
                  </div>
                </div>
              )}
 
              {scanState !== "idle" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  {scanState === "success" ? (
                    <CheckCircle2 size={48} className="text-emerald-400" />
                  ) : (
                    <AlertCircle size={48} className="text-amber-400" />
                  )}
                </div>
              )}
 
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur"
              >
                <ImageIcon size={14} />
                เลือกจากแกลเลอรี
              </button>
            </>
          )}
 
          {/* input ไฟล์อยู่นอก conditional เสมอ เพื่อให้เลือกรูปจากแกลเลอรีได้แม้กล้องจะใช้งานไม่ได้ */}
          <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryPick} />
        </div>
 
        {/* เคล็ดลับ */}
        <section className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Lightbulb size={18} />
          </span>
          <div>
            <p className="mb-1 text-sm font-semibold text-emerald-700">เคล็ดลับการสแกน</p>
            <p className="text-sm text-slate-500">
              วาง QR Code ให้อยู่ในกรอบ • ให้อุปกรณ์นิ่งและแสงสว่างเพียงพอ • หากสแกนไม่ได้ ลองเปิดไฟฉาย
            </p>
          </div>
        </section>
      </div>
 
      {/* ผลการสแกน */}
      <aside className="flex flex-col gap-4">
        {scanState === "idle" && (
          <section className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ScanLine size={22} />
            </span>
            <p className="text-sm font-medium text-slate-600">ยังไม่มีการสแกน</p>
            <p className="text-xs text-slate-400">เล็งกล้องไปที่ QR Code บนเครื่องจักร หรือเลือกภาพจากแกลเลอรี</p>
          </section>
        )}
 
        {scanState === "not_found" && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="mb-2 flex items-center gap-2 text-amber-700">
              <AlertCircle size={18} />
              <p className="text-sm font-semibold">ไม่พบเครื่องจักรที่ตรงกับรหัสนี้</p>
            </div>
            {lastScannedCode && <p className="mb-4 text-xs text-amber-600">รหัสที่สแกนได้: {lastScannedCode}</p>}
            <button
              type="button"
              onClick={handleRescan}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100"
            >
              <RotateCcw size={16} />
              สแกนใหม่
            </button>
          </section>
        )}
 
        {scanState === "success" && matchedEquipment && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={18} />
              <div>
                <p className="text-sm font-semibold">สแกนสำเร็จ</p>
                <p className="text-xs text-slate-400">พบข้อมูลเครื่องจักร / จุดตรวจ</p>
              </div>
            </div>
 
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Package size={20} />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{matchedEquipment.name}</p>
                <p className="text-xs text-slate-400">{matchedEquipment.equipmentCode}</p>
              </div>
              <StatusBadge status={matchedEquipment.status} />
            </div>
 
            <dl className="flex flex-col divide-y divide-slate-100 text-sm">
              <DetailRow icon={Wrench} label="ประเภทเครื่องจักร" value={matchedEquipment.equipmentType ?? "-"} />
              <DetailRow icon={Workflow} label="ไลน์การผลิต" value={matchedEquipment.productionLine ?? "-"} />
              <DetailRow icon={Building2} label="แผนก" value={matchedEquipment.department ?? "-"} />
              <DetailRow icon={MapPin} label="ตำแหน่ง" value={matchedEquipment.location} />
              <DetailRow icon={CircleDot} label="สถานะ" value={matchedEquipment.status === "NORMAL" ? "ปกติ" : matchedEquipment.status} />
            </dl>
 
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-sky-50 px-4 py-3 text-xs text-sky-700">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              พร้อมบันทึกข้อมูล — คุณสามารถบันทึกการใช้ทรัพยากรของเครื่องนี้ได้ทันที
            </div>
 
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={`/operator/record?equipment=${matchedEquipment.equipmentId}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <PenLine size={16} />
                บันทึกการใช้ทรัพยากร
              </Link>
              <button
                type="button"
                onClick={handleRescan}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw size={16} />
                สแกนใหม่
              </button>
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}
 
function DetailRow({ icon: Icon, label, value }: { icon: typeof Wrench; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="flex items-center gap-2 text-slate-500">
        <Icon size={15} className="text-slate-400" />
        {label}
      </span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
 
function StatusBadge({ status }: { status: string }) {
  const isNormal = status === "NORMAL";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${isNormal ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isNormal ? "bg-emerald-500" : "bg-amber-500"}`} />
      {isNormal ? "ปกติ" : status}
    </span>
  );
}
 
function CornerBrackets() {
  const cls = "absolute h-8 w-8 border-emerald-400";
  return (
    <>
      <span className={`${cls} left-0 top-0 border-l-4 border-t-4 rounded-tl-xl`} />
      <span className={`${cls} right-0 top-0 border-r-4 border-t-4 rounded-tr-xl`} />
      <span className={`${cls} bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl`} />
      <span className={`${cls} bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl`} />
    </>
  );
}
 
