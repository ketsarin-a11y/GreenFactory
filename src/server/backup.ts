import "server-only";
import { execFile, spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { open, stat } from "node:fs/promises";
import path from "node:path";

/** mysqldump writes this as its last line only when the dump finished without error. */
export const DUMP_COMPLETE_MARKER = "-- Dump completed";

export const backupDir = () => path.resolve(/* turbopackIgnore: true */ process.env.BACKUP_DIR || "./storage/backups");
export const mysqldumpBin = () => process.env.MYSQLDUMP_PATH || "mysqldump";
export const mysqlBin = () => process.env.MYSQL_PATH || "mysql";

export type DbTarget = { host: string; port: number; user: string; password: string; database: string };

export function dbTarget(url = process.env.DATABASE_URL): DbTarget {
  if (!url) throw new Error("DATABASE_URL is not set");
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: decodeURIComponent(u.pathname.slice(1)),
  };
}

/** Password is never on the command line (visible in `ps`); it goes in MYSQL_PWD. */
export function dumpArgs(t: DbTarget): string[] {
  return [
    `--host=${t.host}`,
    `--port=${t.port}`,
    `--user=${t.user}`,
    "--single-transaction",
    "--quick",
    "--routines",
    "--triggers",
    "--events",
    "--hex-blob",
    "--set-gtid-purged=OFF",
    "--default-character-set=utf8mb4",
    "--databases",
    t.database,
  ];
}

/** The dump was made with --databases, so it carries its own CREATE DATABASE/USE. */
export const restoreArgs = (t: DbTarget) => [`--host=${t.host}`, `--port=${t.port}`, `--user=${t.user}`, "--default-character-set=utf8mb4"];

/** BKP20261103-142501.sql on the Bangkok clock. */
export function backupFileName(now: Date) {
  const s = new Date(now.getTime() + 7 * 3600_000).toISOString(); // 2026-11-03T14:25:01.000Z (shifted)
  return `BKP${s.slice(0, 10).replaceAll("-", "")}-${s.slice(11, 19).replaceAll(":", "")}.sql`;
}

export const isDumpComplete = (tail: string) => tail.includes(DUMP_COMPLETE_MARKER);

/** Real verification: the file exists, is not empty, and its last bytes contain the completion marker. */
export async function verifyBackupFile(file: string): Promise<{ ok: boolean; size: number; reason?: string }> {
  const info = await stat(file).catch(() => null);
  if (!info) return { ok: false, size: 0, reason: "ไม่พบไฟล์สำรองข้อมูล" };
  if (info.size === 0) return { ok: false, size: 0, reason: "ไฟล์สำรองข้อมูลว่างเปล่า" };
  const fh = await open(file, "r");
  try {
    const len = Math.min(info.size, 4096);
    const buf = Buffer.alloc(len);
    await fh.read(buf, 0, len, info.size - len);
    return isDumpComplete(buf.toString("utf8"))
      ? { ok: true, size: info.size }
      : { ok: false, size: info.size, reason: "ไฟล์ไม่สมบูรณ์ (ไม่พบบรรทัด Dump completed ท้ายไฟล์)" };
  } finally {
    await fh.close();
  }
}

/** True when `file` resolves inside `dir` (blocks ../ tricks on download/restore). */
export function isInsideDir(file: string, dir: string) {
  const rel = path.relative(path.resolve(dir), path.resolve(file));
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}

export type ToolStatus = { bin: string; available: boolean; version?: string; error?: string };

/** Runs `<bin> --version`; on hosts without the MySQL client tools this reports unavailable instead of crashing. */
export function toolStatus(bin: string): Promise<ToolStatus> {
  return new Promise((resolve) => {
    execFile(bin, ["--version"], { timeout: 5000 }, (err, stdout) => {
      if (err) {
        const code = (err as NodeJS.ErrnoException).code;
        resolve({ bin, available: false, error: code === "ENOENT" ? "ไม่พบโปรแกรมบนเครื่องนี้" : err.message.slice(0, 200) });
      } else resolve({ bin, available: true, version: stdout.trim().slice(0, 200) });
    });
  });
}

function run(bin: string, args: string[], password: string, io: { stdoutTo?: string; stdinFrom?: string }) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(bin, args, {
      env: { ...process.env, MYSQL_PWD: password },
      stdio: [io.stdinFrom ? "pipe" : "ignore", io.stdoutTo ? "pipe" : "ignore", "pipe"],
    });
    let stderr = "";
    child.stderr!.on("data", (d) => (stderr = (stderr + d).slice(-2000)));
    const out = io.stdoutTo ? createWriteStream(io.stdoutTo) : null;
    if (out) child.stdout!.pipe(out);
    if (io.stdinFrom) createReadStream(io.stdinFrom).on("error", reject).pipe(child.stdin!);
    child.on("error", reject);
    child.on("close", (code) => {
      const done = () => (code === 0 ? resolve() : reject(new Error(stderr.trim() || `${path.basename(bin)} exited with code ${code}`)));
      if (out && !out.writableFinished) out.on("finish", done);
      else done();
    });
  });
}

export const runDump = (t: DbTarget, file: string) => run(mysqldumpBin(), dumpArgs(t), t.password, { stdoutTo: file });
export const runRestore = (t: DbTarget, file: string) => run(mysqlBin(), restoreArgs(t), t.password, { stdinFrom: file });
