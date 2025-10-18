import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { ensureSeedAdmin, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureSeedAdmin(); // crea admin inicial si tabla vacía
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "Faltan credenciales" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("admins")
      .select("id, username, password_hash")
      .eq("username", username)
      .maybeSingle();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ ok: false, error: "Usuario o contraseña inválidos" }, { status: 401 });

    const bcrypt = await import("bcryptjs");
    const ok = await bcrypt.compare(password, data.password_hash);
    if (!ok) return NextResponse.json({ ok: false, error: "Usuario o contraseña inválidos" }, { status: 401 });

    await setSessionCookie({ sub: data.id, username: data.username, role: "admin" });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "unknown" }, { status: 500 });
  }
}
