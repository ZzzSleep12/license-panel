import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getAdminClient } from "@/lib/supabaseAdmin";

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 días

export type SessionPayload = { sub: string; username: string; role: "admin" };

export function signSession(payload: SessionPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return jwt.sign(payload, secret, { expiresIn: MAX_AGE_SECONDS });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const secret = process.env.JWT_SECRET!;
    return jwt.verify(token, secret) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = signSession(payload);
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0
  });
}

/**
 * Seed automático: si no hay admins, crea 'admin' / 'Papasconsal12'
 */
export async function ensureSeedAdmin() {
  const supabase = getAdminClient();
  const { data, error } = await supabase.from("admins").select("id").limit(1);
  if (error) throw new Error(error.message);

  if (!data || data.length === 0) {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("Papasconsal12", 10);
    const { error: insErr } = await supabase.from("admins").insert({
      username: "admin",
      password_hash: hash
    });
    if (insErr) throw new Error(insErr.message);
  }
}
