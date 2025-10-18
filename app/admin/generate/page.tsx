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
      alert(`Generadas: ${res.items.length}`);
      // opcional: mostrar los códigos o redirigir al dashboard
    }
  } finally {
    setLoading(false);
  }
}
