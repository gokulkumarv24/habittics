import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create default categories
  const categories = [
    { name: "Health", color: "#10b981", icon: "heart" },
    { name: "Fitness", color: "#f59e0b", icon: "dumbbell" },
    { name: "Learning", color: "#6366f1", icon: "book-open" },
    { name: "Work", color: "#3b82f6", icon: "briefcase" },
    { name: "Mindfulness", color: "#8b5cf6", icon: "brain" },
    { name: "Social", color: "#ec4899", icon: "users" },
  ];

  console.log("Seeding database...");
  console.log("Default categories available:", categories.map((c) => c.name).join(", "));
  console.log("Seed complete! Categories will be created per-user on signup.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
