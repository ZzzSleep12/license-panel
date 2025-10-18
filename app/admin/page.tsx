"use client";

import { useEffect, useMemo, useState } from "react";
import { FaKey, FaTrash, FaCheckCircle, FaTimesCircle, FaCopy } from "react-icons/fa";

type LicenseItem = {
  id: string;
  code: string;
  issued_at: number | null;
  expires_at: number | null;
  max_uses: number;
  uses: number;
  active: boolean;
  expired: boolean;
  exhausted: boolean;
};

type Metrics = {
  total: number;
  active: number;
  expired: number;
  exhausted: number;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<LicenseItem[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ total: 0, active: 0, expired: 0, exhausted: 0 });
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => i.code.toLowerCase().includes(s));
  }, [q, items]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/list", { cache: "no-store" });
      const json = await res.json();
      if (json?.ok) {
        setItems(json.items);
        setMetrics(json.metrics);
      } else {
        console.error(json);
        alert(json?.error ?? "Error cargando licencias");
      }
    } catch (e) {
      console.error(e);
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("¿Revocar esta licencia? Quedará agotada.")) return;
    try {
      const res = await fetch("/api/admin/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json?.ok) {
        await load();
      } else {
        alert(json?.error ?? "No se pudo revocar");
      }
    } catch (e) {
      console.error(e);
      alert("Error de red");
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-bg text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FaKey className="text-accent" /> Dashboard de licencias
          </h1>
          <a
            href="/admin/generate"
            className="bg-accent hover:bg-accent2 transition px-4 py-2 rounded-md font-semibold"
          >
            + Generar licencias
          </a>
        </header>

        {/* Cards de métricas */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard title="Totales" value={metrics.total} />
          <MetricCard title="Activas" value={metrics.active} accent="text-green-400" />
          <MetricCard title="Expiradas" value={metrics.expired} accent="text-red-400" />
          <MetricCard title="Agotadas" value={metrics.exhausted} accent="text-yellow-300" />
        </section>

        {/* Buscador */}
        <div className="bg-panel border border-border rounded-xl p-4 mb-4">
          <input
            className="w-full"
            placeholder="Buscar por código…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <section className="bg-panel border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full">
              <thead className="bg-card">
                <tr className="text-left text-sm text-muted">
                  <th className="p-3">Código</th>
                  <th className="p-3">Emitida</th>
                  <th className="p-3">Expira</th>
                  <th className="p-3">Usos</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted">
                      Cargando…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted">
                      Sin resultados
                    </td>
                  </tr>
                ) : (
                  filtered.map((x) => (
                    <tr key={x.id} className="border-t border-border">
                      <td className="p-3 font-mono">
                        <div className="flex items-center gap-2">
                          {x.code}
                          <button
                            title="Copiar"
                            onClick={() => copy(x.code)}
                            className="p-1 rounded hover:bg-card"
                          >
                            <FaCopy />
                          </button>
                        </div>
                      </td>
                      <td className="p-3">{fmtDate(x.issued_at)}</td>
                      <td className="p-3">{fmtDate(x.expires_at)}</td>
                      <td className="p-3">
                        {x.uses}/{x.max_uses}
                      </td>
                      <td className="p-3">
                        {x.active ? (
                          <span className="inline-flex items-center gap-2 text-green-400">
                            <FaCheckCircle /> Activa
                          </span>
                        ) : x.expired ? (
                          <span className="inline-flex items-center gap-2 text-red-400">
                            <FaTimesCircle /> Expirada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-yellow-300">
                            <FaTimesCircle /> Agotada
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => revoke(x.id)}
                          className="inline-flex items-center gap-2 bg-card hover:bg-border text-white px-3 py-2 rounded-md"
                        >
                          <FaTrash /> Revocar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function fmtDate(ts: number | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString();
}

function MetricCard({ title, value, accent }: { title: string; value: number; accent?: string }) {
  return (
    <div className="bg-panel border border-border rounded-xl p-5 shadow-soft">
      <p className="text-sm text-muted">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${accent ?? ""}`}>{value}</p>
    </div>
  );
}
