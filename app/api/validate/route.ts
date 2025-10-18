import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const Schema = z.object({ code: z.string().min(8), hwid: z.string().optional() });
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, reason: "bad request" }, { status: 400 });
  const { code } = parsed.data;

  const { data: rows, error } = await supabaseAdmin.from("licenses").select("*").eq("code", code).limit(1);
  if (error) return NextResponse.json({ ok: false, reason: "server error" }, { status: 500 });
  const row = rows?.[0];
  if (!row) return NextResponse.json({ ok: false, reason: "invalid code" }, { status: 404 });
  if (row.revoked) return NextResponse.json({ ok: false, reason: "revoked" }, { status: 403 });

  const now = Math.floor(Date.now() / 1000);
  if (row.expires_at < now) return NextResponse.json({ ok: false, reason: "expired", expires_at: row.expires_at }, { status: 403 });

  if (row.max_uses > 0 && row.uses >= row.max_uses) {
    return NextResponse.json({ ok: false, reason: "max_uses_exceeded" }, { status: 403 });
  }

  const { error: updErr } = await supabaseAdmin.from("licenses").update({ uses: row.uses + 1 }).eq("id", row.id);
  if (updErr) return NextResponse.json({ ok: false, reason: "server error" }, { status: 500 });

  return NextResponse.json({
    ok: true,
    expires_at: row.expires_at,
    issued_at: row.issued_at,
    days: row.days,
    uses: row.uses + 1,
    max_uses: row.max_uses
  });
}
