import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "gf_session";
export type SessionClaims = { uid: number; ver: number };

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return new TextEncoder().encode(s);
}

export async function signSession(claims: SessionClaims, maxAgeSeconds: number) {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.uid !== "number" || typeof payload.ver !== "number") return null;
    return { uid: payload.uid, ver: payload.ver };
  } catch {
    return null;
  }
}
