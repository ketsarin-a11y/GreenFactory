import "dotenv/config";

/** Same server as DATABASE_URL, database `<name>_test`. Never touches the dev database. */
export function testDatabaseUrl() {
  const base = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!base) throw new Error("DATABASE_URL or TEST_DATABASE_URL must be set");
  const u = new URL(base);
  if (!process.env.TEST_DATABASE_URL) u.pathname = `${u.pathname.replace(/_test$/, "")}_test`;
  return u.toString();
}
