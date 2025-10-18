import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Licencias",
  description: "Administra y genera licencias para tu aplicación"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-neutral-800 sticky top-0 z-10 bg-neutral-900/80 backdrop-blur">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-pink-400">🎟️</span>
                <span className="font-semibold">Panel de Licencias</span>
              </div>
              <nav className="flex items-center gap-3 text-sm">
                <a className="hover:underline" href="/">Inicio</a>
                <a className="hover:underline" href="/admin">Dashboard</a>
                <a className="hover:underline" href="/admin/generate">Generar</a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-neutral-800 py-6 text-center text-sm text-neutral-400">
            Desarrollado por AutoSleepFarm
          </footer>
        </div>
      </body>
    </html>
  );
}
