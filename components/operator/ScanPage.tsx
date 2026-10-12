"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";

import {

  useEffect,

  useRef,

  useState,

  type ChangeEvent,

} from "react";

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

type EquipmentListItem = {

  equipmentId: number | string;

  equipmentCode: string | null;

  name: string;

  equipmentType?: string | null;

  productionLine?: string | null;

  department?: string | null;

  location?: string | null;

  status: string;

};

type ScanState = "idle" | "success" | "not_found";

interface ScanPageProps {

  equipmentList: EquipmentListItem[];

}

export default function ScanPage({

  equipmentList,

}: ScanPageProps) {

  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const galleryInputRef =

    useRef<HTMLInputElement>(null);

  const streamRef =

    useRef<MediaStream | null>(null);

  const trackRef =

    useRef<MediaStreamTrack | null>(null);

  const frameRef = useRef<number | null>(null);

  const detectedRef = useRef(false);

  const [cameraError, setCameraError] = useState("");

  const [cameraLoading, setCameraLoading] = useState(true);

  const [torchSupported, setTorchSupported] =

    useState(false);

  const [torchOn, setTorchOn] = useState(false);

  const [scanState, setScanState] =

    useState<ScanState>("idle");

  const [matchedEquipment, setMatchedEquipment] =

    useState<EquipmentListItem | null>(null);

  const [lastScannedCode, setLastScannedCode] =

    useState("");

  function stopCamera() {

    if (frameRef.current !== null) {

      window.cancelAnimationFrame(frameRef.current);

      frameRef.current = null;

    }

    if (streamRef.current) {

      streamRef.current

        .getTracks()

        .forEach((track) => track.stop());

      streamRef.current = null;

    }

    trackRef.current = null;

    setTorchSupported(false);

    setTorchOn(false);

  }

  function handleCodeDetected(code: string) {

    if (detectedRef.current) return;

    const trimmed = code.trim();

    if (!trimmed) return;

    detectedRef.current = true;

    setLastScannedCode(trimmed);

    try {

      const url = new URL(

        trimmed,

        window.location.origin,

      );

      const match = url.pathname.match(

        /^\/scan\/([^/?#]+)\/?$/i,

      );

      if (match?.[1]) {

        const token =

          decodeURIComponent(match[1]).trim();

        if (token) {

          setScanState("success");

          stopCamera();

          router.push(

            `/scan/${encodeURIComponent(token)}`,

          );

          return;

        }

      }

    } catch {

      // QR รุ่นเก่าอาจเป็นรหัสเครื่องโดยตรง

    }

    const legacyMatch = equipmentList.find(

      (equipment) =>

        equipment.equipmentCode

          ?.trim()

          .toLowerCase() === trimmed.toLowerCase(),

    );

    setMatchedEquipment(legacyMatch ?? null);

    setScanState(

      legacyMatch ? "success" : "not_found",

    );

    if (legacyMatch) {

      stopCamera();

    }

    window.setTimeout(() => {

      detectedRef.current = false;

    }, 1000);

  }

  useEffect(() => {

    let cancelled = false;

    async function startCamera() {

      setCameraLoading(true);

      setCameraError("");

      if (

        typeof navigator === "undefined" ||

        !navigator.mediaDevices ||

        !navigator.mediaDevices.getUserMedia

      ) {

        setCameraLoading(false);

        setCameraError(

          "Browser นี้ไม่รองรับการใช้งานกล้อง กรุณาเลือกภาพ QR Code จากเครื่องแทน",

        );

        return;

      }

      try {

        const stream =

          await navigator.mediaDevices.getUserMedia({

            video: {

              facingMode: {

                ideal: "environment",

              },

            },

            audio: false,

          });

        if (cancelled) {

          stream

            .getTracks()

            .forEach((track) => track.stop());

          return;

        }

        streamRef.current = stream;

        const track = stream.getVideoTracks()[0];

        trackRef.current = track ?? null;

        if (track) {

          try {

            const capabilities =

              track.getCapabilities() as MediaTrackCapabilities & {

                torch?: boolean;

              };

            setTorchSupported(

              Boolean(capabilities.torch),

            );

          } catch {

            setTorchSupported(false);

          }

        }

        const video = videoRef.current;

        if (!video) {

          stopCamera();

          return;

        }

        video.srcObject = stream;

        video.muted = true;

        video.playsInline = true;

        await video.play();

        setCameraLoading(false);

        scanFrame();

      } catch (error: unknown) {

        setCameraLoading(false);

        const cameraException =

          error instanceof DOMException

            ? error

            : null;

        if (

          cameraException?.name ===

            "NotAllowedError" ||

          cameraException?.name ===

            "PermissionDeniedError"

        ) {

          setCameraError(

            "ยังไม่ได้อนุญาตการใช้กล้อง กรุณาเปิดสิทธิ์ Camera ใน Browser หรือเลือกภาพ QR Code จากเครื่องแทน",

          );

          return;

        }

        if (

          cameraException?.name ===

          "NotFoundError"

        ) {

          setCameraError(

            "ไม่พบกล้องในอุปกรณ์นี้ กรุณาเลือกภาพ QR Code จากเครื่องแทน",

          );

          return;

        }

        if (

          cameraException?.name ===

          "NotReadableError"

        ) {

          setCameraError(

            "ไม่สามารถใช้งานกล้องได้ อาจมีโปรแกรมอื่นกำลังใช้กล้องอยู่",

          );

          return;

        }

        setCameraError(

          "ไม่สามารถเปิดกล้องได้ กรุณาเลือกภาพ QR Code จากเครื่องแทน",

        );

      }

    }

    function scanFrame() {

      if (

        cancelled ||

        detectedRef.current ||

        scanState !== "idle"

      ) {

        return;

      }

      const video = videoRef.current;

      const canvas = canvasRef.current;

      if (

        video &&

        canvas &&

        video.readyState >=

          HTMLMediaElement.HAVE_ENOUGH_DATA &&

        video.videoWidth > 0 &&

        video.videoHeight > 0

      ) {

        canvas.width = video.videoWidth;

        canvas.height = video.videoHeight;

        const context =

          canvas.getContext("2d", {

            willReadFrequently: true,

          });

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

            {

              inversionAttempts:

                "attemptBoth",

            },

          );

          if (result?.data) {

            handleCodeDetected(result.data);

            return;

          }

        }

      }

      frameRef.current =

        window.requestAnimationFrame(scanFrame);

    }

    if (scanState === "idle") {

      detectedRef.current = false;

      void startCamera();

    }

    return () => {

      cancelled = true;

      if (frameRef.current !== null) {

        window.cancelAnimationFrame(

          frameRef.current,

        );

        frameRef.current = null;

      }

      streamRef.current

        ?.getTracks()

        .forEach((track) => track.stop());

      streamRef.current = null;

      trackRef.current = null;

    };

  }, [scanState]);

  async function toggleTorch() {

    const track = trackRef.current;

    if (!track || !torchSupported) return;

    const next = !torchOn;

    try {

      const constraints = {

        advanced: [

          {

            torch: next,

          },

        ],

      } as unknown as MediaTrackConstraints;

      await track.applyConstraints(constraints);

      setTorchOn(next);

    } catch {

      setTorchSupported(false);

      setTorchOn(false);

    }

  }

  function handleGalleryPick(

    event: ChangeEvent<HTMLInputElement>,

  ) {

    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

      if (typeof reader.result !== "string") {

        return;

      }

      const image = new window.Image();

      image.onload = () => {

        const canvas =

          document.createElement("canvas");

        canvas.width =

          image.naturalWidth || image.width;

        canvas.height =

          image.naturalHeight || image.height;

        const context =

          canvas.getContext("2d", {

            willReadFrequently: true,

          });

        if (!context) {

          setScanState("not_found");

          return;

        }

        context.drawImage(

          image,

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

          {

            inversionAttempts:

              "attemptBoth",

          },

        );

        if (result?.data) {

          detectedRef.current = false;

          handleCodeDetected(result.data);

          return;

        }

        setMatchedEquipment(null);

        setLastScannedCode("");

        setScanState("not_found");

      };

      image.onerror = () => {

        setMatchedEquipment(null);

        setLastScannedCode("");

        setScanState("not_found");

      };

      image.src = reader.result;

    };

    reader.readAsDataURL(file);

  }

  function handleRescan() {

    stopCamera();

    detectedRef.current = false;

    setMatchedEquipment(null);

    setLastScannedCode("");

    setCameraError("");

    setScanState("idle");

  }

  return (

    <div className="min-w-0 space-y-4 pb-6 sm:space-y-5 sm:pb-8">

      <section className="flex min-w-0 flex-col gap-4 rounded-[20px] border border-slate-200 bg-white px-4 py-4 shadow-sm sm:rounded-3xl sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between">

        <div className="flex min-w-0 items-center gap-3 sm:gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 sm:h-12 sm:w-12">

            <ScanLine className="h-5 w-5" />

          </div>

          <div>

            <h1 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">

              สแกน QR Code

            </h1>

            <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">

              สแกนรหัสบนเครื่องจักรเพื่อเริ่มบันทึกข้อมูล

            </p>

          </div>

        </div>

        <button

          type="button"

          onClick={() =>

            galleryInputRef.current?.click()

          }

          className="inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition active:scale-[0.99] hover:bg-slate-50 md:h-10 md:w-auto"

        >

          <ImageIcon className="h-4 w-4 text-violet-500" />

          เลือกรูป QR

        </button>

      </section>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">

        <div className="min-w-0 space-y-4">

          <section className="min-w-0 overflow-hidden rounded-[20px] border border-slate-200 bg-white p-2 shadow-sm sm:rounded-3xl sm:p-3">

            <div className="relative aspect-[4/3] min-h-[260px] w-full overflow-hidden rounded-[16px] bg-slate-950 sm:min-h-0 sm:rounded-[20px]">

              <video

                ref={videoRef}

                muted

                playsInline

                className={`h-full w-full object-cover ${

                  cameraError ? "hidden" : ""

                }`}

              />

              <canvas

                ref={canvasRef}

                className="hidden"

              />

              {cameraLoading && !cameraError && (

                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">

                  <Loader />

                  <p className="mt-3 text-sm text-white/70">

                    กำลังเปิดกล้อง...

                  </p>

                </div>

              )}

              {cameraError ? (

                <CameraError

                  message={cameraError}

                  onOpenGallery={() =>

                    galleryInputRef.current?.click()

                  }

                />

              ) : (

                !cameraLoading && (

                  <>

                    <div className="absolute left-3 top-3 sm:left-4 sm:top-4">

                      <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[11px] text-white backdrop-blur">

                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                        กำลังสแกน

                      </span>

                    </div>

                    {torchSupported && (

                      <button

                        type="button"

                        onClick={() =>

                          void toggleTorch()

                        }

                        className="absolute right-3 top-3 flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition active:scale-95 sm:right-4 sm:top-4 sm:h-10 sm:w-10"

                      >

                        {torchOn ? (

                          <FlashlightOff className="h-4 w-4" />

                        ) : (

                          <Flashlight className="h-4 w-4" />

                        )}

                      </button>

                    )}

                    {scanState === "idle" && (

                      <ScannerFrame />

                    )}

                  </>

                )

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

          <section className="flex min-w-0 gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-3.5 py-3.5 sm:px-4">

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-500">

              <Lightbulb className="h-4 w-4" />

            </span>

            <div>

              <p className="text-sm font-semibold text-slate-700">

                สแกนให้ง่ายขึ้น

              </p>

              <p className="mt-1 break-words text-xs leading-5 text-slate-500">

                วาง QR Code ให้อยู่กลางกรอบ

                หากไม่สามารถใช้กล้องได้สามารถเลือกภาพ QR

                จากเครื่องได้

              </p>

            </div>

          </section>

        </div>

        <aside className="min-w-0">

          {scanState === "idle" && <IdleState />}

          {scanState === "not_found" && (

            <NotFoundState

              value={lastScannedCode}

              onRescan={handleRescan}

            />

          )}

          {scanState === "success" &&

            matchedEquipment && (

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

  const corner =

    "absolute h-10 w-10 border-emerald-400";

  return (

    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

      <div className="relative h-[min(64vw,260px)] w-[min(64vw,260px)] sm:h-[280px] sm:w-[280px]">

        <span

          className={`${corner} left-0 top-0 rounded-tl-xl border-l-4 border-t-4`}

        />

        <span

          className={`${corner} right-0 top-0 rounded-tr-xl border-r-4 border-t-4`}

        />

        <span

          className={`${corner} bottom-0 left-0 rounded-bl-xl border-b-4 border-l-4`}

        />

        <span

          className={`${corner} bottom-0 right-0 rounded-br-xl border-b-4 border-r-4`}

        />

        <span className="absolute left-5 right-5 top-1/2 h-[2px] bg-emerald-400" />

        <div className="absolute -bottom-14 left-1/2 w-[min(82vw,320px)] -translate-x-1/2 text-center sm:-bottom-16">

          <p className="text-sm font-semibold text-white">

            วาง QR Code ให้อยู่ในกรอบ

          </p>

        </div>

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

    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto px-4 py-5 text-center sm:px-8">

      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">

        <AlertCircle className="h-6 w-6" />

      </span>

      <p className="mt-3 max-w-sm break-words text-xs leading-5 text-slate-300 sm:mt-4 sm:text-sm sm:leading-6">

        {message}

      </p>

      <button

        type="button"

        onClick={onOpenGallery}

        className="mt-4 flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition active:scale-[0.99] sm:mt-5"

      >

        <ImageIcon className="h-4 w-4 text-violet-500" />

        เลือกภาพ QR จากเครื่อง

      </button>

    </div>

  );

}

function IdleState() {

  return (

    <section className="min-w-0 rounded-[20px] border border-slate-200 bg-white shadow-sm sm:rounded-3xl">

      <div className="border-b px-4 py-4 sm:px-5">

        <p className="text-sm font-bold">

          ผลการสแกน

        </p>

      </div>

      <div className="flex min-h-[220px] flex-col items-center justify-center px-5 py-8 text-center sm:min-h-[300px] sm:px-7">

        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">

          <Sparkles className="h-7 w-7" />

        </span>

        <p className="mt-5 text-sm font-semibold">

          พร้อมสำหรับการสแกน

        </p>

        <p className="mt-2 text-xs text-slate-400">

          เล็งกล้องไปที่ QR Code บนเครื่องจักร

        </p>

      </div>

    </section>

  );

}

function NotFoundState({

  value,

  onRescan,

}: {

  value: string;

  onRescan: () => void;

}) {

  return (

    <section className="min-w-0 rounded-[20px] border border-amber-200 bg-white p-4 sm:rounded-3xl sm:p-5">

      <AlertCircle className="h-8 w-8 text-amber-500" />

      <p className="mt-3 font-bold text-amber-800">

        ไม่พบข้อมูล QR Code

      </p>

      {value && (

        <p className="mt-3 break-all rounded-xl bg-slate-50 p-3 text-xs text-slate-500">

          {value}

        </p>

      )}

      <button

        type="button"

        onClick={onRescan}

        className="mt-5 flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white transition active:scale-[0.99] sm:h-11"

      >

        <RotateCcw className="h-4 w-4" />

        สแกนใหม่

      </button>

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

    <section className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">

      <div className="flex items-center gap-2 text-emerald-700">

        <CheckCircle2 className="h-5 w-5" />

        <p className="font-bold">สแกนสำเร็จ</p>

      </div>

      <div className="mt-5 flex min-w-0 gap-3">

        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

          <Package className="h-5 w-5" />

        </span>

        <div>

          <p className="font-bold text-slate-900">

            {equipment.name}

          </p>

          <p className="mt-0.5 break-all text-xs text-slate-400">

            {equipment.equipmentCode}

          </p>

        </div>

      </div>

      <div className="mt-5 space-y-1">

        <DetailRow

          icon={Wrench}

          label="ประเภท"

          value={equipment.equipmentType ?? "-"}

        />

        <DetailRow

          icon={Workflow}

          label="Production Line"

          value={equipment.productionLine ?? "-"}

        />

        <DetailRow

          icon={Building2}

          label="แผนก"

          value={equipment.department ?? "-"}

        />

        <DetailRow

          icon={MapPin}

          label="ตำแหน่ง"

          value={equipment.location ?? "-"}

        />

        <DetailRow

          icon={CircleDot}

          label="สถานะ"

          value={equipment.status}

        />

      </div>

      <Link

        href={`/operator/record?equipment=${equipment.equipmentId}`}

        className="mt-5 flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-center text-sm font-semibold text-white transition active:scale-[0.99] sm:min-h-11"

      >

        <PenLine className="h-4 w-4" />

        บันทึกการใช้ทรัพยากร

      </Link>

      <button

        type="button"

        onClick={onRescan}

        className="mt-2 flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold text-slate-600 transition active:scale-[0.99] sm:h-11"

      >

        <RotateCcw className="h-4 w-4" />

        สแกนเครื่องอื่น

      </button>

    </section>

  );

}

function DetailRow({

  icon: Icon,

  label,

  value,

}: {

  icon: LucideIcon;

  label: string;

  value: string;

}) {

  return (

    <div className="flex min-w-0 items-start gap-3 rounded-xl px-1 py-2 sm:items-center sm:px-2">

      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 sm:mt-0" />

      <span className="min-w-0 flex-1 text-xs text-slate-400">

        {label}

      </span>

      <span className="max-w-[58%] break-words text-right text-xs font-semibold text-slate-700 sm:max-w-[55%] sm:text-sm">

        {value}

      </span>

    </div>

  );

}

function Loader() {

  return (

    <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />

  );

}
