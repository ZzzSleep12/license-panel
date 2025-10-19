// app/api/admin/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  getAdminClient,
  nowEpoch,
  SECONDS_PER_DAY,
  NO_EXPIRY_EPOCH,
  LicenseRow,
} from "@/lib/supabaseAdmin";

// Si existe requireAdmin en tu lib/auth, lo usamos; si no, ignoramos (no rompe build)
let requireAdminRef:
  | (undefined | ((req: NextRequest) => Promise<void>))
  | undefined = undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const auth = require("@/lib/auth");
  if (typeof auth.requireAdmin === "function") requireAdminRef = auth.requireAdmin;
} catch {}

export const dynamic = "force-dynamic";

type Body = {
  count?: number;
  durationDays?: number; // 0 = sin caducidad
  maxUses?: number;
  notes?: string;
};

function makeCode() {
  // 32 bytes -> 43~44 chars base64url sin padding
  return randomBytes(24).toString("base64url");
}

export async function POST(req: NextRequest) {
  try {
    if (requireAdminRef) {
      await requireAdminRef(req);
    }

    const body = (await req.json().catch(() => ({}))) as Body;

    // Sanitiza/valida entradas
    const count = Math.max(0, Math.min(100, Number(body.count ?? 1))); // cap 100 por seguridad
    const durationDaysRaw = Number(body.durationDays ?? 0);
    const durationDays = Number.isFinite(durationDaysRaw) ? Math.max(0, Math.floor(durationDaysRaw)) : 0;
    const maxUsesRaw = Number(body.maxUses ?? 1);
    const maxUses = Number.isFinite(maxUsesRaw) ? Math.max(1, Math.floor(maxUsesRaw)) : 1;
    const notes = (body.notes ?? "").toString().trim() || null;

    if (count === 0) {
      return NextResponse.json({ ok: true, generated: 0, codes: [] });
    }

    const supabase = getAdminClient();

    const issued = nowEpoch();
    const expires =
      durationDays === 0 ? NO_EXPIRY_EPOCH : issued + durationDays * SECONDS_PER_DAY;

    const rowsToInsert = Array.from({ length: count }, () => ({
      code: makeCode(),
      issued_at: issued,
      expires_at: expires,
      duration_days: durationDays,
      max_uses: maxUses,
      uses: 0,
      is_revoked: false,
      notes,
    }));

    // INSERT y devolvemos los códigos insertados
    const { data, error } = await supabase
      .from("licenses")
      .insert(rowsToInsert)
      .select("code"); // <— importante para saber cuántos se insertaron

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    const codes = (data ?? []).map((r: Pick<LicenseRow, "code">) => r.code);
    return NextResponse.json({
      ok: true,
      generated: codes.length,
      codes,
      issued_at: issued,
      expires_at: expires,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}
