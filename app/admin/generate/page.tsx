"use client";
import { useState } from "react";

export default function GeneratePage() {
  const [days, setDays] = useState(30);
  const [maxUses, setMaxUses] = useState(1);
  const [count, setCount] = useState(1);
  const [codes, setCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCodes([]);
    setLoading(true);
    try {
      const r = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, max_uses: maxUses, count })
      });
      const js = await r.json();
      if (!js.ok) {
        setError(js.error || "Error");
      } else {
        setCodes(js.codes || []);
      }
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Generar licencias</h2>
      <form onSubmit={submit} style={{ maxWidth: 420 }}>
        <label>Días</label>
        <input type="number" value={days} onChange={(e) => setDays(parseInt(e.target.value || "0"))} />
        <label>Máximo usos (0=∞)</label>
        <input type="number" value={maxUses} onChange={(e) => setMaxUses(parseInt(e.target.value || "0"))} />
        <label>Cantidad</label>
        <input type="number" value={count} onChange={(e) => setCount(parseInt(e.target.value || "0"))} />
        <button style={{ marginTop: 10 }} disabled={loading}>
          {loading ? "Generando..." : "Generar"}
        </button>
      </form>

      {error && <p style={{ color: "#ff7a7a" }}>{error}</p>}
      {codes.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Códigos generados (copiar completo):</h3>
          <pre style={{ background: "#0f1216", padding: 12, borderRadius: 8 }}>{codes.join("\n")}</pre>
        </div>
      )}

      <p style={{ marginTop: 16 }}>
        ← <a href="/admin">Volver al dashboard</a>
      </p>
    </div>
  );
}
