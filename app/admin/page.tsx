// app/admin/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import DashboardClient from "./_components/AdminDashboardClient";

export const dynamic = "force-dynamic";

type License = {
  code: string;
  issued_at: number;      // epoch seconds
  expires_at: number;     // epoch seconds, 0 = sin caducidad
  duration_days: number | null;
  uses: number;
  max_uses: number;
  is_revoked: boolean;
  notes: string | null;
};

function serializeCookies() {
  const jar = cookies().getAll();
  if (!jar?.length) return "";
  return jar.map((c) => `${c.name}=${c.value}`).join("; ");
}

function fmtDateFromEpoch(epochSec: number | null | undefined) {
  if (!epochSec || epochSec <= 0) return "—";
  const d = new Date(epochSec * 1000);
  // Formato dd/mm/yyyy HH:MM:ss en tu zona local
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
}

async function getLicenses(): Promise<License[]> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_URL?.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
  const url =
    process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/list`
      : `${base}/api/admin/list`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Cookie: serializeCookies(),
    },
  });

  if (!res.ok) {
    // Si el API falla, devuelve array vacío para que el dashboard siga funcionando
    return [];
  }
  const json = await res.json().catch(() => ({ data: [] as License[] }));
  return Array.isArray(json?.data) ? (json.data as License[]) : [];
}

export default async function AdminPage() {
  const licenses = await getLicenses();

  const total = licenses.length;
  const active = licenses.filter(
    (l) => !l.is_revoked && (l.expires_at === 0 || l.expires_at * 1000 > Date.now())
  ).length;
  const expired = licenses.filter(
    (l) => !l.is_revoked && l.expires_at > 0 && l.expires_at * 1000 <= Date.now()
  ).length;

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Panel de Licencias</h1>
          <nav className="flex gap-2 text-sm">
            <Link
              href="/"
              className="rounded-md border border-neutral-800 px-3 py-2 hover:border-neutral-600"
            >
              Inicio
            </Link>
            <Link
              href="/admin/generate"
              className="rounded-md bg-blue-600 px-3 py-2 hover:bg-blue-500"
            >
              Generar
            </Link>
          </nav>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="text-neutral-400 text-sm">Totales</div>
            <div className="text-3xl font-semibold mt-1">{total}</div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="text-neutral-400 text-sm">Activas</div>
            <div className="text-3xl font-semibold mt-1 text-emerald-400">
              {active}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="text-neutral-400 text-sm">Expiradas</div>
            <div className="text-3xl font-semibold mt-1 text-red-400">
              {expired}
            </div>
          </div>
        </section>

        {/* Crear admin + Licencias */}
        <DashboardClient
          licenses={licenses.map((l) => ({
            ...l,
            issuedAtText: fmtDateFromEpoch(l.issued_at),
            expiresAtText:
              l.expires_at === 0 ? "Sin caducidad" : fmtDateFromEpoch(l.expires_at),
          }))}
        />
      </div>
    </div>
  );
}
