import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/server/db/client";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: { name, email, passwordHash },
    });

    // Create default categories for new user
    await db.category.createMany({
      data: [
        { userId: user.id, name: "Health", color: "#10b981", icon: "heart", order: 0 },
        { userId: user.id, name: "Fitness", color: "#f59e0b", icon: "dumbbell", order: 1 },
        { userId: user.id, name: "Learning", color: "#6366f1", icon: "book-open", order: 2 },
        { userId: user.id, name: "Work", color: "#3b82f6", icon: "briefcase", order: 3 },
        { userId: user.id, name: "Mindfulness", color: "#8b5cf6", icon: "brain", order: 4 },
      ],
    });

    // Create default settings
    await db.userSettings.create({ data: { userId: user.id } });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("[register] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
