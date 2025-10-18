// app/api/admin/list/route.ts
import { NextResponse } from "next/server";
import { getAdminClient, NO_EXPIRY_EPOCH } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("licenses")
      .select("*")
      .order("issued_at", { ascending: false });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    // devolvemos tal cual (epoch seconds), la UI los formatea
    return NextResponse.json({ ok: true, items: data, sentinel: NO_EXPIRY_EPOCH });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unexpected" }, { status: 500 });
  }
}
