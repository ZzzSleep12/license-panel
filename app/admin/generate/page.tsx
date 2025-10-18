"use client";

import { useState } from "react";

export default function GeneratePage() {
  const [amount, setAmount] = useState(5);
  const [days, setDays] = useState(30);
  const [maxUses, setMaxUses] = useState(1);
  const [notes, setNotes] = useState<string>("");
  const [result, setResult] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, days, maxUses, notes: notes.trim() || null })
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Error");
      setResult(j.codes as string[]);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="container-card p-6">
        <div className="text-lg font-semibold mb-4">Generar licencias</div>
        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Cantidad</label>
            <input className="input" type="number" min={1} value={amount}
              onChange={e => setAmount(parseInt(e.target.value || "1"))}/>
          </div>
          <div>
            <label className="label">Duración (días) — 0 = sin caducidad</label>
            <input className="input" type="number" min={0} value={days}
              onChange={e => setDays(parseInt(e.target.value || "0"))}/>
          </div>
          <div>
            <label className="label">Usos máximos por código</label>
            <input className="input" type="number" min={1} value={maxUses}
              onChange={e => setMaxUses(parseInt(e.target.value || "1"))}/>
          </div>
          <div>
            <label className="label">Notas (opcional)</label>
            <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: Plan mensual"/>
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary" disabled={loading}>
              {loading ? "Generando..." : "Generar"}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="container-card p-6">
          <div className="text-lg font-semibold mb-3">Códigos generados</div>
          <div className="grid sm:grid-cols-2 gap-2 font-mono">
            {result.map(c => (
              <div key={c} className="px-3 py-2 rounded border border-neutral-700 bg-neutral-900">{c}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
