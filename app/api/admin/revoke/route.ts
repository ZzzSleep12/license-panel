// app/api/admin/revoke/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const body = await req.json().catch(() => ({}));
    const code: string = String(body?.code ?? body?.licencia ?? "").trim();

    if (!code) {
      return NextResponse.json(
        { ok: false, message: "Missing code" },
        { status: 400 }
      );
    }

    const sb = getAdminClient();
    const { error } = await sb
      .from("licenses")
      .update({ is_revoked: true })
      .eq("code", code);

    if (error) {
      console.error(error);
      return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.status === 401) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
