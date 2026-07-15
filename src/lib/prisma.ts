import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Keep connection warm on Vercel serverless
if (process.env.VERCEL) {
  const warmUp = async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      // ignore
    }
  };
  warmUp();
}
