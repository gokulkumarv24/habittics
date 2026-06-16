import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";

export async function GET(req: NextRequest) {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      hasAuthSecret: !!process.env.AUTH_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasAuthUrl: !!process.env.AUTH_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + "...",
      databaseUrlHasChannelBinding: process.env.DATABASE_URL?.includes("channel_binding") ?? false,
    },
    cookies: Object.fromEntries(
      [...req.cookies.getAll()].map(c => [c.name, c.value.substring(0, 20) + "..."])
    ),
  };

  try {
    const userCount = await db.user.count();
    diagnostics.db = { connected: true, userCount };

    const user = await db.user.findUnique({
      where: { email: "gokulkumarv2024@gmail.com" },
      select: { id: true, email: true, passwordHash: true },
    });
    diagnostics.user = {
      found: !!user,
      hasPasswordHash: !!user?.passwordHash,
      hashPrefix: user?.passwordHash?.substring(0, 7),
    };
  } catch (error) {
    diagnostics.db = {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return NextResponse.json(diagnostics);
}
