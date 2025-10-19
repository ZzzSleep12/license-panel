// app/admin/generate/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function GeneratePage() {
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    const qty = Number(formData.get("qty") || 1);
    const days = Number(formData.get("days") || 0);
    const max_uses = Number(formData.get("max_uses") || 1);
    const notes = String(formData.get("notes") || "");

    const res = await fetch("/api/admin/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty, days, max_uses, notes }),
    });
    const j = await res.json();
    if (!j.ok) return alert(j.error || "Error");
    alert(`Generados: ${j.generated.length} códigos`);
    router.push("/admin");
  }

  return (
    <div className="mx-auto max-w-xl p-6 text-neutral-200">
      <h1 className="mb-6 text-2xl font-semibold">Generar licencias</h1>

      <form action={onSubmit} className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
        <div>
          <label className="text-sm text-neutral-400">Cantidad</label>
          <input
            name="qty"
            defaultValue={1}
            min={1}
            type="number"
            className="mt-1 w-full rounded-md border border-neutral-700 bg-black/30 px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-neutral-400">Duración (días) — 0 = sin caducidad</label>
          <input
            name="days"
            defaultValue={30}
            min={0}
            type="number"
            className="mt-1 w-full rounded-md border border-neutral-700 bg-black/30 px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-neutral-400">Usos máx. por código</label>
          <input
            name="max_uses"
            defaultValue={1}
            min={1}
            type="number"
            className="mt-1 w-full rounded-md border border-neutral-700 bg-black/30 px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-neutral-400">Notas (opcional)</label>
          <input
            name="notes"
            placeholder="Ej: Plan mensual"
            className="mt-1 w-full rounded-md border border-neutral-700 bg-black/30 px-3 py-2 outline-none"
          />
        </div>

        <button className="w-full rounded-md bg-blue-600 py-2 font-medium text-white">
          Generar…
        </button>
      </form>
    </div>
  );
}
