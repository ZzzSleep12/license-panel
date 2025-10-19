// app/api/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  supabaseAdmin,
  nowEpoch,
  NO_EXPIRY_EPOCH,
} from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let payload: any = null;
    try {
      payload = await req.json();
    } catch {
      payload = null;
    }

    // Soporta { code: "..." } o el string directo
    const code: string =
      (typeof payload === "string" ? payload : payload?.code) ?? "";

    if (!code) {
      return NextResponse.json(
        { ok: false, message: "Missing code" },
        { status: 400 }
      );
    }

    const { data: lic, error } = await supabaseAdmin
      .from("licenses")
      .select("code, issued_at, expires_at, duration_days, uses, max_uses, is_revoked, notes")
      .eq("code", code)
      .maybeSingle();

    if (error || !lic) {
      return NextResponse.json(
        { ok: false, message: "Code not found" },
        { status: 404 }
      );
    }

    const now = nowEpoch();
    const expired =
      lic.expires_at !== NO_EXPIRY_EPOCH && lic.expires_at <= now;
    const exhausted = lic.uses >= lic.max_uses;

    const valid = !lic.is_revoked && !expired && !exhausted;

    return NextResponse.json({
      ok: true,
      valid,
      details: {
        is_revoked: lic.is_revoked,
        expired,
        exhausted,
        issued_at: lic.issued_at,
        expires_at: lic.expires_at, // epoch (UTC)
        uses: lic.uses,
        max_uses: lic.max_uses,
        duration_days: lic.duration_days,
        notes: lic.notes,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
