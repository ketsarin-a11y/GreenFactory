import "dotenv/config";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createAdapter() {
  const databaseUrl = process.env.DATABASE_URL;

  // Production / Vercel
  if (process.env.NODE_ENV === "production") {
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not configured");
    }

    const url = new URL(databaseUrl);

    const database = decodeURIComponent(
      url.pathname.replace(/^\/+/, "")
    );

    if (!database) {
      throw new Error("Database name is missing from DATABASE_URL");
    }

    // Safe debug: ไม่แสดง username/password
    console.log("[Database] Production connection target:", {
      host: url.hostname,
      port: Number(url.port || 3306),
      database,
    });

    return new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database,

      connectionLimit: 5,

      // Vercel -> Aiven อาจใช้เวลาเชื่อมต่อมากกว่า 1 วินาที
      connectTimeout: 10_000,
      acquireTimeout: 15_000,

      // Aiven ใช้ TLS/SSL
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  // Local development
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