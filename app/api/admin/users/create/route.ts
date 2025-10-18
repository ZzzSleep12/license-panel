import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "username y password requeridos" }, { status: 400 });
    }

    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash(password, 10);

    const supabase = getAdminClient();
    const { error } = await supabase.from("admins").insert({ username, password_hash: hash });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "unknown" }, { status: 500 });
  }
}
