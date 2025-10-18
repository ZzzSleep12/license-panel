// app/api/admin/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // IMPORTANTE: usar la service key en Vercel
);

type LicenseRow = {
  id: string;
  code: string;
  issued_at: string | null;
  expires_at: string | null;
  max_uses: number | null;
  uses: number | null;
};

export async function GET(_req: NextRequest) {
  // TODO: aquí podrías validar que el usuario sea admin
  // por ejemplo, leyendo un header o cookie si lo deseas.

  const { data, error } = await supabase
    .from<LicenseRow>("licenses")
    .select("*")
    .order("issued_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

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
}
