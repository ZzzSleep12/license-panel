// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { adminCookie } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Proteger todo /admin (y APIs bajo /api/admin)
  const isAdminArea =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (isAdminArea) {
    const token = req.cookies.get(adminCookie)?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Si estás en /login y ya tienes cookie, redirige al dashboard
  if (pathname === "/login") {
    const token = req.cookies.get(adminCookie)?.value;
    if (token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login"],
};
