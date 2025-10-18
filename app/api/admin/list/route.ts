import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { assertAdmin } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type LicenseRow = {
  id: string;
  code: string;
  issued_at: string | null;
  expires_at: string | null;
  max_uses: number | null;
  uses: number | null;
};

export async function GET(req: NextRequest) {
  try {
    await assertAdmin(req);

const { data, error } = await supabase
  .from("licenses")
  .select("*")
  .order("issued_at", { ascending: false });

if (error) {
  return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
}

// Si quieres mantener tipos, castea aquí:
const rows = (data ?? []) as LicenseRow[];
return NextResponse.json({ ok: true, data: rows });


    const now = Date.now();

    const items = (data ?? []).map((r) => {
      const expiresAt = r.expires_at ? Date.parse(r.expires_at) : null;
      const issuedAt = r.issued_at ? Date.parse(r.issued_at) : null;
      const maxUses = r.max_uses ?? 1;
      const uses = r.uses ?? 0;

      const expired = expiresAt !== null ? expiresAt <= now : false;
      const exhausted = uses >= maxUses;
      const active = !expired && !exhausted;

      return {
        id: r.id,
        code: r.code,
        issued_at: issuedAt,
        expires_at: expiresAt,
        max_uses: maxUses,
        uses,
        active,
        expired,
        exhausted,
      };
    });

    const metrics = {
      total: items.length,
      active: items.filter((x) => x.active).length,
      expired: items.filter((x) => x.expired).length,
      exhausted: items.filter((x) => x.exhausted).length,
    };

    return NextResponse.json({ ok: true, metrics, items });
  } catch (e: any) {
    const status = e?.status ?? 500;
    return NextResponse.json({ ok: false, error: e.message ?? "error" }, { status });
  }
}
