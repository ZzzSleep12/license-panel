// app/api/admin/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Helpers
const epochSec = (d: Date) => Math.floor(d.getTime() / 1000);
const SECONDS_PER_DAY = 86400;
// Sentinel para “sin caducidad” (2100-01-01)
const NO_EXPIRY_EPOCH = 4102444800;

// Código aleatorio URL-safe
function genCode(): string {
  return randomBytes(24).toString("base64url");
}

export async function POST(req: NextRequest) {
  try {
    // (Si luego quieres protegerlo con auth, lo agregamos después)
    const body = await req.json().catch(() => ({}));
    let { count, duration_days, max_uses, notes } = body as {
      count?: number;
      duration_days?: number; // 0 = sin caducidad
      max_uses?: number;
      notes?: string;
    };

    // Saneos y valores por defecto
    count = Number.isFinite(count) && count! > 0 && count! <= 1000 ? Math.trunc(count!) : 1;
    duration_days = Number.isFinite(duration_days) && duration_days! >= 0 ? Math.trunc(duration_days!) : 30;
    max_uses = Number.isFinite(max_uses) && max_uses! > 0 && max_uses! <= 1000 ? Math.trunc(max_uses!) : 1;
    notes = typeof notes === "string" ? notes.slice(0, 500) : null;

    const now = new Date();
    const issued_at = epochSec(now);
    const expires_at =
      duration_days === 0 ? NO_EXPIRY_EPOCH : issued_at + duration_days * SECONDS_PER_DAY;

    // Filas a insertar
    const rows = Array.from({ length: count }).map(() => ({
      code: genCode(),
      issued_at,          // BIGINT (segundos)
      expires_at,         // BIGINT (segundos)
      duration_days,      // INTEGER
      max_uses,           // INTEGER
      uses: 0,            // INTEGER
      is_revoked: false,  // BOOLEAN
      notes,              // TEXT (nullable)
    }));

    const { data, error } = await supabaseAdmin
      .from("licenses")
      .insert(rows)
      .select("code, issued_at, expires_at, duration_days, max_uses");

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, licenses: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "unexpected_error" },
      { status: 500 }
    );
  }
}
