// ...imports arriba
import { fmtEpochLocal } from "@/lib/date";
import { NO_EXPIRY_EPOCH } from "@/lib/supabaseAdmin";

// dentro del componente, al renderizar filas:
{items.map((r) => (
  <tr key={r.code} className="border-t border-white/10">
    <td className="py-2 font-mono text-sm break-all">{r.code}</td>
    <td className="py-2 text-center">{r.uses}/{r.max_uses}</td>
    <td className="py-2">{fmtEpochLocal(r.issued_at)}</td>
    <td className="py-2">
      {r.expires_at >= NO_EXPIRY_EPOCH ? "Sin caducidad" : fmtEpochLocal(r.expires_at)}
    </td>
    <td className="py-2">{r.notes ?? "—"}</td>
    <td className="py-2 text-right">
      <button
        onClick={async () => {
          const res = await fetch("/api/admin/revoke", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: r.code }),
          }).then((r) => r.json());
          if (!res.ok) alert(res.error ?? "No se pudo revocar");
          // refresca lista
          await reload();
        }}
        className="rounded bg-red-600 hover:bg-red-700 px-3 py-1 text-sm"
      >
        Revocar
      </button>
    </td>
  </tr>
))}
