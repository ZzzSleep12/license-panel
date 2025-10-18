import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin");

  const isAuthRoute =
    pathname.startsWith("/api/auth/") ||
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/validate") || // público para el cliente desktop
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/static") ||
    pathname === "/";

  if (!isProtectedPage) {
    return NextResponse.next();
  }

  // Rutas protegidas
  const token = req.cookies.get("session")?.value;
  if (!token) {
    // si es API admin -> 401; si es página -> redirect a /login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    } else {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  const session = verifySession(token);
  if (!session || session.role !== "admin") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    } else {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"]
};
