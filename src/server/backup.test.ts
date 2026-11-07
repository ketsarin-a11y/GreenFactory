import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { backupFileName, dbTarget, dumpArgs, isDumpComplete, isInsideDir, toolStatus, verifyBackupFile } from "./backup";

const t = dbTarget("mysql://gf:p%40ss@db.internal:3307/greenfactory");

describe("backup command", () => {
  it("parses the connection from DATABASE_URL", () => {
    expect(t).toEqual({ host: "db.internal", port: 3307, user: "gf", password: "p@ss", database: "greenfactory" });
  });

  it("builds mysqldump args with the required flags and never the password", () => {
    const args = dumpArgs(t);
    for (const flag of ["--single-transaction", "--quick", "--routines", "--triggers", "--events", "--hex-blob", "--set-gtid-purged=OFF", "--default-character-set=utf8mb4"])
      expect(args).toContain(flag);
    expect(args.slice(-2)).toEqual(["--databases", "greenfactory"]);
    expect(args.join(" ")).not.toContain("p@ss");
  });

  it("names the file on the Bangkok clock", () => {
    expect(backupFileName(new Date("2026-11-03T17:05:09Z"))).toBe("BKP20261104-000509.sql");
  });
});

describe("verification", () => {
  it("needs the dump-complete marker", () => {
    expect(isDumpComplete("...\n-- Dump completed on 2026-11-03 14:25:01\n")).toBe(true);
    expect(isDumpComplete("INSERT INTO x VALUES (1);\n")).toBe(false);
  });

  it("checks the real file: missing, empty, truncated, complete", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "gf-backup-"));
    const f = (n: string) => path.join(dir, n);
    expect((await verifyBackupFile(f("missing.sql"))).ok).toBe(false);
    await writeFile(f("empty.sql"), "");
    expect(await verifyBackupFile(f("empty.sql"))).toMatchObject({ ok: false, size: 0 });
    await writeFile(f("cut.sql"), "CREATE TABLE a (id int);\nINSERT INTO a VALUES (1");
    expect((await verifyBackupFile(f("cut.sql"))).ok).toBe(false);
    await writeFile(f("ok.sql"), "x".repeat(10_000) + "\n-- Dump completed on 2026-11-03 14:25:01\n");
    expect(await verifyBackupFile(f("ok.sql"))).toMatchObject({ ok: true, size: 10_042 });
  });

  it("keeps downloads inside the backup folder", () => {
    expect(isInsideDir("/srv/backups/BKP1.sql", "/srv/backups")).toBe(true);
    expect(isInsideDir("/srv/backups/../.env", "/srv/backups")).toBe(false);
    expect(isInsideDir("/srv/backups", "/srv/backups")).toBe(false);
  });

  it("reports a missing binary instead of throwing", async () => {
    expect(await toolStatus("/nonexistent/mysqldump-xyz")).toMatchObject({ available: false });
  });
});
