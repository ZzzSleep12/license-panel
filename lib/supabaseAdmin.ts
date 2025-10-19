// lib/supabaseAdmin.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/** Constantes y helpers que usan varios endpoints */
export const SECONDS_PER_DAY = 60 * 60 * 24;
/** 0 = sin caducidad (compatibilidad) */
export const NO_EXPIRY_EPOCH = 0;
/** Epoch (UTC) en segundos */
export const nowEpoch = () => Math.floor(Date.now() / 1000);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error(
    "Missing Supabase admin env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)"
  );
}

let _adminClient: SupabaseClient | null = null;

/** Cliente admin (service role) como singleton */
export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;
  _adminClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
    global: { headers: { "X-Client-Info": "license-panel-admin" } },
  });
  return _adminClient;
}

/** Alias para compatibilidad con imports antiguos */
export const supabaseAdmin: SupabaseClient = getSupabaseAdmin();
/** Segundo alias para compatibilidad con código previo */
export const getAdminClient = getSupabaseAdmin;

/** Tipos usados en el panel */
export type LicenseRow = {
  id: string;
  code: string;
  issued_at: number;      // epoch (segundos, UTC)
  expires_at: number;     // 0 = sin caducidad
  duration_days: number;  // 0 = sin caducidad
  uses: number;
  max_uses: number;
  is_revoked: boolean;
  notes: string | null;
  created_at: string;     // timestamptz
};

export type AdminRow = {
  id: string;
  username: string;
  password_hash: string;
  is_active: boolean;
  created_at: string;
};
