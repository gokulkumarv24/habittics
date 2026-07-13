import { PrismaClient } from "@prisma/client";

// Neon's free tier suspends the database after idle periods; the first query
// after a suspend fails with a connection error while the endpoint wakes.
// Retry those transparently so users never see a 500 on the first action.
const RETRY_DELAYS_MS = [1500, 3500];

function isConnectionError(error: unknown): boolean {
  const err = error as { name?: string; code?: string; message?: string } | null;
  if (!err) return false;
  return (
    err.name === "PrismaClientInitializationError" ||
    err.code === "P1001" ||
    err.code === "P1002" ||
    /Can't reach database server|Connection terminated|ECONNRESET|ETIMEDOUT/i.test(
      err.message ?? ""
    )
  );
}

function createClient() {
  return new PrismaClient().$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastError: unknown;
        for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
          try {
            return await query(args);
          } catch (error) {
            lastError = error;
            if (attempt === RETRY_DELAYS_MS.length || !isConnectionError(error)) {
              throw error;
            }
            console.warn(
              `[db] Connection error (attempt ${attempt + 1}), retrying in ${RETRY_DELAYS_MS[attempt]}ms — likely a Neon cold start`
            );
            await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
          }
        }
        throw lastError;
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
