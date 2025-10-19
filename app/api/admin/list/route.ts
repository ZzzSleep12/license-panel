// app/api/admin/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("licenses")
      .select(
        "code, issued_at, expires_at, duration_days, uses, max_uses, is_revoked, notes"
      )
      .order("issued_at", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, licenses: data ?? [] });
  } catch (err: any) {
    if (err?.status === 401) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
