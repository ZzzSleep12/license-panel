// app/api/admin/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  getAdminClient,
  nowEpoch,
  SECONDS_PER_DAY,
  NO_EXPIRY_EPOCH,
} from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req); // cookie/JWT admin

    const body = await req.json().catch(() => ({}));
    const count = Math.max(1, Number(body.count ?? 1));
    const duration_days = Math.max(0, Number(body.duration_days ?? 0));
    const max_uses = Math.max(1, Number(body.max_uses ?? 1));
    const notes =
      typeof body.notes === "string" && body.notes.trim().length > 0
        ? String(body.notes).trim()
        : null;

    const supabase = getAdminClient();

    const issuedAt = nowEpoch();
    const expiresAt =
      duration_days > 0 ? issuedAt + duration_days * SECONDS_PER_DAY : NO_EXPIRY_EPOCH;

    const rows = Array.from({ length: count }, () => ({
      code: randomBytes(24).toString("base64url"),
      issued_at: issuedAt,
      expires_at: expiresAt,
      duration_days,
      max_uses,
      uses: 0,
      is_revoked: false,
      notes,
    }));

    const { data, error } = await supabase.from("licenses").insert(rows).select("*");
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true, items: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unexpected" }, { status: 500 });
  }
}
