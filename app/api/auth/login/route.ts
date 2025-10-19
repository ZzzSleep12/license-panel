// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminCookie, signAdminJWT } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabaseAdmin"; // <-- nombre correcto
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Acepta JSON o form-data
    const ct = req.headers.get("content-type") || "";
    let username = "";
    let password = "";

    if (ct.includes("application/json")) {
      const body = await req.json();
      username = String(body?.username || "");
      password = String(body?.password || "");
    } else {
      const form = await req.formData();
      username = String(form.get("username") || "");
      password = String(form.get("password") || "");
    }

    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Busca admin por username
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, username, password_hash")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Compara hash
    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Firma JWT y guarda cookie httpOnly
    const token = await signAdminJWT({ sub: admin.id, username: admin.username });

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: adminCookie,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: true,
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });
    return res;
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Login error" },
      { status: 500 }
    );
  }
}
