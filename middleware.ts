import { NextResponse, NextRequest } from "next/server";

// protege todo /admin: exige cookie de sesión (sb-access-token) creada por Supabase Auth
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const hasSession =
      req.cookies.has("sb-access-token") || req.cookies.has("sb-refresh-token");
    if (!hasSession) {
      const login = new URL("/login", req.url);
      return NextResponse.redirect(login);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
