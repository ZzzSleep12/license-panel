// app/api/admin/revoke/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { code } = await req.json();
    if (!code) return NextResponse.json({ ok: false, error: "Falta 'code'" }, { status: 400 });

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("licenses")
      .update({ is_revoked: true })
      .eq("code", code)
      .neq("is_revoked", true)
      .select("code")
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ ok: false, error: "No se encontró o ya estaba revocada" }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unexpected" }, { status: 500 });
  }
}
