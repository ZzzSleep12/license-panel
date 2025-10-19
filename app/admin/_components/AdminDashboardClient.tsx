// app/admin/_components/AdminDashboardClient.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type UILicense = {
  code: string;
  issued_at: number;
  expires_at: number;
  duration_days: number | null;
  uses: number;
  max_uses: number;
  is_revoked: boolean;
  notes: string | null;
  issuedAtText: string;
  expiresAtText: string;
};

export default function DashboardClient({ licenses }: { licenses: UILicense[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [filter, setFilter] = useState<"all" | "active" | "expired" | "revoked">(
    "all",
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    return (licenses ?? []).filter((l) => {
      if (filter === "active") {
        const notExpired = l.expires_at === 0 || l.expires_at * 1000 > now;
        return !l.is_revoked && notExpired;
      }
      if (filter === "expired") {
        return !l.is_revoked && l.expires_at > 0 && l.expires_at * 1000 <= now;
      }
      if (filter === "revoked") {
        return l.is_revoked;
      }
      return true;
    });
  }, [licenses, filter]);

  async function createAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return alert("Usuario y contraseña son requeridos.");
    try {
      setCreating(true);
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Error al crear admin");
      alert("Administrador creado correctamente.");
      setUsername("");
      setPassword("");
    } catch (err: any) {
      alert(err?.message || "Error desconocido");
    } finally {
      setCreating(false);
    }
  }

  async function revoke(code: string) {
    if (!confirm(`¿Revocar código ${code}?`)) return;
    try {
      setRevoking(code);
      const res = await fetch("/api/admin/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "No se pudo revocar");
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Error desconocido");
    } finally {
      setRevoking(null);
    }
  }

  return (
    <>
      <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-4">
        <h2 className="text-lg font-semibold">Crear nuevo administrador</h2>
        <form onSubmit={createAdmin} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
          <input
            className="rounded-md bg-neutral-800 px-3 py-2 outline-none border border-neutral-700 focus:border-neutral-500"
            placeholder="usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
          />
          <input
            className="rounded-md bg-neutral-800 px-3 py-2 outline-none border border-neutral-700 focus:border-neutral-500"
            placeholder="contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
          />
          <button
            disabled={creating}
            className="rounded-md bg-blue-600 px-4 py-2 hover:bg-blue-500 disabled:opacity-60"
          >
            {creating ? "Creando…" : "Crear"}
          </button>
        </form>
        <p className="text-neutral-400 text-sm">
          Consejo: usa contraseñas fuertes; podrás compartir este usuario con otros
          admins de confianza.
        </p>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Licencias</h2>
          <div className="flex items-center gap-2">
            <select
              className="rounded-md bg-neutral-800 px-3 py-2 border border-neutral-700"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              title="Filtro"
            >
              <option value="all">Todas</option>
              <option value="active">Activas</option>
              <option value="expired">Expiradas</option>
              <option value="revoked">Revocadas</option>
            </select>
            <a
              href="/admin/generate"
              className="rounded-md bg-emerald-600 px-3 py-2 hover:bg-emerald-500"
            >
              + Generar
            </a>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-neutral-300">
              <tr className="[&>th]:py-2 [&>th]:px-3">
                <th className="text-left">Código</th>
                <th className="text-right">Usos</th>
                <th className="text-left">Emitida</th>
                <th className="text-left">Expira</th>
                <th className="text-left">Notas</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {(filtered ?? []).map((l) => (
                <tr key={l.code} className="[&>td]:py-2 [&>td]:px-3">
                  <td className="font-mono">{l.code}</td>
                  <td className="text-right">
                    {l.uses}/{l.max_uses}
                  </td>
                  <td>{l.issuedAtText}</td>
                  <td className={l.expires_at && l.expires_at * 1000 <= Date.now() ? "text-red-400" : ""}>
                    {l.expiresAtText}
                  </td>
                  <td className="max-w-[18rem] truncate">
                    {l.notes ?? "—"}
                  </td>
                  <td className="text-right">
                    {l.is_revoked ? (
                      <span className="text-neutral-400">Revocada</span>
                    ) : (
                      <button
                        onClick={() => revoke(l.code)}
                        disabled={revoking === l.code}
                        className="rounded-md bg-red-600 px-3 py-1.5 hover:bg-red-500 disabled:opacity-60"
                        title="Revocar"
                      >
                        {revoking === l.code ? "Revocando…" : "Revocar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td className="py-6 px-3 text-neutral-400" colSpan={6}>
                    No hay licencias para el filtro seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
