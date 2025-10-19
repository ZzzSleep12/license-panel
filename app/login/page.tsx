// app/login/page.tsx
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "Error al iniciar sesión");
        setLoading(false);
        return;
      }
      // Cookie httpOnly ya se guardó; redirigimos al dashboard:
      window.location.href = "/admin";
    } catch (err) {
      console.error(err);
      setError("Error de red");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-neutral-950 text-neutral-100 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 bg-neutral-900 border border-neutral-800 rounded-xl p-6"
      >
        <h1 className="text-xl font-semibold">Panel — Iniciar sesión</h1>

        <div className="space-y-1">
          <label className="text-sm text-neutral-300">Usuario</label>
          <input
            className="w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 outline-none"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-300">Contraseña</label>
          <input
            className="w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 outline-none"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 transition-colors px-3 py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
