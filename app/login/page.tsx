"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center">
      <div className="bg-panel border border-border rounded-2xl shadow-soft p-8 w-[380px]">
        <h2 className="text-2xl font-semibold text-center mb-4">🔐 Login Admin</h2>

        <p className="text-muted text-sm mb-4 text-center">
          Introduce tu correo de administrador para recibir el enlace mágico.
        </p>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="admin@tudominio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent2 text-white py-2 rounded-md transition"
          >
            Enviar enlace
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-4">
          Asegúrate de haber agregado tu correo como admin en Supabase → Authentication → Users.
        </p>
      </div>
    </main>
  );
}
