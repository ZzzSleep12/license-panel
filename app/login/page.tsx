"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Papasconsal12");
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
        body: JSON.stringify({ username, password })
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

  useEffect(() => {
    // Nada por ahora
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="container-card w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold mb-2">Acceso administrador</h1>
        <p className="text-sm text-neutral-400 mb-6">
          Ingresa con tu usuario y contraseña.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Usuario</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {err && <div className="text-red-400 text-sm">{err}</div>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
