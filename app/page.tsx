export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="mx-auto container-card max-w-xl p-8 text-center">
        <div className="text-3xl font-bold mb-2">🎟️ Panel de Licencias</div>
        <p className="text-neutral-300 mb-6">
          Administra licencias para tu aplicación de forma segura.
        </p>
        <a className="btn-primary" href="/admin">Ir al Dashboard</a>
        <p className="mt-6 text-neutral-400 text-sm">
          Endpoint público:{" "}
          <code className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700">/api/validate</code>
        </p>
      </div>
    </div>
  );
}
