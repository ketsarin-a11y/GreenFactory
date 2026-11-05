// No "server-only": the seed script uses this too.
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaPg } from "@prisma/adapter-pg";

/** MySQL/MariaDB (primary) or Postgres (Vercel/Neon), chosen by the DATABASE_URL scheme. */
export function createAdapter(url: string | undefined) {
  if (!url) throw new Error("DATABASE_URL is not set");
  if (/^postgres(ql)?:/.test(url)) return new PrismaPg({ connectionString: url, max: 5 });

  const u = new URL(url);
  const tls = u.searchParams.get("ssl") === "true";
  return new PrismaMariaDb({
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: decodeURIComponent(u.pathname.slice(1)),
    connectionLimit: 5,
    connectTimeout: 10_000,
    // Managed MySQL (Aiven…) needs TLS: add ?ssl=true and put the provider CA in DATABASE_CA_CERT.
    ssl: tls ? { rejectUnauthorized: true, ca: process.env.DATABASE_CA_CERT } : undefined,
    // MySQL 8 caching_sha2 auth over plain TCP (local/CI only) needs the server key; with TLS it isn't used.
    allowPublicKeyRetrieval: !tls,
  });
}
