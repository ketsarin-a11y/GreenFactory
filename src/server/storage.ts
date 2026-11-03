import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";

// Files go to Vercel Blob (private) when BLOB_READ_WRITE_TOKEN is set — needed on serverless
// hosts with no persistent disk — otherwise to local disk under STORAGE_DIR. Either way they
// are only ever served through an authorized route.
const blobEnabled = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const ROOT = path.resolve(/* turbopackIgnore: true */ process.env.STORAGE_DIR ?? "storage");

const KINDS = {
  "image/jpeg": { ext: "jpg", magic: [0xff, 0xd8, 0xff] },
  "image/png": { ext: "png", magic: [0x89, 0x50, 0x4e, 0x47] },
  "image/webp": { ext: "webp", magic: [0x52, 0x49, 0x46, 0x46] }, // RIFF....WEBP, checked below
  "application/pdf": { ext: "pdf", magic: [0x25, 0x50, 0x44, 0x46] },
} as const;
export type FileKind = keyof typeof KINDS;

/** Detects the real type from the first bytes; the browser-provided MIME is not trusted. */
export function sniff(buf: Uint8Array): FileKind | null {
  for (const [mime, k] of Object.entries(KINDS) as [FileKind, (typeof KINDS)[FileKind]][]) {
    if (k.magic.every((b, i) => buf[i] === b)) {
      if (mime === "image/webp" && String.fromCharCode(...buf.slice(8, 12)) !== "WEBP") continue;
      return mime;
    }
  }
  return null;
}

/** Saves an upload under `folder/`. Returns the storage key to keep in the DB. */
export async function saveFile(folder: "evidence" | "avatars" | "logos" | "layouts", file: File, allowed: FileKind[], maxBytes: number) {
  if (file.size === 0) throw new Error("ไฟล์ว่างเปล่า");
  if (file.size > maxBytes) throw new Error(`ไฟล์ใหญ่เกิน ${Math.round(maxBytes / 1024 / 1024)} MB`);
  const buf = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(buf);
  if (!kind || !allowed.includes(kind)) throw new Error("ชนิดไฟล์ไม่รองรับ");
  const key = `${folder}/${randomUUID()}.${KINDS[kind].ext}`;
  if (blobEnabled()) {
    await put(key, Buffer.from(buf), { access: "private", contentType: kind, addRandomSuffix: false });
    return { key, kind };
  }
  await mkdir(path.join(/* turbopackIgnore: true */ ROOT, folder), { recursive: true });
  await writeFile(path.join(/* turbopackIgnore: true */ ROOT, key), buf);
  return { key, kind };
}

export async function readStoredFile(key: string) {
  if (blobEnabled()) {
    const r = await get(key, { access: "private" });
    if (!r) throw new Error("Not found");
    const buf = new Uint8Array(await new Response(r.stream).arrayBuffer());
    return { buf, kind: sniff(buf) ?? "application/octet-stream" };
  }
  const full = path.resolve(/* turbopackIgnore: true */ ROOT, key);
  if (!full.startsWith(ROOT + path.sep)) throw new Error("Invalid key"); // no path traversal
  const buf = await readFile(/* turbopackIgnore: true */ full);
  return { buf, kind: sniff(buf) ?? "application/octet-stream" };
}

export async function deleteStoredFile(key: string | null | undefined) {
  if (!key) return;
  if (blobEnabled()) return void (await del(key).catch(() => {}));
  const full = path.resolve(ROOT, key);
  if (full.startsWith(ROOT + path.sep)) await unlink(full).catch(() => {});
}
