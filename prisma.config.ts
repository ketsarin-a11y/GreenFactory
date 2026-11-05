import "dotenv/config";
import { defineConfig } from "prisma/config";

// MySQL is the primary target; a postgres:// DATABASE_URL (Vercel/Neon) switches to the
// generated Postgres schema and its own migrations.
const pg = /^postgres(ql)?:/.test(process.env.DATABASE_URL ?? "");

export default defineConfig({
  schema: pg ? "prisma/postgres/schema.prisma" : "prisma/schema.prisma",
  migrations: { path: pg ? "prisma/postgres/migrations" : "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url: process.env.DATABASE_URL },
});
