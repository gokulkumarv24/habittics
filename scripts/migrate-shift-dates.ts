/**
 * One-time data migration — run with: npx tsx scripts/migrate-shift-dates.ts
 *
 * Before the July 2026 date-layer fix, habit_logs.date and day_plans.date were
 * written through a local-timezone startOfDay and truncated by Postgres DATE,
 * landing one calendar day EARLIER than the day the user actually acted on
 * (for any UTC+ timezone such as IST). The fix stores true calendar dates, so
 * existing rows must be shifted forward one day — once.
 *
 * Safe to run only ONCE, and only on data created before the fix.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const logs = await db.$executeRawUnsafe(
    `UPDATE habit_logs SET date = date + interval '1 day'`
  );
  const plans = await db.$executeRawUnsafe(
    `UPDATE day_plans SET date = date + interval '1 day'`
  );
  console.log(`Shifted ${logs} habit_logs rows and ${plans} day_plans rows forward by one day.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
