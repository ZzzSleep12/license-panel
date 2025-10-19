import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "ADMIN_SESSION";
const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "dev-secret-change-me"
);

type AdminClaims = { sub: string; role: "admin" };

export async function signAdminJWT(username: string, ttlSeconds = 60 * 60 * 6) {
  // 6h por defecto
  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({ role: "admin" } as AdminClaims)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(username)
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(JWT_SECRET);
  return token;
}

export async function verifyAdminJWT(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: ["HS256"] });
  if (payload.role !== "admin" || !payload.sub) throw new Error("forbidden");
  return payload as unknown as AdminClaims;
}

export function getAdminTokenFromRequest(req?: NextRequest) {
  // Con App Router, cookies() funciona en handlers/server components
  const c = cookies().get(COOKIE_NAME)?.value;
  if (c) return c;

  // Fallback por si lo llamas pasando req explícito:
  const raw = req?.headers.get("cookie") || "";
  const parts = raw.split(/;\s*/);
  for (const p of parts) {
    const [k, ...rest] = p.split("=");
    if (k === COOKIE_NAME) return rest.join("=");
  }
  return undefined;
}

export async function requireAdmin(req?: NextRequest) {
  const token = getAdminTokenFromRequest(req);
  if (!token) throw new Error("unauthorized");
  const payload = await verifyAdminJWT(token);
  return payload.sub; // username
}

export const adminCookie = {
  name: COOKIE_NAME,
  // opciones para NextResponse.cookies.set
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // maxAge 7 días
    maxAge: 60 * 60 * 24 * 7,
  },
};
