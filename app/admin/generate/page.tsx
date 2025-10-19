// app/admin/generate/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function GeneratePage() {
  async function onSubmit(formData: FormData) {
    "use server"; // Mantiene esto como Server Action para POST directo

    const count = Number(formData.get("count") ?? 1);
    const durationDays = Number(formData.get("durationDays") ?? 0);
    const maxUses = Number(formData.get("maxUses") ?? 1);
    const notes = String(formData.get("notes") ?? "");

    // Llamamos al endpoint interno
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/admin/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // En server action tenemos credenciales de la request actual (cookie admin)
      body: JSON.stringify({ count, durationDays, maxUses, notes }),
    });

    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(j?.error || "No se pudo generar");
    }

    // Mostramos un alert en el cliente con JS embebido
    // (simple; si usas toasts en client component, puedes mejorarlo)
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `alert("Generados: ${j.generated} códigos"); window.location.href="/admin";`,
        }}
      />
    );
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

      <form action={onSubmit} className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="space-y-1">
          <label className="text-sm text-neutral-300">Cantidad</label>
          <input
            name="count"
            type="number"
            min={1}
            max={100}
            defaultValue={1}
            className="w-full rounded-md bg-neutral-800 px-3 py-2 outline-none border border-neutral-700 focus:border-neutral-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-300">
            Duración (días) — 0 = sin caducidad
          </label>
          <input
            name="durationDays"
            type="number"
            min={0}
            defaultValue={30}
            className="w-full rounded-md bg-neutral-800 px-3 py-2 outline-none border border-neutral-700 focus:border-neutral-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-300">Usos máx. por código</label>
          <input
            name="maxUses"
            type="number"
            min={1}
            defaultValue={1}
            className="w-full rounded-md bg-neutral-800 px-3 py-2 outline-none border border-neutral-700 focus:border-neutral-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-300">Notas (opcional)</label>
          <input
            name="notes"
            placeholder="Ej: Plan mensual"
            className="w-full rounded-md bg-neutral-800 px-3 py-2 outline-none border border-neutral-700 focus:border-neutral-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 hover:bg-blue-500"
        >
          Generar
        </button>
      </form>
    </div>
  );
}
