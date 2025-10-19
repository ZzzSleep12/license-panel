// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { adminCookie, signAdminJWT } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ ok: false, message: "Missing credentials" }, { status: 400 });
    }

    const { data: admin, error } = await supabaseAdmin
      .from("admins")
      .select("id, username, password_hash, is_active")
      .eq("username", username)
      .maybeSingle();

    if (error || !admin || !admin.is_active) {
      return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    // Firmamos JWT y lo guardamos en cookie httpOnly
    const token = await signAdminJWT({ sub: admin.id, username: admin.username });

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: adminCookie.name,
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: adminCookie.maxAge, // por ejemplo 7 días
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
