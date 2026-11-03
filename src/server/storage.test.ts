import { describe, expect, it } from "vitest";
import { sniff } from "./storage";

describe("sniff", () => {
  it("detects by magic bytes, not by name", () => {
    expect(sniff(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniff(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]))).toBe("application/pdf");
    expect(sniff(new TextEncoder().encode("<html><script>"))).toBeNull();
  });
  it("requires the WEBP marker inside RIFF", () => {
    const riffWav = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45]);
    expect(sniff(riffWav)).toBeNull();
  });
});
