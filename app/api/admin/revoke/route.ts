// app/api/admin/revoke/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  // body: { id: string }  ó  { code: string }
  const body = await req.json().catch(() => ({}));
  const { id, code } = body as { id?: string; code?: string };

  if (!id && !code) {
    return NextResponse.json({ ok: false, error: "id o code requerido" }, { status: 400 });
  }

  // estrategia: setear uses=max_uses para dejarla “agotada”
  const { data, error } = await supabase
    .from("licenses")
    .select("id, max_uses, uses")
    .match(id ? { id } : { code })
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, error: "No encontrada" }, { status: 404 });

  const newUses = Math.max(Number(data.max_uses ?? 1), Number(data.uses ?? 0));

  const { error: updErr } = await supabase
    .from("licenses")
    .update({ uses: newUses })
    .match({ id: data.id });

  if (updErr) return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
