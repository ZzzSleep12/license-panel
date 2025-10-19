// app/admin/generate/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const qty = Number(form.get("qty") || 1);
      const days = Number(form.get("days") || 0);
      const max_uses = Number(form.get("max_uses") || 1);
      const notes = (form.get("notes") as string) || "";

      const resp = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ qty, days, max_uses, notes }),
      });

      const data = await resp.json();

      if (!resp.ok || !data?.ok) {
        alert(data?.error || "Error generando licencias");
        return;
      }

      const count: number = Number(data.count ?? 0);
      alert(`Generados: ${count} códigos`);

      // refresca datos y regresa al dashboard
      router.refresh();
      router.push("/admin");
    } catch (err: any) {
      alert(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Generar licencias</h1>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="space-y-1">
          <label className="text-sm text-neutral-300">Cantidad</label>
          <input
            name="qty"
            type="number"
            min={1}
            max={100}
            defaultValue={1}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-300">Duración (días) — 0 = sin caducidad</label>
          <input
            name="days"
            type="number"
            min={0}
            max={3650}
            defaultValue={30}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-300">Usos máx. por código</label>
          <input
            name="max_uses"
            type="number"
            min={1}
            max={1000}
            defaultValue={1}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-300">Notas (opcional)</label>
          <input
            name="notes"
            placeholder="Ej: Plan mensual"
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "Generando..." : "Generar..."}
        </button>
      </form>
    </div>
  );
}
