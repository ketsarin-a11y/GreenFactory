"use client";

import { useEffect, useRef, useState } from "react";
export type GFayState =
  | "idle"
  | "friendly"
  | "thinking"
  | "analyzing"
  | "alert"
  | "recommend"
  | "success";
type GFayMascotProps = {
  state?: GFayState;
  size?: "sm" | "md" | "lg" | "hero";
  showStatus?: boolean;
  className?: string;
};
const STATE_CONFIG: Record<
  GFayState,
  {
    label: string;
    message: string;
    symbol: string;
    glow: string;
    badge: string;
  }
> = {
  idle: {
    label: "พร้อมช่วยเหลือ",
    message: "G-Fay พร้อมดูแลโรงงานค่ะ",
    symbol: "🌱",
    glow: "gfay-glow-green",
    badge: "gfay-badge-green",
  },
  friendly: {
    label: "สวัสดีค่ะ",
    message: "มีอะไรให้ G-Fay ช่วยไหมคะ?",
    symbol: "👋",
    glow: "gfay-glow-green",
    badge: "gfay-badge-green",
  },
  thinking: {
    label: "กำลังคิด",
    message: "ขอ G-Fay คิดสักครู่นะคะ",
    symbol: "?",
    glow: "gfay-glow-blue",
    badge: "gfay-badge-blue",
  },
  analyzing: {
    label: "กำลังวิเคราะห์",
    message: "กำลังตรวจสอบข้อมูลโรงงาน...",
    symbol: "◫",
    glow: "gfay-glow-cyan",
    badge: "gfay-badge-cyan",
  },
  alert: {
    label: "พบสิ่งที่ควรตรวจสอบ",
    message: "G-Fay พบข้อมูลที่ต้องให้ความสนใจ",
    symbol: "!",
    glow: "gfay-glow-red",
    badge: "gfay-badge-red",
  },
  recommend: {
    label: "มีคำแนะนำ",
    message: "G-Fay มีแนวทางที่น่าสนใจค่ะ",
    symbol: "💡",
    glow: "gfay-glow-yellow",
    badge: "gfay-badge-yellow",
  },
  success: {
    label: "เรียบร้อย",
    message: "วิเคราะห์ข้อมูลเสร็จแล้วค่ะ",
    symbol: "✓",
    glow: "gfay-glow-green",
    badge: "gfay-badge-green",
  },
};
const SIZE_CLASS = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-32 w-32",
  hero: "h-48 w-48 sm:h-56 sm:w-56",
};

export default function GFayMascot({
  state = "idle",
  size = "md",
  showStatus = false,
  className = "",
}: GFayMascotProps) {
  const config = STATE_CONFIG[state];
  const busy = state === "thinking" || state === "analyzing";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // A canvas retains one frame: the source GIF cannot keep animating onscreen.
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) {
        setImageError(true);
        return;
      }
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      try {
        context.drawImage(image, 0, 0);
        setImageError(false);
      } catch {
        setImageError(true);
      }
    };
    image.onerror = () => { if (!cancelled) setImageError(true); };
    image.src = "/images/g-fay.gif";
    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, []);

  return (
    <div className={`gfay-root ${className}`} data-state={state}
      aria-label={`G-Fay ${config.label}`}>
      <div className={`gfay-stage gfay-size-${size}`}>
        <div className="gfay-backdrop" aria-hidden="true" />
        <span className="gfay-spark gfay-spark-left" aria-hidden="true">✦</span>
        <span className="gfay-spark gfay-spark-right" aria-hidden="true">✧</span>
        <div className={`gfay-ambient ${config.glow}`} aria-hidden="true" />
        <div className={`gfay-character gfay-${state}`}>
          <div className={`gfay-image-wrap ${SIZE_CLASS[size]}`}>
            <canvas ref={canvasRef} className="gfay-image" role="img"
              aria-label="G-Fay - GreenFactory Assistant for You" hidden={imageError} />
            {imageError && <span className="gfay-fallback">G-Fay 🌱</span>}
          </div>
          <div className="gfay-shadow" aria-hidden="true" />
        </div>
        {state !== "idle" && (
          <div key={`symbol-${state}`} className={`gfay-state-symbol ${config.badge} ${busy ? "" : "gfay-symbol-enter"}`}
            aria-hidden="true">
            {busy ? <span className="gfay-dots"><i /><i /><i /></span> : config.symbol}
          </div>
        )}
      </div>
      {showStatus && (
        <div className="gfay-status">
          <div className="gfay-status-title">
            <span className="gfay-online-dot" aria-hidden="true" />
            <strong>G-Fay</strong>
            <span className={`gfay-status-badge ${config.badge}`}>{config.label}</span>
          </div>
          <p>{config.message}</p>
        </div>
      )}
      <style jsx>{`
        .gfay-root { display:inline-flex; flex-direction:column; align-items:center; justify-content:center; position:relative; isolation:isolate; max-width:100%; }
        .gfay-stage { position:relative; display:flex; align-items:center; justify-content:center; padding:22px 24px 18px; }
        .gfay-backdrop { position:absolute; inset:12% 5% 7%; border-radius:48% 52% 46% 54%; background:linear-gradient(145deg,#f0fdf4 5%,#e0f2fe 65%,#fef9c3); border:1px solid rgba(255,255,255,.9); box-shadow:inset 0 2px 18px rgba(255,255,255,.8); opacity:.75; }
        .gfay-spark { position:absolute; z-index:2; font-size:20px; line-height:1; color:#6ee7b7; }
        .gfay-spark-left { left:8%; top:25%; transform:rotate(-12deg); }
        .gfay-spark-right { right:9%; bottom:25%; color:#7dd3fc; font-size:15px; }
        .gfay-size-sm { padding:6px; }
        .gfay-size-md { padding:12px; }
        .gfay-size-sm .gfay-backdrop, .gfay-size-sm .gfay-spark, .gfay-size-md .gfay-spark { display:none; }
        .gfay-size-sm .gfay-state-symbol { min-width:22px; height:22px; font-size:11px; border-width:2px; right:-2px; top:-2px; padding:0 4px; }
        .gfay-character { position:relative; z-index:10; transform-origin:50% 80%; }
        .gfay-image-wrap { position:relative; display:flex; align-items:center; justify-content:center; }
        .gfay-image { width:100%; height:100%; object-fit:contain; user-select:none; pointer-events:none; filter:drop-shadow(0 10px 14px rgba(15,118,110,.14)); }
        .gfay-image[hidden] { display:none; }
        .gfay-fallback { font-size:16px; font-weight:700; color:#047857; }
        .gfay-shadow { position:absolute; left:15%; right:15%; bottom:-7px; height:12px; border-radius:50%; background:radial-gradient(ellipse,rgba(15,118,110,.18),rgba(15,118,110,0) 72%); }
        .gfay-ambient { position:absolute; width:70%; height:70%; border-radius:999px; filter:blur(25px); opacity:.25; }
        .gfay-glow-green { background:#6ee7b7; }
        .gfay-glow-blue { background:#93c5fd; }
        .gfay-glow-cyan { background:#67e8f9; }
        .gfay-glow-red { background:#fda4af; }
        .gfay-glow-yellow { background:#fde68a; }
        .gfay-state-symbol { position:absolute; z-index:20; top:3px; right:0; min-width:34px; height:34px; padding:0 8px; border:3px solid white; border-radius:15px 15px 15px 5px; display:flex; align-items:center; justify-content:center; font-size:17px; font-weight:800; box-shadow:0 5px 16px rgba(15,23,42,.1); }
        .gfay-badge-green { color:#047857; background:#d1fae5; }
        .gfay-badge-blue { color:#1d4ed8; background:#dbeafe; }
        .gfay-badge-cyan { color:#0e7490; background:#cffafe; }
        .gfay-badge-red { color:#be123c; background:#ffe4e6; }
        .gfay-badge-yellow { color:#a16207; background:#fef9c3; }
        /* Only the small dots loop, and only while a request is pending. */
        .gfay-symbol-enter { animation:gfayBadge .45s ease-out 1; }
        .gfay-dots { display:flex; gap:3px; }
        .gfay-dots i { width:4px; height:4px; border-radius:50%; background:currentColor; animation:gfayDot 1.6s ease-in-out infinite; }
        .gfay-dots i:nth-child(2) { animation-delay:.18s; }
        .gfay-dots i:nth-child(3) { animation-delay:.36s; }
        .gfay-thinking { transform:rotate(-3deg); }
        .gfay-analyzing { transform:rotate(2deg); }
        /* Each response reacts once, then holds a quiet pose until the next state. */
        .gfay-friendly { animation:gfayHello .9s ease-in-out 1; }
        .gfay-alert { transform:rotate(2deg); animation:gfayAttention .7s ease-in-out 1; }
        .gfay-recommend { transform:rotate(-3deg); animation:gfayIdea .9s ease-in-out 1; }
        .gfay-success { animation:gfayNod .85s ease-in-out 1; }
        .gfay-status { position:relative; margin-top:12px; padding:13px 17px; text-align:center; max-width:280px; border:1px solid #e2eee9; border-radius:20px; background:linear-gradient(145deg,#fff,#f8fdfb); box-shadow:0 5px 18px rgba(15,118,110,.05); }
        .gfay-status::before { content:""; position:absolute; top:-6px; left:calc(50% - 6px); width:11px; height:11px; background:#fff; border-top:1px solid #e2eee9; border-left:1px solid #e2eee9; transform:rotate(45deg); }
        .gfay-status-title { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:7px; font-size:16px; color:#334155; }
        .gfay-online-dot { width:7px; height:7px; border-radius:50%; background:#10b981; }
        .gfay-status-badge { padding:4px 9px; border-radius:999px; font-size:13px; font-weight:600; }
        .gfay-status p { margin:7px 0 0; font-size:15px; line-height:1.65; color:#64748b; }
        @keyframes gfayBadge { from { opacity:0; transform:translateY(3px) scale(.95); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes gfayDot { 0%,100% { opacity:.35; } 50% { opacity:1; } }
        @keyframes gfayHello { 0%,100% { transform:rotate(0); } 35% { transform:rotate(-4deg); } 70% { transform:rotate(3deg); } }
        @keyframes gfayAttention { 0% { transform:rotate(0); } 45% { transform:rotate(2deg) scale(1.015); } 100% { transform:rotate(2deg); } }
        @keyframes gfayIdea { 0% { transform:rotate(0); } 45% { transform:rotate(-4deg) translateY(-2px); } 100% { transform:rotate(-3deg); } }
        @keyframes gfayNod { 0%,100% { transform:translateY(0); } 40% { transform:translateY(3px) rotate(2deg); } 70% { transform:translateY(-1px); } }
        @media (prefers-reduced-motion:reduce) {
          .gfay-character, .gfay-dots i, .gfay-symbol-enter { animation:none !important; transform:none !important; }
        }
      `}</style>
    </div>
  );
}
