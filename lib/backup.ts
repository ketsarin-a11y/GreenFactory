import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const MYSQLDUMP_PATH =
  process.env.MYSQLDUMP_PATH ??
  "C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysqldump.exe";

const MYSQL_PATH =
  process.env.MYSQL_PATH ??
  "C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysql.exe";

export const BACKUP_DIR =
  process.env.BACKUP_DIR ??
  path.join(process.cwd(), "storage", "backups");

type DatabaseConfig = {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
};

function getDatabaseConfig(): DatabaseConfig {
  const raw = process.env.DATABASE_URL;

  if (!raw) {
    throw new Error("DATABASE_URL is not configured");
  }

  const url = new URL(raw);

  if (url.protocol !== "mysql:") {
    throw new Error("Backup รองรับเฉพาะ MySQL ในตอนนี้");
  }

  const database = decodeURIComponent(url.pathname.replace(/^\/+/, ""));

  if (!database) {
    throw new Error("ไม่พบชื่อฐานข้อมูลใน DATABASE_URL");
  }

  return {
    host: url.hostname || "127.0.0.1",
    port: url.port || "3306",
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
  };
}

export function buildBackupCode(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    "BKP",
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

export function getBackupFilePath(fileName: string) {
  return path.join(BACKUP_DIR, fileName);
}

export async function ensureBackupDirectory() {
  await mkdir(BACKUP_DIR, { recursive: true });
}

export async function createDatabaseBackup(filePath: string) {
  await ensureBackupDirectory();

  const db = getDatabaseConfig();

  const args = [
    "--host", db.host,
    "--port", db.port,
    "--user", db.user,
    "--single-transaction",
    "--quick",
    "--routines",
    "--triggers",
    "--events",
    "--hex-blob",
    "--set-gtid-purged=OFF",
    "--default-character-set=utf8mb4",
    "--databases",
    db.database,
  ];

  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(filePath);

    const child = spawn(MYSQLDUMP_PATH, args, {
      windowsHide: true,
      env: {
        ...process.env,
        MYSQL_PWD: db.password,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";

    child.stdout.pipe(output);

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", async (error) => {
      output.destroy();
      await unlink(filePath).catch(() => undefined);
      reject(error);
    });

    child.on("close", async (code) => {
      output.end();

      if (code === 0) {
        resolve();
        return;
      }

      await unlink(filePath).catch(() => undefined);

      reject(
        new Error(
          stderr.trim() ||
            `mysqldump ทำงานไม่สำเร็จ (exit code ${code ?? "unknown"})`,
        ),
      );
    });
  });

  const info = await stat(filePath);

  if (info.size <= 0) {
    await unlink(filePath).catch(() => undefined);
    throw new Error("ไฟล์ Backup ที่สร้างขึ้นมีขนาด 0 byte");
  }

  return {
    fileSize: info.size,
  };
}

export async function restoreDatabaseBackup(filePath: string) {
  const db = getDatabaseConfig();

  const input = createReadStream(filePath);

  const args = [
    "--host", db.host,
    "--port", db.port,
    "--user", db.user,
    "--default-character-set=utf8mb4",
  ];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(MYSQL_PATH, args, {
      windowsHide: true,
      env: {
        ...process.env,
        MYSQL_PWD: db.password,
      },
      stdio: ["pipe", "ignore", "pipe"],
    });

    let stderr = "";

    input.pipe(child.stdin);

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          stderr.trim() ||
            `mysql restore ทำงานไม่สำเร็จ (exit code ${code ?? "unknown"})`,
        ),
      );
    });
  });
}

export function formatBytes(bytes: number | bigint | null) {
  if (bytes == null) return "—";

  let value = Number(bytes);

  if (!Number.isFinite(value) || value < 0) return "—";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const digits = unitIndex >= 3 ? 2 : unitIndex >= 2 ? 1 : 0;

  return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

export function formatDuration(seconds: number | null) {
  if (seconds == null) return "—";

  if (seconds < 60) {
    return `${seconds} วินาที`;
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${minutes} นาที ${remaining} วินาที`;
}
