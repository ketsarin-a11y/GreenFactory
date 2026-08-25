import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "greenfactory_session";

export type SessionPayload = {
  userId: number;
  email: string;
  roleName: string;

  companyId: number | null;
  companyCode: string | null;

  factoryId: number | null;

  firstName: string;
  lastName: string;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload,
  rememberMe: boolean
) {
  return new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? "7d" : "8h")
    .sign(getSecret());
}

export async function setSessionCookie(
  token: string,
  rememberMe: boolean
) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe
      ? 60 * 60 * 24 * 7
      : 60 * 60 * 8,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());

    return {
      userId: Number(payload.userId),

      email: String(payload.email),

      roleName: String(payload.roleName),

      companyId:
        payload.companyId == null
          ? null
          : Number(payload.companyId),

      companyCode:
        payload.companyCode == null
          ? null
          : String(payload.companyCode),

      factoryId:
        payload.factoryId == null
          ? null
          : Number(payload.factoryId),

      firstName: String(payload.firstName),

      lastName: String(payload.lastName),
    };
  } catch {
    return null;
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}