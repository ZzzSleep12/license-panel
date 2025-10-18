import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

function makeCode(n = 32) {
  return crypto.randomBytes(n).toString("base64url");
}

export async function POST(req: Request) {
  // Esta ruta está protegida por middleware: requiere sesión (sb-access-token)
  const Schema = z.object({
    days: z.number().int().positive(),
    max_uses: z.number().int().min(0),
    count: z.number().int().positive().max(200)
  });

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid params" }, { status: 400 });

  const { days, max_uses, count } = parsed.data;
  const now = Math.floor(Date.now() / 1000);
  const rows = [];
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = makeCode(32);
    const expires = now + days * 24 * 3600;
    rows.push({ code, days, issued_at: now, expires_at: expires, revoked: false, max_uses, uses: 0 });
    codes.push(code);
  }

  const { error } = await supabaseAdmin.from("licenses").insert(rows);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, codes });
}
