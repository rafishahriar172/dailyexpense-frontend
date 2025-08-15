/* eslint-disable @typescript-eslint/no-explicit-any */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req: any) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // Public routes
  if (
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
     const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/expenses/:path*",
  ],
};
