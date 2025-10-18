"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON!
  );

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(false);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // redirige al dashboard después de hacer clic en el correo
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/admin`
            : undefined
      }
    });

    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h2>Login admin</h2>

      {sent ? (
        <p>Te enviamos un enlace a <b>{email}</b>. Ábrelo para entrar al panel.</p>
      ) : (
        <form onSubmit={sendMagicLink}>
          <label>Correo de administrador</label>
          <input
            required
            type="email"
            value={email}
            placeholder="admin@tu-dominio.com"
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%", padding: 10, margin: "8px 0 12px",
              borderRadius: 8, border: "1px solid #1c2127",
              background: "#0f1216", color: "#e6e8eb"
            }}
          />
          <button
            type="submit"
            style={{ padding: "10px 14px", borderRadius: 8, background: "#1f6feb", color: "#fff", border: 0 }}
          >
            Enviar enlace
          </button>
          {error && <p style={{ color: "#ff7a7a", marginTop: 10 }}>{error}</p>}
        </form>
      )}

      <p style={{ opacity: 0.75, marginTop: 12 }}>
        Recuerda dar de alta a tus admins en Supabase → Authentication → Users.
      </p>
    </main>
  );
}
