// lib/supabaseAdmin.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Lanzamos error en build si faltan vars
if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error(
    "Missing Supabase admin env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)"
  );
}

// Cliente singleton para no recrearlo en cada request
let _adminClient: SupabaseClient | null = null;

/**
 * Devuelve el cliente de admin (service role).
 * Mantengo este nombre porque algunos archivos lo importaban así.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;
  _adminClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
    global: { headers: { "X-Client-Info": "license-panel-admin" } },
  });
  return _adminClient;
}

/**
 * Alias exportado (algunos archivos usaban `supabaseAdmin`).
 * Así evitamos errores de “no exportado”.
 */
export const supabaseAdmin: SupabaseClient = getSupabaseAdmin();

/** Tipos que usa el panel */
export type LicenseRow = {
  id: string;
  code: string;
  issued_at: number;      // epoch seconds (UTC)
  expires_at: number;     // epoch seconds (UTC)
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
