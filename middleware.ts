import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get("auth")?.value || null;
  const session = token ? await verifyJwt<{ role?: string }>(token) : null;
  const isAdmin = !!session && session.role === "admin";

  // Rutas protegidas
  const needsAuth =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // Si ya logueado e intenta ir a /login, lo mandamos al dashboard
  if (pathname === "/login" && isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Si necesita auth y no es admin -> redirigir a login
  if (needsAuth && !isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + (search || ""))}`;
    return NextResponse.redirect(url);
  }

  // Para todo lo demás, continuar
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/api/admin/:path*"],
};
