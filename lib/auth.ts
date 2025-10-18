// lib/auth.ts
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Devuelve el email del usuario autenticado si el access token es válido.
 * Usa el endpoint de Auth con la Service Role Key para validar el token.
 */
export async function getUserEmailFromCookie(): Promise<string | null> {
  const c = await cookies();
  // Supabase helpers suelen guardar estos nombres (depende de la lib usada).
  const token =
    c.get("sb-access-token")?.value ||
    c.get("sb:token")?.value ||
    c.get("access-token")?.value ||
    null;

  if (!token) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Usa la API de Auth para resolver el usuario desde el token
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.email) return null;
  return data.user.email.toLowerCase();
}

/**
 * Lanza error si el usuario no está autenticado como admin.
 * Admins permitidos: lista separada por comas en ALLOWED_ADMINS
 */
export async function assertAdmin(_req?: NextRequest) {
  const email = await getUserEmailFromCookie();
  if (!email) {
    const err: any = new Error("UNAUTHENTICATED");
    err.status = 401;
    throw err;
  }

  const allowed = (process.env.ALLOWED_ADMINS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!allowed.includes(email)) {
    const err: any = new Error("FORBIDDEN");
    err.status = 403;
    throw err;
  }

  return email;
}
