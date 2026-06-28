import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", req.url));
  
  // Clear all auth-related cookies
  response.cookies.set("authjs.session-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("__Secure-authjs.session-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("authjs.csrf-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("__Host-authjs.csrf-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("authjs.callback-url", "", { maxAge: 0, path: "/" });
  response.cookies.set("__Secure-authjs.callback-url", "", { maxAge: 0, path: "/" });
  // Legacy next-auth cookie names
  response.cookies.set("next-auth.session-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("next-auth.csrf-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("next-auth.callback-url", "", { maxAge: 0, path: "/" });
  
  return response;
}
