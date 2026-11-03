"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { CameraOff, ClipboardList, ImageUp, Loader2, RotateCcw, ScanLine, Zap, ZapOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const CAMERA_ERROR: Record<string, string> = {
  NotAllowedError: "ไม่ได้รับอนุญาตให้ใช้กล้อง กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่าเบราว์เซอร์ แล้วกด “เปิดกล้องอีกครั้ง”",
  NotFoundError: "ไม่พบกล้องบนอุปกรณ์นี้ ใช้ปุ่ม “เลือกรูป QR Code” แทนได้",
  NotReadableError: "กล้องถูกใช้งานโดยแอปอื่นอยู่ กรุณาปิดแอปนั้นแล้วลองอีกครั้ง",
  OverconstrainedError: "กล้องของอุปกรณ์นี้ไม่รองรับการตั้งค่าที่ต้องการ ใช้ปุ่ม “เลือกรูป QR Code” แทนได้",
};
const NOT_FOUND = "ไม่พบข้อมูล QR Code";

/** `/scan/<token>` from a decoded QR text (full URL or path), else null. */
function tokenFrom(text: string) {
  try {
    const m = new URL(text.trim(), window.location.origin).pathname.match(/^\/scan\/([^/?#]+)\/?$/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

export function Scanner() {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const [state, setState] = useState<"starting" | "scanning" | "error" | "found">("starting");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [torch, setTorch] = useState<boolean | null>(null); // null = not supported

  const stop = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  const handle = useCallback(
    (text: string) => {
      const token = tokenFrom(text);
      if (!token) {
        setMessage(NOT_FOUND);
        return false;
      }
      setState("found");
      stop();
      router.push(`/scan/${encodeURIComponent(token)}`);
      return true;
    },
    [router, stop],
  );

  const start = useCallback(async () => {
    setState("starting");
    setCameraError(null);
    setMessage(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("เบราว์เซอร์นี้เปิดกล้องไม่ได้ (ต้องเปิดผ่าน HTTPS) ใช้ปุ่ม “เลือกรูป QR Code” แทนได้");
      setState("error");
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      stream.current = s;
      const caps = s.getVideoTracks()[0]?.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
      setTorch(caps?.torch ? false : null);
      if (video.current) {
        video.current.srcObject = s;
        await video.current.play();
      }
      setState("scanning");
    } catch (e) {
      setCameraError(CAMERA_ERROR[(e as Error).name] ?? "เปิดกล้องไม่สำเร็จ กรุณาลองใหม่ หรือใช้ปุ่ม “เลือกรูป QR Code”");
      setState("error");
    }
  }, []);

  useEffect(() => {
    // Starting the camera on mount is the point of this page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void start();
    return stop;
  }, [start, stop]);

  useEffect(() => {
    if (state !== "scanning") return;
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const v = video.current;
      if (!v || v.readyState < 2 || t - last < 120) return;
      last = t;
      const c = (canvas.current ??= document.createElement("canvas"));
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(v, 0, 0);
      const code = jsQR(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height, { inversionAttempts: "attemptBoth" });
      if (code?.data && handle(code.data)) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state, handle]);

  async function toggleTorch() {
    const track = stream.current?.getVideoTracks()[0];
    if (!track || torch === null) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch } as MediaTrackConstraintSet] });
      setTorch(!torch);
    } catch {
      setTorch(null);
    }
  }

  async function fromFile(file: File | undefined) {
    if (!file) return;
    setMessage(null);
    try {
      const bmp = await createImageBitmap(file);
      const c = document.createElement("canvas");
      const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      c.width = Math.round(bmp.width * scale);
      c.height = Math.round(bmp.height * scale);
      const ctx = c.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0, c.width, c.height);
      const code = jsQR(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height, { inversionAttempts: "attemptBoth" });
      if (!code?.data) setMessage(NOT_FOUND);
      else handle(code.data);
    } catch {
      setMessage("เปิดไฟล์รูปไม่ได้ กรุณาเลือกไฟล์รูปภาพ");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-xl border bg-sidebar sm:aspect-[4/3]">
        <video ref={video} className="size-full object-cover" playsInline muted aria-label="ภาพจากกล้อง" />
        {state === "scanning" && (
          <div className="pointer-events-none absolute inset-[15%] rounded-xl border-2 border-white/80" aria-hidden />
        )}
        {(state === "starting" || state === "found") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
            <Loader2 className="size-6 animate-spin" aria-hidden />
            <p className="text-sm">{state === "found" ? "พบ QR Code กำลังเปิด…" : "กำลังเปิดกล้อง…"}</p>
          </div>
        )}
        {state === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-white">
            <CameraOff className="size-8" aria-hidden />
            <p className="text-sm">กล้องไม่พร้อมใช้งาน</p>
          </div>
        )}
        {torch !== null && state === "scanning" && (
          <Button type="button" variant="secondary" className="absolute top-3 right-3 size-11" onClick={toggleTorch} aria-pressed={torch} aria-label={torch ? "ปิดไฟฉาย" : "เปิดไฟฉาย"}>
            {torch ? <ZapOff /> : <Zap />}
          </Button>
        )}
      </div>

      <p className="sr-only" aria-live="polite">{state === "scanning" ? "กำลังสแกน" : ""}</p>
      {cameraError && (
        <Alert variant="destructive">
          <CameraOff />
          <AlertTitle>เปิดกล้องไม่ได้</AlertTitle>
          <AlertDescription>{cameraError}</AlertDescription>
        </Alert>
      )}
      {message && (
        <Alert role="alert">
          <ScanLine />
          <AlertTitle>{message}</AlertTitle>
          <AlertDescription>QR Code นี้ไม่ใช่ของระบบ GreenFactory หรืออ่านไม่ชัด ลองสแกนใหม่ หรือบันทึกแบบเลือกเครื่องเอง</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <Button asChild variant="outline" size="lg" className="h-11">
          <label className="cursor-pointer">
            <ImageUp /> เลือกรูป QR Code
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void fromFile(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </Button>
        {state === "error" ? (
          <Button type="button" size="lg" className="h-11" onClick={() => void start()}>
            <RotateCcw /> เปิดกล้องอีกครั้ง
          </Button>
        ) : (
          <Button asChild variant="outline" size="lg" className="h-11">
            <Link href="/operator/record"><ClipboardList /> บันทึกแบบเลือกเครื่องเอง</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
