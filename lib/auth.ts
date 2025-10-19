// lib/auth.ts
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

export const adminCookie = "lp_admin";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!ADMIN_JWT_SECRET) {
  throw new Error("Missing env ADMIN_JWT_SECRET");
}
const secretKey = new TextEncoder().encode(ADMIN_JWT_SECRET);

/** Firma un JWT para el admin (expira en 30 días) */
export async function signAdminJWT(payload: { sub: string; username: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);
  return token;
}

/** Verifica el token del admin desde un Request (cookie httpOnly) */
export async function verifyAdminFromRequest(req: NextRequest) {
  const cookie = req.cookies.get(adminCookie)?.value;
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie, secretKey, {
      algorithms: ["HS256"],
    });
    // payload.sub y payload.username deberían existir
    if (!payload?.sub || typeof payload.sub !== "string") return null;
    return {
      sub: payload.sub as string,
      username: (payload as any).username as string | undefined,
    };
  } catch {
    return null;
  }
}

/** Lanza 401 si no hay admin válido (para proteger endpoints) */
export async function requireAdmin(req: NextRequest) {
  const admin = await verifyAdminFromRequest(req);
  if (!admin) {
    const e: any = new Error("Unauthorized");
    e.status = 401;
    throw e;
  }
  return admin;
}

/** Obtiene el admin desde cookies (para componentes server) */
export async function getAdminFromCookies() {
  const jar = await cookies();
  const token = jar.get(adminCookie)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    if (!payload?.sub || typeof payload.sub !== "string") return null;
    return {
      sub: payload.sub as string,
      username: (payload as any).username as string | undefined,
    };
  } catch {
    return null;
  }
}
