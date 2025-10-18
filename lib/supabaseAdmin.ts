import { createClient } from "@supabase/supabase-js";

// Cliente con la clave secreta SERVICE_ROLE (solo del servidor)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
  { auth: { persistSession: false } }
);
