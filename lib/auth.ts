import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Crea un cliente de Supabase que usa cookies para mantener sesión de admins
export function getSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON || "anon",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {}
      }
    }
  );
}
