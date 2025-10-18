import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { assertAdmin } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function newCode(len = 40) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);
}

export async function POST(req: NextRequest) {
  try {
    await assertAdmin(req);

    const { amount, days, maxUses } = await req.json();

    const n = Math.max(1, Math.min(Number(amount ?? 1), 200));
    const d = Math.max(1, Math.min(Number(days ?? 30), 3650));
    const mu = Math.max(1, Math.min(Number(maxUses ?? 1), 1000));

    const now = new Date();
    const expires = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

    const rows = Array.from({ length: n }).map(() => ({
      code: newCode(40),
      issued_at: now.toISOString(),
      expires_at: expires.toISOString(),
      max_uses: mu,
      uses: 0,
    }));

    const { data, error } = await supabase.from("licenses").insert(rows).select("id, code");
    if (error) throw error;

    return NextResponse.json({ ok: true, created: data });
  } catch (e: any) {
    const status = e?.status ?? 500;
    return NextResponse.json({ ok: false, error: e.message ?? "error" }, { status });
  }
}
