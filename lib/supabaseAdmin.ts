// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

// Tipos de la fila (ajústalos a tu tabla si añadiste columnas nuevas)
export type LicenseRow = {
  code: string;
  max_uses: number;
  uses: number;
  issued_at: string;
  expires_at: string | null;
  notes: string | null;
};

// Creamos el cliente SOLO cuando lo pedimos (dentro del handler)
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase admin env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: fetch as any },
  });
}
