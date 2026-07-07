import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/chat", "/collection", "/settings"];

export function middleware(req: NextRequest) {
  const isProtected = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("kreasi_ai_session")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/collection/:path*", "/settings/:path*"]
};
