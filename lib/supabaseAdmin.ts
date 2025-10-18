// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

export const SECONDS_PER_DAY = 86_400;
export const NO_EXPIRY_EPOCH = 4_102_444_800; // 2100-01-01 UTC (sentinel)
export const nowEpoch = () => Math.floor(Date.now() / 1000);

export type LicenseRow = {
  id: string;
  code: string;
  issued_at: number;     // epoch seconds (UTC)
  expires_at: number;    // epoch seconds (UTC) o NO_EXPIRY_EPOCH
  duration_days: number;
  max_uses: number;
  uses: number;
  is_revoked: boolean;
  notes: string | null;
  created_at?: string;
};

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) {
    throw new Error(
      "Faltan env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)"
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// COMPAT: si quedara algún import antiguo
export const supabaseAdmin = getAdminClient();
