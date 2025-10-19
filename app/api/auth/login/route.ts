import { NextRequest, NextResponse } from "next/server";
import { adminCookie, signAdminJWT } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
    }

    // 1) Usuario maestro por variables de entorno (fallback)
    const envUser = process.env.ADMIN_USER || "admin";
    const envPass = process.env.ADMIN_PASS || "Papasconsal12";
    let ok = false;

    if (username === envUser && password === envPass) {
      ok = true;
    } else {
      // 2) O buscar en tabla admins (username único) con hash bcrypt
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("admins")
        .select("username, password_hash")
        .eq("username", username)
        .maybeSingle();
      if (!error && data?.password_hash) {
        ok = await bcrypt.compare(password, data.password_hash);
      }
    }

    if (!ok) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
    }

    const token = await signAdminJWT(username);
    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: adminCookie.name,
      value: token,
      ...adminCookie.options,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
