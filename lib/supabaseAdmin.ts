import { createClient } from "@supabase/supabase-js";

export const SECONDS_PER_DAY = 86400;
// Sentinel para “sin caducidad” (2100-01-01 UTC)
export const NO_EXPIRY_EPOCH = 4102444800;

export const epochSec = (d: Date) => Math.floor(d.getTime() / 1000);

export type LicenseRow = {
  id: string;
  code: string;
  issued_at: number;     // epoch sec
  expires_at: number;    // epoch sec (o sentinel)
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
    throw new Error("Faltan env vars de Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
