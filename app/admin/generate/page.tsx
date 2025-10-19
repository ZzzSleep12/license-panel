// app/admin/generate/page.tsx
"use client";

import * as React from "react";
import { useState } from "react";

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const count = Number(form.get("count") ?? 1);
      const duration_days = Number(form.get("duration_days") ?? 0);
      const max_uses = Number(form.get("max_uses") ?? 1);
      const notes = String(form.get("notes") ?? "").trim() || null;

      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, duration_days, max_uses, notes }),
      }).then((r) => r.json());

      if (!res.ok) {
        alert(res.error ?? "No se pudo generar");
      } else {
        const codes = (res.items ?? []).map((r: any) => r.code).join("\n");
        alert(`Generadas: ${(res.items ?? []).length}\n\n${codes}`);
      }
    } catch (err: any) {
      alert(err?.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Generar licencias</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-sm mb-1">Cantidad</span>
            <input
              name="count"
              type="number"
              min={1}
              defaultValue={5}
              className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 outline-none"
              required
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">
              Duración (días) — 0 = sin caducidad
            </span>
            <input
              name="duration_days"
              type="number"
              min={0}
              defaultValue={30}
              className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 outline-none"
              required
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Usos máx. por código</span>
            <input
              name="max_uses"
              type="number"
              min={1}
              defaultValue={1}
              className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 outline-none"
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="block text-sm mb-1">Notas (opcional)</span>
          <input
            name="notes"
            placeholder="Ej: Plan mensual"
            className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 outline-none"
          />
        </label>

        <button
          disabled={loading}
          className="rounded bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm disabled:opacity-60"
        >
          {loading ? "Generando..." : "Generar"}
        </button>
      </form>
    </div>
  );
}
