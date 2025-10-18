// app/api/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, nowEpoch, NO_EXPIRY_EPOCH } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Body: { code: string }
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ ok: false, error: "Falta 'code'" }, { status: 400 });

    const supabase = getAdminClient();
    const now = nowEpoch();

    // Traemos la licencia
    const { data: lic, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !lic)
      return NextResponse.json({ ok: false, error: "Código no válido" }, { status: 404 });

    if (lic.is_revoked)
      return NextResponse.json({ ok: false, error: "Código revocado" }, { status: 403 });

    if (lic.expires_at !== NO_EXPIRY_EPOCH && lic.expires_at <= now)
      return NextResponse.json({ ok: false, error: "Código expirado" }, { status: 403 });

    if (lic.uses >= lic.max_uses)
      return NextResponse.json({ ok: false, error: "Límite de usos alcanzado" }, { status: 403 });

    // Incremento atómico del contador de usos
    const { data: updated, error: upErr } = await supabase
      .from("licenses")
      .update({ uses: lic.uses + 1 })
      .eq("code", code)
      .eq("uses", lic.uses) // evita carrera
      .select("*")
      .single();

    if (upErr || !updated)
      return NextResponse.json({ ok: false, error: "Intenta de nuevo" }, { status: 409 });

    // devolvemos días restantes (si tiene caducidad)
    const remaining =
      updated.expires_at === NO_EXPIRY_EPOCH
        ? null
        : Math.max(0, Math.ceil((updated.expires_at - now) / 86400));

    return NextResponse.json({
      ok: true,
      code: updated.code,
      expires_at: updated.expires_at,
      remaining_days: remaining,
      remaining_uses: updated.max_uses - updated.uses,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unexpected" }, { status: 500 });
  }
}
