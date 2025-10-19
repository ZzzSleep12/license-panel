// lib/supabaseAdmin.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error("Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
}

export const supabaseAdmin: SupabaseClient = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Helpers de tiempo (en segundos Unix)
export const SECONDS_PER_DAY = 86400;
export const nowEpoch = () => Math.floor(Date.now() / 1000);
// Semántica: 0 = sin caducidad
export const NO_EXPIRY_EPOCH = 0;

// Tipado de la tabla licenses (como la definiste en SQL)
export type LicenseRow = {
  id: string;
  code: string;
  issued_at: number;
  expires_at: number;
  duration_days: number | null;
  max_uses: number;
  uses: number;
  is_revoked: boolean;
  notes: string | null;
  created_at: string;
};

// Por legibilidad, un getter (igual a supabaseAdmin, útil si en el futuro cambias algo)
export const getAdminClient = () => supabaseAdmin;
