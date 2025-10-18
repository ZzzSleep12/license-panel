import { NextResponse } from "next/server";
import { signJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const adminUser = process.env.ADMIN_USER || "admin";
    const adminPass = process.env.ADMIN_PASS || "Papasconsal12";

    // 1) Usuario/clave “maestro”
    let ok = username === adminUser && password === adminPass;

    // 2) (Opcional) validar contra tabla "admins" en Supabase (texto plano simple)
    if (!ok) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (url && key) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(url, key);
        const { data } = await supabase
          .from("admins")
          .select("username,password,active")
          .eq("username", username)
          .eq("active", true)
          .maybeSingle();
        if (data && data.password === password) ok = true;
      }
    }

    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = await signJwt({ sub: username, role: "admin" }, "7d");

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: "auth",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: true, // Vercel usa HTTPS
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });
    return res;
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Error" },
      { status: 500 }
    );
  }
}
