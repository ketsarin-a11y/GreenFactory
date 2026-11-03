import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "GreenFactory Insight สแกน QR ตรงมิเตอร์ แล้วเห็นพลังงานและคาร์บอนของทุกสายการผลิต";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori doesn't line-break Thai (no spaces between words), so the lines are set by hand.
// It also can't stack a tone mark over an upper vowel (ที่, เครื่อง render without the tone mark),
// so this copy avoids those clusters on purpose.
const HEADLINE = ["สแกน QR ตรงมิเตอร์", "แล้วเห็นพลังงานและคาร์บอน", "ของทุกสายการผลิต"];
const SUB = "ไฟฟ้า น้ำ ก๊าซ ดีเซล และคาร์บอน ในระบบเดียว";

/** Bai Jamjuree from Google Fonts (full file: the text= subset drops the stacked tone-mark positioning). Satori has no Thai font built in. */
async function baiJamjuree(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@600")).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [font, mark] = await Promise.all([
    baiJamjuree(),
    readFile(join(process.cwd(), "public/images/logo-mark.png")).then((b) => `data:image/png;base64,${b.toString("base64")}`),
  ]);
  // Without the Thai font (offline build), fall back to an English line rather than tofu boxes.
  const headline = font ? HEADLINE : ["Scan the meter QR.", "See energy and carbon", "for every production line."];
  const sub = font ? SUB : "Electricity, water, fuel and carbon for Thai factories";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#073d2d", color: "#ffffff", padding: "56px 72px", fontFamily: font ? "Bai Jamjuree" : undefined }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 68, height: 68, borderRadius: 14, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={mark} width={47} height={36} alt="" />
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, display: "flex" }}>GreenFactory Insight</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 62, fontWeight: 600, lineHeight: 1.3, display: "flex", flexDirection: "column" }}>
            {headline.map((l) => <div key={l} style={{ display: "flex" }}>{l}</div>)}
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.72)", display: "flex" }}>{sub}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#9ccb12" }} />
          <div style={{ width: 220, height: 3, background: "rgba(255,255,255,0.18)" }} />
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Bai Jamjuree", data: font, weight: 600, style: "normal" }] : [] },
  );
}
