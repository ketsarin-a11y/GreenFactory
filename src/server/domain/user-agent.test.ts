import { describe, expect, it } from "vitest";
import { parseUserAgent } from "./user-agent";

describe("parseUserAgent", () => {
  it("reads desktop Chrome on Windows", () => {
    expect(
      parseUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"),
    ).toEqual({ os: "Windows 10/11", browser: "Chrome 130", device: "Desktop" });
  });

  it("reads Safari on iPhone as mobile", () => {
    expect(
      parseUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"),
    ).toEqual({ os: "iOS 17", browser: "Safari 17", device: "Mobile" });
  });

  it("reads an Android tablet (no 'Mobile' token) as tablet", () => {
    const r = parseUserAgent("Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36");
    expect(r).toEqual({ os: "Android 14", browser: "Chrome 129", device: "Tablet" });
  });

  it("reads an Android phone with Samsung Internet", () => {
    const r = parseUserAgent("Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36");
    expect(r).toEqual({ os: "Android 13", browser: "Samsung Internet 25", device: "Mobile" });
  });

  it("does not mistake Edge or Firefox for Chrome, and reads macOS", () => {
    expect(parseUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0").browser).toBe("Edge 130");
    expect(parseUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0")).toEqual({
      os: "macOS 10.15",
      browser: "Firefox 131",
      device: "Desktop",
    });
  });

  it("reads iPad as tablet", () => {
    expect(parseUserAgent("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1").device).toBe("Tablet");
  });

  it("handles a missing or unknown agent", () => {
    expect(parseUserAgent(null)).toEqual({ os: "ไม่ทราบ", browser: "ไม่ทราบ", device: "Unknown" });
    expect(parseUserAgent("vitest")).toEqual({ os: "ไม่ทราบ", browser: "ไม่ทราบ", device: "Desktop" });
  });
});
