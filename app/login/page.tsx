"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        cache: "no-store",
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Credenciales inválidas");
      const next = new URLSearchParams(window.location.search).get("next") || "/admin";
      window.location.href = next;
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="container-card w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold mb-2">Acceso administrador</h1>
        <p className="text-sm text-neutral-400 mb-6">
          Ingresa tu usuario y contraseña.
        </p>

        <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
          {/* Campos “honeypot” invisibles para desactivar autofill agresivo de algunos navegadores */}
          <input type="text" name="fake-user" className="hidden" autoComplete="username" />
          <input type="password" name="fake-pass" className="hidden" autoComplete="current-password" />

          <div>
            <label className="label">Usuario</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario"
              autoComplete="new-username"
              inputMode="text"
            />
          </div>

          <div>
            <label className="label">Contraseña</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="contraseña"
              autoComplete="new-password"
            />
          </div>

          {err && <div className="text-red-400 text-sm">{err}</div>}

          <button className="btn-primary w-full" disabled={loading || !username || !password}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
