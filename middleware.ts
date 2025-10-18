// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir login y el endpoint público /api/validate
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/validate") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Proteger /admin/* y /api/admin/*
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token =
      req.cookies.get("sb-access-token")?.value ||
      req.cookies.get("sb:token")?.value ||
      req.cookies.get("access-token")?.value ||
      null;

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
