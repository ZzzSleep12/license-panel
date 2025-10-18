// app/api/validate/route.ts
import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ ok: false, error: 'code required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: 'invalid' }, { status: 404 });
    }

    const now = new Date();
    if (data.expires_at && new Date(data.expires_at) < now) {
      return NextResponse.json({ ok: false, error: 'expired' }, { status: 403 });
    }
    if (data.uses >= data.max_uses) {
      return NextResponse.json({ ok: false, error: 'max-used' }, { status: 403 });
    }

    const { error: upErr } = await supabase
      .from('licenses')
      .update({ uses: data.uses + 1 })
      .eq('code', code);

    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
    }

    const ttl_seconds = data.expires_at
      ? Math.floor((new Date(data.expires_at).getTime() - now.getTime()) / 1000)
      : null;

    return NextResponse.json({
      ok: true,
      expires_at: data.expires_at,
      ttl_seconds,
      max_uses: data.max_uses,
      uses: data.uses + 1,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? 'unknown' }, { status: 500 });
  }
}
