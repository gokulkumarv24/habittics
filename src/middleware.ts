import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth/config";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Protected routes
  const protectedRoutes = ["/dashboard", "/habits", "/goals", "/analytics", "/settings", "/planner"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect logged-in users away from auth pages
  const authRoutes = ["/login", "/register"];
  if (authRoutes.includes(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
