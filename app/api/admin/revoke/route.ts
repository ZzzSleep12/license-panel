// app/api/admin/revoke/route.ts
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
    const { error } = await supabase.from('licenses').delete().eq('code', code);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? 'unknown' }, { status: 500 });
  }
}
