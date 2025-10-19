"use client";

import { useState } from "react";

export default function GeneratePage() {
  const [qty, setQty] = useState(1);
  const [days, setDays] = useState(30);
  const [maxPerCode, setMaxPerCode] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANTE: envía cookies de sesión
        credentials: "include",
        body: JSON.stringify({
          qty: Number(qty),
          duration_days: Number(days),
          max_uses: Number(maxPerCode),
          notes: notes || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Unauthorized");
      alert(`Generados: ${json.codes?.length ?? 0} códigos`);
    } catch (err: any) {
      alert(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Generar licencias</h1>
      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Cantidad</span>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="rounded border border-white/10 bg-black/20 px-3 py-2 outline-none"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Duración (días) — 0 = sin caducidad</span>
          <input
            type="number"
            min={0}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded border border-white/10 bg-black/20 px-3 py-2 outline-none"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Usos máx. por código</span>
          <input
            type="number"
            min={1}
            value={maxPerCode}
            onChange={(e) => setMaxPerCode(Number(e.target.value))}
            className="rounded border border-white/10 bg-black/20 px-3 py-2 outline-none"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Notas (opcional)</span>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Plan mensual"
            className="rounded border border-white/10 bg-black/20 px-3 py-2 outline-none"
          />
        </label>

        <button
          disabled={loading}
          className="rounded bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading ? "Generando..." : "Generar"}
        </button>
      </form>
    </div>
  );
}
