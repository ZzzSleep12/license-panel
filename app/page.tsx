export default function Home() {
  return (
    <main className="min-h-screen bg-bg text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full bg-panel border border-border rounded-2xl p-8 shadow-soft">
        <h1 className="text-3xl font-bold mb-4 text-center">🎟️ Panel de Licencias</h1>
        <p className="text-muted mb-6 text-center">
          Administra y genera licencias para tu aplicación de forma segura.
        </p>

        <div className="flex flex-col items-center space-y-4">
          <a
            href="/login"
            className="bg-accent hover:bg-accent2 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Iniciar sesión
          </a>
          <a
            href="/dashboard"
            className="text-muted hover:text-accent underline text-sm"
          >
            Ir al Dashboard
          </a>
        </div>
      </div>

      <footer className="mt-10 text-muted text-sm">
        Desarrollado con ❤️ por AutoSleepFarm
      </footer>
    </main>
  );
}
