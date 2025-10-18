import { NextResponse } from "next/server";
import { getAdminClient, LicenseRow } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase.from("licenses").select("*").order("issued_at", { ascending: false });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data: (data ?? []) as LicenseRow[] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "unknown" }, { status: 500 });
  }
}
