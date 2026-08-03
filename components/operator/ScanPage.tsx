"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import jsQR from "jsqr";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CircleDot,
  Flashlight,
  FlashlightOff,
  Image as ImageIcon,
  Lightbulb,
  MapPin,
  Package,
  PenLine,
  RotateCcw,
  ScanLine,
  Sparkles,
  Workflow,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EquipmentListItem } from "@/lib/record-queries";

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
  const [matchedEquipment, setMatchedEquipment] =
    useState<EquipmentListItem | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        setCameraError("");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        const track = stream.getVideoTracks()[0];
        trackRef.current = track ?? null;

        const capabilities = track?.getCapabilities?.() as
          | (MediaTrackCapabilities & { torch?: boolean })
          | undefined;

        setTorchSupported(Boolean(capabilities?.torch));

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          frameRef.current = requestAnimationFrame(scanFrame);
        }
      } catch (error) {
        console.error("Camera error:", error);

        setCameraError(
          "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้กล้อง หรือเลือกภาพ QR Code จากเครื่องแทน",
        );
      }
    }

    function scanFrame() {
      if (scanState !== "idle") return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (
        video &&
        canvas &&
        video.readyState === video.HAVE_ENOUGH_DATA
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");

        if (context) {
          context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height,
          );

          const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          );

          const result = jsQR(
            imageData.data,
            imageData.width,
            imageData.height,
          );

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

      streamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanState === "idle"]);

  function handleCodeDetected(code: string) {
    const trimmed = code.trim();

    setLastScannedCode(trimmed);

    const match = equipmentList.find(
      (equipment) =>
        equipment.equipmentCode?.toLowerCase() ===
        trimmed.toLowerCase(),
    );

    setMatchedEquipment(match ?? null);
    setScanState(match ? "success" : "not_found");
  }

  async function toggleTorch() {
    const track = trackRef.current;

    if (!track || !torchSupported) return;

    try {
      const next = !torchOn;

      await track.applyConstraints({
        advanced: [{ torch: next }],
      });

      setTorchOn(next);
    } catch (error) {
      console.error("Torch toggle error:", error);
    }
  }

  function handleGalleryPick(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const image = new window.Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");

        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext("2d");

        if (!context) return;

        context.drawImage(image, 0, 0);

        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );

        const result = jsQR(
          imageData.data,
          imageData.width,
          imageData.height,
        );

        if (result?.data) {
          handleCodeDetected(result.data);
          return;
        }

        setScanState("not_found");
        setLastScannedCode("");
        setMatchedEquipment(null);
      };

      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  function handleRescan() {
    setScanState("idle");
    setMatchedEquipment(null);
    setLastScannedCode("");
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm shadow-slate-200/40 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <ScanLine className="h-5 w-5" strokeWidth={2.2} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                สแกน QR Code
              </h1>

              <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 sm:inline-flex">
                พร้อมใช้งาน
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              สแกนรหัสบนเครื่องจักรเพื่อเริ่มบันทึกข้อมูล
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ImageIcon className="h-4 w-4 text-violet-500" />
          เลือกรูป QR
        </button>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-200/40">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-slate-950">
              {cameraError ? (
                <CameraError
                  message={cameraError}
                  onOpenGallery={() =>
                    galleryInputRef.current?.click()
                  }
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />

                  <canvas ref={canvasRef} className="hidden" />

                  <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />

                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          scanState === "idle"
                            ? "bg-emerald-400"
                            : scanState === "success"
                              ? "bg-blue-400"
                              : "bg-amber-400"
                        }`}
                      />
                      {scanState === "idle"
                        ? "กำลังสแกน"
                        : scanState === "success"
                          ? "พบ QR Code"
                          : "ไม่พบข้อมูล"}
                    </span>
                  </div>

                  {torchSupported && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/50"
                      aria-label={
                        torchOn ? "ปิดไฟฉาย" : "เปิดไฟฉาย"
                      }
                    >
                      {torchOn ? (
                        <FlashlightOff className="h-4 w-4" />
                      ) : (
                        <Flashlight className="h-4 w-4" />
                      )}
                    </button>
                  )}

                  {scanState === "idle" && <ScannerFrame />}

                  {scanState === "success" && (
                    <ResultOverlay
                      tone="success"
                      title="สแกนสำเร็จ"
                    />
                  )}

                  {scanState === "not_found" && (
                    <ResultOverlay
                      tone="warning"
                      title="ไม่พบเครื่องจักร"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      galleryInputRef.current?.click()
                    }
                    className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur transition hover:bg-white"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-violet-500" />
                    เลือกจากแกลเลอรี
                  </button>
                </>
              )}

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleGalleryPick}
              />
            </div>
          </section>

          <section className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm ring-1 ring-amber-100">
              <Lightbulb className="h-4 w-4" />
            </span>

            <div className="pt-0.5">
              <p className="text-sm font-semibold text-slate-700">
                สแกนให้ง่ายขึ้น
              </p>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                จัด QR ให้อยู่กลางกรอบและถือกล้องให้นิ่ง
                หากแสงน้อยให้เปิดไฟฉาย
              </p>
            </div>
          </section>
        </div>

        <aside>
          {scanState === "idle" && <IdleState />}

          {scanState === "not_found" && (
            <NotFoundState
              lastScannedCode={lastScannedCode}
              onRescan={handleRescan}
            />
          )}

          {scanState === "success" && matchedEquipment && (
            <EquipmentResult
              equipment={matchedEquipment}
              onRescan={handleRescan}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function ScannerFrame() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative flex h-[250px] w-[250px] items-center justify-center sm:h-[280px] sm:w-[280px]">
        <CornerBrackets />
        <div className="absolute inset-5 rounded-2xl border border-white/10" />
        <span className="absolute left-6 right-6 top-1/2 h-[2px] -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.75)]" />
        <div className="absolute -bottom-16 text-center">
          <p className="text-sm font-semibold text-white">
            วาง QR Code ให้อยู่ในกรอบ
          </p>
          <p className="mt-1 text-[11px] text-white/60">
            ระบบจะอ่านรหัสให้อัตโนมัติ
          </p>
        </div>
      </div>
    </div>
  );
}

function ResultOverlay({
  tone,
  title,
}: {
  tone: "success" | "warning";
  title: string;
}) {
  const success = tone === "success";

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45 backdrop-blur-[1px]">
      <div className="flex flex-col items-center">
        <span
          className={[
            "flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/20 shadow-xl",
            success
              ? "bg-emerald-500 text-white"
              : "bg-amber-400 text-white",
          ].join(" ")}
        >
          {success ? (
            <CheckCircle2 className="h-8 w-8" />
          ) : (
            <AlertCircle className="h-8 w-8" />
          )}
        </span>
        <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      </div>
    </div>
  );
}

function CameraError({
  message,
  onOpenGallery,
}: {
  message: string;
  onOpenGallery: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
        <AlertCircle className="h-6 w-6" />
      </span>
      <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
        {message}
      </p>
      <button
        type="button"
        onClick={onOpenGallery}
        className="mt-5 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
      >
        <ImageIcon className="h-4 w-4 text-violet-500" />
        เลือกภาพจากเครื่อง
      </button>
    </div>
  );
}

function IdleState() {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-sm font-bold text-slate-800">ผลการสแกน</p>
      </div>

      <div className="flex min-h-[300px] flex-col items-center justify-center px-7 py-10 text-center">
        <div className="relative">
          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-500">
            <Sparkles className="h-3 w-3" />
          </span>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
            <ScanLine className="h-7 w-7" />
          </span>
        </div>

        <p className="mt-5 text-sm font-semibold text-slate-700">
          พร้อมสำหรับการสแกน
        </p>
        <p className="mt-2 max-w-[260px] text-xs leading-5 text-slate-400">
          เล็งกล้องไปที่ QR Code บนเครื่องจักร
          แล้วข้อมูลจะแสดงตรงนี้โดยอัตโนมัติ
        </p>
      </div>
    </section>
  );
}

function NotFoundState({
  lastScannedCode,
  onRescan,
}: {
  lastScannedCode: string;
  onRescan: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-amber-200/80 bg-white shadow-sm shadow-amber-100/50">
      <div className="bg-amber-50 px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm">
            <AlertCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-amber-800">
              ไม่พบเครื่องจักร
            </p>
            <p className="mt-0.5 text-xs text-amber-600">
              QR Code นี้ยังไม่ตรงกับข้อมูลในระบบ
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {lastScannedCode && (
          <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              รหัสที่สแกนได้
            </p>
            <p className="mt-1 break-all text-sm font-semibold text-slate-700">
              {lastScannedCode}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onRescan}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          <RotateCcw className="h-4 w-4" />
          สแกนใหม่
        </button>
      </div>
    </section>
  );
}

function EquipmentResult({
  equipment,
  onRescan,
}: {
  equipment: EquipmentListItem;
  onRescan: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-emerald-100 bg-emerald-50/60 px-5 py-4">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          <p className="text-sm font-bold">สแกนสำเร็จ</p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Package className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-900">
                  {equipment.name}
                </p>
                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  {equipment.equipmentCode}
                </p>
              </div>
              <StatusBadge status={equipment.status} />
            </div>
          </div>
        </div>

        <dl className="mt-5 space-y-1">
          <DetailRow
            icon={Wrench}
            iconStyle="bg-violet-50 text-violet-500"
            label="ประเภท"
            value={equipment.equipmentType ?? "-"}
          />
          <DetailRow
            icon={Workflow}
            iconStyle="bg-blue-50 text-blue-500"
            label="ไลน์การผลิต"
            value={equipment.productionLine ?? "-"}
          />
          <DetailRow
            icon={Building2}
            iconStyle="bg-amber-50 text-amber-500"
            label="แผนก"
            value={equipment.department ?? "-"}
          />
          <DetailRow
            icon={MapPin}
            iconStyle="bg-rose-50 text-rose-500"
            label="ตำแหน่ง"
            value={equipment.location || "-"}
          />
          <DetailRow
            icon={CircleDot}
            iconStyle="bg-emerald-50 text-emerald-500"
            label="สถานะ"
            value={equipment.status === "NORMAL" ? "ปกติ" : equipment.status}
          />
        </dl>

        <div className="mt-5 space-y-2.5">
          <Link
            href={`/operator/record?equipment=${equipment.equipmentId}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700"
          >
            <PenLine className="h-4 w-4" />
            บันทึกการใช้ทรัพยากร
          </Link>

          <button
            type="button"
            onClick={onRescan}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <RotateCcw className="h-4 w-4" />
            สแกนเครื่องอื่น
          </button>
        </div>
      </div>
    </section>
  );
}

function DetailRow({
  icon: Icon,
  iconStyle,
  label,
  value,
}: {
  icon: LucideIcon;
  iconStyle: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2">
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          iconStyle,
        ].join(" ")}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>

      <dt className="min-w-0 flex-1 text-xs font-medium text-slate-400">
        {label}
      </dt>

      <dd className="max-w-[55%] truncate text-right text-sm font-semibold text-slate-700">
        {value}
      </dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isNormal = status === "NORMAL";

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        isNormal
          ? "bg-emerald-50 text-emerald-600"
          : "bg-amber-50 text-amber-600",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          isNormal ? "bg-emerald-500" : "bg-amber-500",
        ].join(" ")}
      />
      {isNormal ? "ปกติ" : status}
    </span>
  );
}

function CornerBrackets() {
  const corner =
    "absolute h-10 w-10 border-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]";

  return (
    <>
      <span
        className={`${corner} left-0 top-0 rounded-tl-2xl border-l-[5px] border-t-[5px]`}
      />
      <span
        className={`${corner} right-0 top-0 rounded-tr-2xl border-r-[5px] border-t-[5px]`}
      />
      <span
        className={`${corner} bottom-0 left-0 rounded-bl-2xl border-b-[5px] border-l-[5px]`}
      />
      <span
        className={`${corner} bottom-0 right-0 rounded-br-2xl border-b-[5px] border-r-[5px]`}
      />
    </>
  );
}