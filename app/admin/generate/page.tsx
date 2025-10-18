"use client";

import { useState } from "react";
import { FaMagic, FaCopy } from "react-icons/fa";

export default function GeneratePage() {
  const [amount, setAmount] = useState(5);
  const [days, setDays] = useState(30);
  const [maxUses, setMaxUses] = useState(1);
  const [creating, setCreating] = useState(false);
  const [codes, setCodes] = useState<{ id: string; code: string }[]>([]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCodes([]);
    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, days, maxUses }),
      });
      const json = await res.json();
      if (json?.ok) {
        setCodes(json.created ?? []);
      } else {
        alert(json?.error ?? "No se pudieron crear");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red");
    } finally {
      setCreating(false);
    }
  }

  function copyAll() {
    const txt = codes.map((c) => c.code).join("\n");
    navigator.clipboard.writeText(txt);
  }

  return (
    <main className="min-h-screen bg-bg text-white p-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Generar licencias</h1>
          <p className="text-muted">Crea códigos con duración y usos máximos.</p>
        </header>

        <form onSubmit={submit} className="bg-panel border border-border rounded-xl p-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Cantidad</label>
              <input
                type="number"
                min={1}
                max={200}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value || "1", 10))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Días de duración</label>
              <input
                type="number"
                min={1}
                max={3650}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value || "1", 10))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Usos máximos</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={maxUses}
                onChange={(e) => setMaxUses(parseInt(e.target.value || "1", 10))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={creating}
              className="bg-accent hover:bg-accent2 transition px-4 py-2 rounded-md font-semibold inline-flex items-center gap-2 disabled:opacity-60"
            >
              <FaMagic /> {creating ? "Creando..." : "Crear licencias"}
            </button>
            {codes.length > 0 && (
              <button
                type="button"
                onClick={copyAll}
                className="bg-card hover:bg-border px-4 py-2 rounded-md inline-flex items-center gap-2"
              >
                <FaCopy /> Copiar todas
              </button>
            )}
            <a href="/admin" className="ml-auto text-accent hover:underline">
              ← Volver al dashboard
            </a>
          </div>
        </form>

        {codes.length > 0 && (
          <section className="mt-8 bg-panel border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Códigos creados</h2>
            <div className="space-y-2">
              {codes.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-card px-3 py-2 rounded-md">
                  <code className="font-mono">{c.code}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(c.code)}
                    className="text-sm bg-border hover:bg-accent px-3 py-1 rounded-md"
                  >
                    Copiar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
