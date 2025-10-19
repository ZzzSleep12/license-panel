// app/api/admin/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  getAdminClient,
  nowEpoch,
  SECONDS_PER_DAY,
  NO_EXPIRY_EPOCH,
} from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/auth"; // mantiene la protección admin

export const dynamic = "force-dynamic";

function makeCode(lenBytes = 18) {
  // base64url sin padding -> códigos cortos y seguros
  return randomBytes(lenBytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    // Verifica cookie/JWT de admin (no se quita esta función)
    await requireAdmin(req);

    const body = await req.json().catch(() => ({}));
    const count = Math.max(1, Number(body?.count ?? body?.cantidad ?? 1));
    const duration_days = Math.max(
      0,
      Number(body?.duration_days ?? body?.duracion_dias ?? 0)
    );
    const max_uses = Math.max(1, Number(body?.max_uses ?? body?.max_uses_per_code ?? 1));
    const notes: string | null = body?.notes ?? body?.notas ?? null;

    const sb = getAdminClient();
    const now = nowEpoch();
    const exp =
      duration_days > 0 ? now + duration_days * SECONDS_PER_DAY : NO_EXPIRY_EPOCH;

    const rows = Array.from({ length: count }).map(() => ({
      code: makeCode(18),
      issued_at: now,
      expires_at: exp,
      duration_days,
      uses: 0,
      max_uses,
      is_revoked: false,
      notes,
    }));

    const { data, error } = await sb
      .from("licenses")
      .insert(rows)
      .select("code, issued_at, expires_at, max_uses, uses, duration_days, is_revoked");

    if (error) {
      console.error(error);
      return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, licenses: data }, { status: 201 });
  } catch (err: any) {
    if (err?.status === 401) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
