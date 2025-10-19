// app/admin/generate/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function GeneratePage() {
  const [count, setCount] = useState<number>(1);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [maxUses, setMaxUses] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // envía la cookie de admin
        body: JSON.stringify({
          count: Number(count),
          durationDays: Number(durationDays),
          maxUses: Number(maxUses),
          notes: notes.trim(),
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j?.error || "No se pudo generar");
        return;
      }

      alert(`Generados: ${j.generated} códigos`);
      // Opcional: vuelve al dashboard
      window.location.href = "/admin";
    } catch (err: any) {
      alert(err?.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Generar licencias</h1>
        <Link
          href="/admin"
          className="rounded-md bg-neutral-800 px-3 py-2 border border-neutral-700 hover:bg-neutral-700"
        >
          ← Volver
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-5"
      >
        <div className="space-y-1">
          <label className="text-sm text-neutral-300">Cantidad</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full rounded-md bg-neutral-800 px-3 py-2 outline-none border border-neutral-700 focus:border-neutral-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-300">
            Duración (días) — 0 = sin caducidad
          </label>
          <input
            type="number"
            min={0}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="w-full rounded-md bg-neutral-800 px-3 py-2 outline-none border border-neutral-700 focus:border-neutral-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-300">Usos máx. por código</label>
          <input
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
            className="w-full rounded-md bg-neutral-800 px-3 py-2 outline-none border border-neutral-700 focus:border-neutral-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-300">Notas (opcional)</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Plan mensual"
            className="w-full rounded-md bg-neutral-800 px-3 py-2 outline-none border border-neutral-700 focus:border-neutral-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "Generando..." : "Generar"}
        </button>
      </form>
    </div>
  );
}
