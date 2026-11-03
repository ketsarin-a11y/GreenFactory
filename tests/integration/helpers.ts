import { db } from "@/server/db";
import { SESSION_COOKIE, signSession } from "@/server/auth/session";
import { testCookies } from "./setup";

/** Signs in as a seeded user by email (sets the session cookie in the fake jar). */
export async function signInAs(email: string) {
  const u = await db.user.findUniqueOrThrow({ where: { email } });
  testCookies.set(SESSION_COOKIE, await signSession({ uid: u.userId, ver: u.sessionVersion }, 3600));
  return u;
}
export const signOut = () => testCookies.clear();

export const DEMO = {
  platform: "admin@greenfactory.dev",
  companyAdmin: "admin@voltera.example",
  manager: "manager@voltera.example",
  operator: "operator@voltera.example",
  otherCompanyAdmin: "admin@siampack.example",
};
