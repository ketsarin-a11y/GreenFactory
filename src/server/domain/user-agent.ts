// Tiny user-agent parser for the login log. Good enough to tell people apart, not a fingerprint.

export type Device = "Desktop" | "Mobile" | "Tablet" | "Unknown";
export type ParsedUA = { os: string; browser: string; device: Device };

const TABLET = /iPad|Tablet|PlayBook|Silk|Kindle/i;
const MOBILE = /Mobi|iPhone|iPod|Android|IEMobile|Opera Mini/i;

export function deviceOf(ua: string): Device {
  if (TABLET.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "Tablet";
  if (MOBILE.test(ua)) return "Mobile";
  return "Desktop";
}

function osOf(ua: string): string {
  let m: RegExpMatchArray | null;
  if ((m = ua.match(/Windows NT ([\d.]+)/))) {
    const v: Record<string, string> = { "10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7" };
    return `Windows ${v[m[1]] ?? m[1]}`;
  }
  if ((m = ua.match(/(?:iPhone|CPU) OS (\d+)[_\d]*/))) return `iOS ${m[1]}`;
  if (/iPad/.test(ua)) return "iPadOS";
  if ((m = ua.match(/Android (\d+(?:\.\d+)?)/))) return `Android ${m[1]}`;
  if (/CrOS/.test(ua)) return "ChromeOS";
  if ((m = ua.match(/Mac OS X (\d+)[_.](\d+)/))) return `macOS ${m[1]}.${m[2]}`;
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "ไม่ทราบ";
}

function browserOf(ua: string): string {
  // Order matters: Edge/Opera/Samsung all contain "Chrome", Chrome contains "Safari".
  const rules: [RegExp, string][] = [
    [/Edg(?:e|A|iOS)?\/(\d+)/, "Edge"],
    [/(?:OPR|Opera)\/(\d+)/, "Opera"],
    [/SamsungBrowser\/(\d+)/, "Samsung Internet"],
    [/Line\/(\d+)/, "LINE"],
    [/Firefox\/(\d+)|FxiOS\/(\d+)/, "Firefox"],
    [/Chrome\/(\d+)|CriOS\/(\d+)/, "Chrome"],
    [/Version\/(\d+).*Safari/, "Safari"],
    [/curl\/([\d.]+)/, "curl"],
  ];
  for (const [re, name] of rules) {
    const m = ua.match(re);
    if (m) return `${name} ${m[1] ?? m[2] ?? ""}`.trim();
  }
  return "ไม่ทราบ";
}

export function parseUserAgent(ua: string | null | undefined): ParsedUA {
  if (!ua) return { os: "ไม่ทราบ", browser: "ไม่ทราบ", device: "Unknown" };
  return { os: osOf(ua), browser: browserOf(ua), device: deviceOf(ua) };
}

/** Thai text for the failure codes written by src/server/auth/login.ts. */
export const LOGIN_FAILURE_LABEL: Record<string, string> = {
  MISSING_CREDENTIALS: "กรอกข้อมูลไม่ครบ",
  INVALID_CREDENTIALS: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  INVALID_ORGANIZATION: "รหัสองค์กรไม่ถูกต้อง",
  ACCOUNT_INACTIVE: "บัญชีถูกระงับหรือปิดใช้งาน",
  ACCOUNT_LOCKED: "บัญชีถูกล็อกชั่วคราว (ผิดหลายครั้ง)",
};
