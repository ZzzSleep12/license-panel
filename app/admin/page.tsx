"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";

// Tipos que esperamos del backend
type LicenseRow = {
  id: string;
  code: string;
  issued_at: number | null;     // epoch seconds (puede venir null si no lo asignas)
  expires_at: number | null;    // epoch seconds o null (0 = sin caducidad)
  duration_days: number;
  max_uses: number;
  uses: number;
  is_revoked: boolean;
  notes: string | null;
  created_at?: string | null;   // timestamptz (para compatibilidad)
};

// Helpers de formateo
const fmtDate = (epochSec: number | null | undefined) => {
  if (!epochSec || epochSec <= 0) return "—";
  try {
    const d = new Date(epochSec * 1000);
    return d.toLocaleString();
  } catch {
    return "—";
  }
};

const badge = (txt: string) => (
  <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-xs">
    {txt}
  </span>
);

export default function AdminPage() {
  const [items, setItems] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Crear admin local
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");

  // Filtro
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "revoked">(
    "all"
  );

  // Cargar licencias
  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/list", { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error al listar");
      setItems(json.items as LicenseRow[]);
    } catch (e: any) {
      alert(e?.message ?? "No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    let total = items.length;
    let active = 0;
    let expired = 0;

    for (const it of items) {
      const exp = it.expires_at ?? 0;
      const isExpired = exp > 0 && exp < now;
      if (it.is_revoked) continue;
      if (isExpired) expired++;
      else active++;
    }
    return { total, active, expired };
  }, [items]);

  const shown = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return items.filter((it) => {
      if (filter === "all") return true;
      if (filter === "revoked") return it.is_revoked;
      const exp = it.expires_at ?? 0;
      const isExpired = exp > 0 && exp < now;
      if (filter === "expired") return !it.is_revoked && isExpired;
      if (filter === "active") return !it.is_revoked && !isExpired;
      return true;
    });
  }, [items, filter]);

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser || !newPass) {
      alert("Ingresa usuario y contraseña");
      return;
    }
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUser, password: newPass }),
      }).then((r) => r.json());
      if (!res.ok) throw new Error(res.error || "No se pudo crear");
      alert("Admin creado");
      setNewUser("");
      setNewPass("");
    } catch (e: any) {
      alert(e?.message ?? "Error creando admin");
    }
  };

  const revoke = async (id: string) => {
    if (!confirm("¿Revocar este código?")) return;
    try {
      const res = await fetch("/api/admin/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).then((r) => r.json());
      if (!res.ok) throw new Error(res.error || "No se pudo revocar");
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Error al revocar");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Panel de Licencias</h1>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-white/10 p-4 bg-black/20">
          <div className="text-sm opacity-70 mb-1">Totales</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        <div className="rounded-lg border border-white/10 p-4 bg-black/20">
          <div className="text-sm opacity-70 mb-1">Activas</div>
          <div className="text-3xl font-bold text-green-400">{stats.active}</div>
        </div>
        <div className="rounded-lg border border-white/10 p-4 bg-black/20">
          <div className="text-sm opacity-70 mb-1">Expiradas</div>
          <div className="text-3xl font-bold text-red-400">{stats.expired}</div>
        </div>
      </div>

      {/* Crear admin */}
      <div className="rounded-lg border border-white/10 p-4 bg-black/20 mb-8">
        <h2 className="text-lg font-medium mb-3">Crear nuevo administrador</h2>
        <form
          onSubmit={createAdmin}
          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3"
        >
          <input
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            placeholder="usuario"
            className="rounded border border-white/10 bg-black/20 px-3 py-2 outline-none"
          />
          <input
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="contraseña"
            type="password"
            className="rounded border border-white/10 bg-black/20 px-3 py-2 outline-none"
          />
          <button className="rounded bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm">
            Crear
          </button>
        </form>
        <p className="text-xs opacity-60 mt-2">
          Consejo: usa contraseñas fuertes; podrás compartir este usuario con
          otros admins de confianza.
        </p>
      </div>

      {/* Tabla de licencias */}
      <div className="rounded-lg border border-white/10 p-4 bg-black/20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Licencias</h2>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as typeof filter)
              }
              className="rounded border border-white/10 bg-black/20 px-3 py-1.5 text-sm outline-none"
            >
              <option value="all">Todas</option>
              <option value="active">Activas</option>
              <option value="expired">Expiradas</option>
              <option value="revoked">Revocadas</option>
            </select>
            <a
              href="/admin/generate"
              className="rounded bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-sm"
            >
              + Generar
            </a>
          </div>
        </div>

        {loading ? (
          <div className="opacity-70 text-sm">Cargando…</div>
        ) : shown.length === 0 ? (
          <div className="opacity-70 text-sm">No hay resultados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left opacity-70">
                <tr>
                  <th className="py-2 pr-4">Código</th>
                  <th className="py-2 pr-4">Usos</th>
                  <th className="py-2 pr-4">Emitida</th>
                  <th className="py-2 pr-4">Expira</th>
                  <th className="py-2 pr-4">Notas</th>
                  <th className="py-2 pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((it) => {
                  const usesTxt = `${it.uses ?? 0}/${it.max_uses ?? 1}`;
                  const issued =
                    it.issued_at != null
                      ? fmtDate(it.issued_at)
                      : // fallback por si tienes created_at en timestamptz:
                        (it.created_at
                          ? new Date(it.created_at).toLocaleString()
                          : "—");
                  const exp = it.expires_at && it.expires_at > 0
                    ? fmtDate(it.expires_at)
                    : "—";
                  const status =
                    it.is_revoked
                      ? badge("revocada")
                      : it.expires_at && it.expires_at > 0 && it.expires_at < Math.floor(Date.now() / 1000)
                      ? badge("expirada")
                      : badge("activa");

                  return (
                    <tr key={it.id} className="border-t border-white/10">
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <code className="opacity-90">{it.code}</code>
                          {status}
                        </div>
                      </td>
                      <td className="py-2 pr-4">{usesTxt}</td>
                      <td className="py-2 pr-4">{issued}</td>
                      <td className="py-2 pr-4">{exp}</td>
                      <td className="py-2 pr-4">{it.notes ?? "—"}</td>
                      <td className="py-2 pr-4">
                        <button
                          onClick={() => revoke(it.id)}
                          disabled={it.is_revoked}
                          className="rounded bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs disabled:opacity-50"
                        >
                          Revocar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
