import { execSync } from "node:child_process";
import mariadb from "mariadb";
import { testDatabaseUrl } from "./env";

/** Recreates the throwaway `*_test` database, applies migrations and seeds demo data. */
export default async function setup() {
  const url = new URL(testDatabaseUrl());
  const name = decodeURIComponent(url.pathname.slice(1));
  if (!name.endsWith("_test")) throw new Error(`Refusing to recreate "${name}": test DB name must end with _test`);

  const conn = await mariadb.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  });
  await conn.query(`DROP DATABASE IF EXISTS \`${name}\``);
  await conn.query(`CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();

  const env = { ...process.env, DATABASE_URL: url.toString() };
  execSync("npx prisma migrate deploy", { env, stdio: "ignore" });
  execSync("npx prisma db seed", { env, stdio: "ignore" });
}
