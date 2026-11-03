import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../src/generated/prisma/client";

const u = new URL(process.env.DATABASE_URL!);
export const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: decodeURIComponent(u.pathname.slice(1)),
    connectionLimit: 5,
    ssl:
      u.searchParams.get("ssl") === "true"
        ? { rejectUnauthorized: true, ca: process.env.DATABASE_CA_CERT }
        : undefined,
  }),
});
