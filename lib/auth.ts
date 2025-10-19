// lib/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "admin_auth";
const COOKIE_SECRET = process.env.ADMIN_COOKIE_SECRET || "dev-secret-cookie";

// ¿El request viene con cookie de admin válida?
export function isAdmin(req?: NextRequest): boolean {
  const val = req
    ? req.cookies.get(ADMIN_COOKIE)?.value
    : cookies().get(ADMIN_COOKIE)?.value;
  return val === COOKIE_SECRET;
}

// Lánzalo en APIs protegidas. Si no hay admin => throw (se captura en el route).
export function requireAdmin(req?: NextRequest) {
  if (!isAdmin(req)) {
    throw new Error("Unauthorized");
  }
}

// Para el login: setear cookie httpOnly con el “secreto”
export function setAdminCookie(res: NextResponse) {
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: COOKIE_SECRET,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
  return res;
}

// Para el logout
export function clearAdminCookie(res: NextResponse) {
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  return res;
}
