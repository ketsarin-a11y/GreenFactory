import "dotenv/config";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createAdapter() {
  const databaseUrl = process.env.DATABASE_URL;

  // Production / Vercel -> ใช้ DATABASE_URL ของ Aiven
  if (process.env.NODE_ENV === "production") {
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not configured");
    }

    const url = new URL(databaseUrl);

    return new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, "") || "greenfactory",
      connectionLimit: 5,
    });
  }

  // Local development -> ใช้ฐานข้อมูลเดิมในเครื่อง
  return new PrismaMariaDb({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "greenfactory",
    connectionLimit: 5,
  });
}

const adapter = createAdapter();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}