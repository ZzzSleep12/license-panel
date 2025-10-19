// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminCookie, signAdminJWT } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "").trim();

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, message: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const sb = getSupabaseAdmin();
    const { data: admin, error } = await sb
      .from("admins")
      .select("id, username, password_hash, is_active")
      .eq("username", username)
      .maybeSingle();

    if (error || !admin || !admin.is_active) {
      return NextResponse.json(
        { ok: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Firmamos JWT con { sub, username }
    const token = await signAdminJWT({ sub: admin.id, username: admin.username });

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: adminCookie,
      value: token,
      httpOnly: true,
      // MUY IMPORTANTE: solo secure en producción para que en localhost se guarde la cookie
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días
    });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
