// lib/supabaseAdmin.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Tipado de la fila en la tabla public.licenses
 * Ajustado a tu esquema: BIGINT en DB => number (epoch seconds) en la app.
 */
export interface LicenseRow {
  id: string;
  code: string;
  issued_at: number;       // BIGINT (epoch seconds)
  expires_at: number;      // BIGINT (epoch seconds)
  duration_days: number;   // INTEGER
  max_uses: number;        // INTEGER
  uses: number;            // INTEGER
  is_revoked: boolean;     // BOOLEAN
  notes: string | null;    // TEXT (nullable)
  created_at: string;      // timestamptz ISO string
}

/** Sentinel para “sin caducidad” (2100-01-01 00:00:00 UTC) */
export const NO_EXPIRY_EPOCH = 4102444800;

/** Asegura variables de entorno necesarias */
function assertEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase admin env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)"
    );
  }
  return { url, key };
}

let _adminClient: SupabaseClient | null = null;

/**
 * Devuelve un cliente de Supabase con la SERVICE ROLE KEY (sólo servidor).
 * Se memoiza para evitar recrearlo en cada import.
 */
export function getAdminClient(): SupabaseClient {
  if (_adminClient) return _adminClient;
  const { url, key } = assertEnv();
  _adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  });
  return _adminClient;
}

/**
 * Alias exportado para compatibilidad con rutas que importan `supabaseAdmin`.
 * Internamente usa el mismo singleton.
 */
export const supabaseAdmin = getAdminClient();

/** Helpers opcionales que pueden usar tus rutas */
export const epochSec = (d: Date) => Math.floor(d.getTime() / 1000);
export const SECONDS_PER_DAY = 86400;
