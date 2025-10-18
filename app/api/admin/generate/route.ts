import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabase = getAdminClient();
    const body = await req.json().catch(() => ({}));
    const amount = Math.max(1, parseInt(body.amount ?? "1"));
    const days = Math.max(0, parseInt(body.days ?? "30"));
    const maxUses = Math.max(1, parseInt(body.maxUses ?? "1"));
    const notes = (body.notes ?? null) as string | null;

    const now = new Date();
    const expires = days > 0 ? new Date(now.getTime() + days * 86400 * 1000) : null;

    const codes: string[] = [];
    const rows = Array.from({ length: amount }).map(() => {
      const code = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
      codes.push(code);
      return {
        code,
        max_uses: maxUses,
        uses: 0,
        issued_at: now.toISOString(),
        expires_at: expires ? expires.toISOString() : null,
        notes
      };
    });

    const { error } = await supabase.from("licenses").insert(rows);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, codes, expires_at: expires ? expires.toISOString() : null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "unknown" }, { status: 500 });
  }
}
