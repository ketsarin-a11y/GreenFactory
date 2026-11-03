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
  const attempt = useRef(0);
  const [state, setState] = useState<"starting" | "scanning" | "error" | "found">("starting");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [torch, setTorch] = useState<boolean | null>(null); // null = not supported

  const stop = useCallback(() => {
    attempt.current++;
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
    // Only the latest attempt may update state (effects can run twice in development).
    const id = ++attempt.current;
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
      if (id !== attempt.current) {
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = s;
      const caps = s.getVideoTracks()[0]?.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
      setTorch(caps?.torch ? false : null);
      if (video.current) {
        video.current.srcObject = s;
        await video.current.play();
      }
      if (id !== attempt.current) return;
      setState("scanning");
    } catch (e) {
      if (id !== attempt.current) return;
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

  const corner = "absolute size-9 border-brand-lime";
  return (
    <div className="mx-auto max-w-xl">
      {/* Viewfinder: edge to edge on phones, dimmed outside the scan window. */}
      <div className="relative -mx-4 aspect-[3/4] overflow-hidden bg-[#050a08] sm:mx-0 sm:aspect-[4/3] sm:rounded-[14px]">
        <video ref={video} className="size-full object-cover" playsInline muted aria-label="ภาพจากกล้อง" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <div className="relative aspect-square w-[68%] max-w-72 rounded-[14px] shadow-[0_0_0_100vmax_rgb(5_10_8/0.55)]">
            <span className={`${corner} top-0 left-0 rounded-tl-[14px] border-t-4 border-l-4`} />
            <span className={`${corner} top-0 right-0 rounded-tr-[14px] border-t-4 border-r-4`} />
            <span className={`${corner} bottom-0 left-0 rounded-bl-[14px] border-b-4 border-l-4`} />
            <span className={`${corner} right-0 bottom-0 rounded-br-[14px] border-r-4 border-b-4`} />
          </div>
        </div>

        <p className="absolute inset-x-0 top-0 px-4 pt-4 text-center text-sm font-medium text-white">
          {state === "scanning" ? "วาง QR Code ให้อยู่ในกรอบ" : state === "found" ? "พบ QR Code กำลังเปิด…" : state === "starting" ? "กำลังเปิดกล้อง…" : ""}
        </p>
        {(state === "starting" || state === "found") && (
          <div className="absolute inset-0 flex items-center justify-center text-white" aria-hidden>
            <Loader2 className="size-7 animate-spin" />
          </div>
        )}
        {state === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-8 text-center text-white">
            <CameraOff className="size-8" aria-hidden />
            <p className="font-medium">กล้องไม่พร้อมใช้งาน</p>
            <p className="text-sm text-white/70">อ่านวิธีแก้ด้านล่าง หรือเลือกรูป QR Code แทน</p>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4">
          <Button asChild variant="secondary" className="h-12 gap-2 rounded-full bg-black/55 px-4 text-white hover:bg-black/70">
            <label className="cursor-pointer">
              <ImageUp /> เลือกรูป
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void fromFile(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
          </Button>
          {state === "scanning" && (
            <Button
              type="button"
              variant="secondary"
              className={`size-12 rounded-full ${torch ? "bg-white text-black hover:bg-white/90" : "bg-black/55 text-white hover:bg-black/70"}`}
              onClick={toggleTorch}
              disabled={torch === null}
              aria-pressed={!!torch}
              aria-label={torch === null ? "อุปกรณ์นี้ไม่มีไฟฉาย" : torch ? "ปิดไฟฉาย" : "เปิดไฟฉาย"}
              title={torch === null ? "อุปกรณ์นี้ไม่มีไฟฉาย" : undefined}
            >
              {torch ? <ZapOff /> : <Zap />}
            </Button>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{state === "scanning" ? "กำลังสแกน" : ""}</p>

      <div className="mt-4 space-y-4">
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
            <AlertDescription>QR Code นี้ไม่ใช่ของระบบ GreenFactory หรืออ่านไม่ชัด ลองสแกนใหม่ หรือบันทึกโดยเลือกเครื่องเอง</AlertDescription>
          </Alert>
        )}

        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-3"><span className="font-display font-semibold text-foreground tabular">1</span>ถือโทรศัพท์ห่างจากป้าย QR ประมาณหนึ่งฝ่ามือ</li>
          <li className="flex gap-3"><span className="font-display font-semibold text-foreground tabular">2</span>ให้ QR อยู่ในกรอบ ระบบจะเปิดหน้าบันทึกเอง ไม่ต้องกดถ่าย</li>
          <li className="flex gap-3"><span className="font-display font-semibold text-foreground tabular">3</span>ที่มืดหรือป้ายสะท้อนแสง กดปุ่มไฟฉายหรือเอียงโทรศัพท์เล็กน้อย</li>
        </ol>

        {state === "error" ? (
          <Button type="button" size="lg" className="h-11 w-full" onClick={() => void start()}>
            <RotateCcw /> เปิดกล้องอีกครั้ง
          </Button>
        ) : (
          <Button asChild variant="outline" size="lg" className="h-11 w-full">
            <Link href="/operator/record"><ClipboardList /> สแกนไม่ได้ บันทึกโดยเลือกเครื่องเอง</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
