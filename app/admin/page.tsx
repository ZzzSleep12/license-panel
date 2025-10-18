"use client";

import { useEffect, useState } from "react";

type License = {
  code: string;
  max_uses: number;
  uses: number;
  issued_at: string;
  expires_at: string | null;
  notes: string | null;
};

export default function AdminDashboard() {
  const [data, setData] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");

  // nuevo: crear admin
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/list", { cache: "no-store" });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Error");
      setData(j.data as License[]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function revoke(code: string) {
    if (!confirm(`¿Revocar licencia ${code}?`)) return;
    const res = await fetch("/api/admin/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const j = await res.json();
    if (!j.ok) return alert(j.error || "Error");
    await load();
  }

  async function createAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!newUser || !newPass) return alert("Escribe usuario y contraseña");
    const res = await fetch("/api/admin/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUser, password: newPass })
    });
    const j = await res.json();
    if (!j.ok) return alert(j.error || "No se pudo crear");
    alert("Admin creado");
    setNewUser("");
    setNewPass("");
  }

  const now = Date.now();
  const shown = data.filter((r) => {
    const expired = r.expires_at ? new Date(r.expires_at).getTime() < now : false;
    if (filter === "active") return !expired;
    if (filter === "expired") return expired;
    return true;
  });

  const total = data.length;
  const active = data.filter(r => !r.expires_at || new Date(r.expires_at).getTime() >= now).length;
  const expired = total - active;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

      {/* Tarjetas resumen */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="container-card p-5">
          <div className="text-neutral-400 text-sm">Totales</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="container-card p-5">
          <div className="text-neutral-400 text-sm">Activas</div>
          <div className="text-2xl font-bold text-green-400">{active}</div>
        </div>
        <div className="container-card p-5">
          <div className="text-neutral-400 text-sm">Expiradas</div>
          <div className="text-2xl font-bold text-red-400">{expired}</div>
        </div>
      </div>

      {/* Crear nuevos administradores */}
      <div className="container-card p-6">
        <div className="text-lg font-semibold mb-4">Crear nuevo administrador</div>
        <form onSubmit={createAdmin} className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Usuario</label>
            <input className="input" value={newUser} onChange={e => setNewUser(e.target.value)} placeholder="usuario" />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input className="input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="contraseña" />
          </div>
          <div className="sm:flex sm:items-end">
            <button className="btn-primary w-full">Crear</button>
          </div>
        </form>
        <p className="text-xs text-neutral-400 mt-3">Consejo: usa contraseñas fuertes; podrás compartir este usuario con otros admins de confianza.</p>
      </div>

      {/* Licencias */}
      <div className="container-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Licencias</div>
            <p className="text-sm text-neutral-400">Administra y revoca códigos.</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="select" value={filter} onChange={e => setFilter(e.target.value as any)}>
              <option value="all">Todas</option>
              <option value="active">Solo activas</option>
              <option value="expired">Solo expiradas</option>
            </select>
            <a className="btn-primary" href="/admin/generate">+ Generar</a>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-neutral-400">Cargando...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-400">Error: {error}</div>
          ) : shown.length === 0 ? (
            <div className="p-6 text-center text-neutral-400">Sin resultados.</div>
          ) : (
            <table className="table">
              <thead>
                <tr className="tr">
                  <th className="th">Código</th>
                  <th className="th">Usos</th>
                  <th className="th">Emitida</th>
                  <th className="th">Expira</th>
                  <th className="th">Notas</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const isExpired = r.expires_at ? new Date(r.expires_at).getTime() < now : false;
                  return (
                    <tr key={r.code} className="tr">
                      <td className="td font-mono">{r.code}</td>
                      <td className="td">
                        <span className="badge">{r.uses}/{r.max_uses}</span>
                      </td>
                      <td className="td">{new Date(r.issued_at).toLocaleString()}</td>
                      <td className="td">
                        {r.expires_at ? (
                          <span className={isExpired ? "text-red-400" : ""}>
                            {new Date(r.expires_at).toLocaleString()}
                          </span>
                        ) : <span className="text-neutral-400">Sin caducidad</span>}
                      </td>
                      <td className="td">{r.notes ?? <span className="text-neutral-500">—</span>}</td>
                      <td className="td text-right">
                        <button className="btn-danger" onClick={() => revoke(r.code)}>Revocar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
