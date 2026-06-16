import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected routes
  const protectedRoutes = ["/dashboard", "/habits", "/goals", "/analytics", "/settings", "/planner"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.includes(pathname);

  // Only check token for routes that need auth logic
  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  let isLoggedIn = false;
  try {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (secret) {
      // NextAuth v5 uses "authjs.session-token" cookie name
      // Try with default first, then with explicit cookie name
      const token = await getToken({ req, secret, cookieName: "__Secure-authjs.session-token" })
        || await getToken({ req, secret, cookieName: "authjs.session-token" })
        || await getToken({ req, secret });
      isLoggedIn = !!token;
    }
  } catch {
    // If token check fails, treat as not logged in
    isLoggedIn = false;
  }

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
