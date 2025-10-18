import { supabaseAdmin } from "@/lib/supabaseAdmin";

function fmt(ts: number) {
  const d = new Date(ts * 1000);
  return d.toISOString().replace("T", " ").replace(".000Z", " UTC");
}

export default async function AdminPage() {
  const now = Math.floor(Date.now() / 1000);

  // métricas (sin RPC, consultas simples)
  const { data: all, error: eAll } = await supabaseAdmin
    .from("licenses")
    .select("*")
    .order("id", { ascending: false })
    .limit(1000);
  if (eAll) {
    return <div>Error cargando datos: {eAll.message}</div>;
  }

  const total = all?.length ?? 0;
  const active = all?.filter((r) => !r.revoked && r.expires_at > now).length ?? 0;
  const expired = all?.filter((r) => r.expires_at <= now).length ?? 0;
  const revoked = all?.filter((r) => r.revoked).length ?? 0;

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, margin: "12px 0 24px" }}>
        <Card title="Total" value={String(total)} />
        <Card title="Activas" value={String(active)} />
        <Card title="Expiradas" value={String(expired)} />
        <Card title="Revocadas" value={String(revoked)} />
      </div>

      <a href="/admin/generate">➕ Generar licencias</a>

      <div style={{ marginTop: 16 }}>
        <h3>Últimas licencias</h3>
        <div style={{ overflow: "auto", maxHeight: 520, border: "1px solid #222", borderRadius: 10, padding: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Días</th>
                <th>Expira</th>
                <th>Usos</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {all?.map((r: any) => (
                <tr key={r.id} style={{ borderTop: "1px solid #222" }}>
                  <td>{r.id}</td>
                  <td style={{ fontFamily: "monospace" }}>{r.code}</td>
                  <td>{r.days}</td>
                  <td>{fmt(r.expires_at)}</td>
                  <td>
                    {r.uses}/{r.max_uses === 0 ? "∞" : r.max_uses}
                  </td>
                  <td>{r.revoked ? "revocado" : r.expires_at > now ? "activo" : "expirado"}</td>
                  <td>
                    {!r.revoked && (
                      <form action="/api/admin/revoke" method="post">
                        <input type="hidden" name="id" value={r.id} />
                        <button>Revocar</button>
                      </form>
                    )}
                  </td>
                </tr>
              )) ?? null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ background: "#13161a", padding: 16, borderRadius: 12 }}>
      <div style={{ opacity: 0.7 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
