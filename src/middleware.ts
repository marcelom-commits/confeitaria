import { decode } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get("__Secure-authjs.session-token");

  if (!tokenCookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const token = await decode({
      token: tokenCookie.value,
      secret: process.env.AUTH_SECRET!,
      salt: "__Secure-authjs.session-token",
    });

    if (!token?.role || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
