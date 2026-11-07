"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

const OPTS = { errorCorrectionLevel: "H" as const, margin: 1, color: { dark: "#062e22", light: "#ffffff" } };

export const scanUrl = (token: string) => `${process.env.NEXT_PUBLIC_APP_URL ?? (typeof window === "undefined" ? "" : window.location.origin)}/scan/${token}`;
export const qrDataUrl = (token: string, width = 1024) => QRCode.toDataURL(scanUrl(token), { ...OPTS, width });

/** QR drawn in the browser from the scan URL (ECC H, deep-forest modules). */
export function QrImage({ token, size, className, alt }: { token: string; size: number; className?: string; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    qrDataUrl(token, Math.max(256, size * 3)).then((u) => live && setSrc(u));
    return () => { live = false; };
  }, [token, size]);
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} width={size} height={size} alt={alt} className={className} /> : <span className={className} style={{ display: "inline-block", width: size, height: size }} aria-hidden />;
}

export async function downloadQrPng(token: string, fileName: string) {
  const a = document.createElement("a");
  a.href = await qrDataUrl(token);
  a.download = fileName;
  a.click();
}
