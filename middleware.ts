import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/config";
import { readSessionToken } from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await readSessionToken(token) : null;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/subscribe")) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/subscribe"],
};
