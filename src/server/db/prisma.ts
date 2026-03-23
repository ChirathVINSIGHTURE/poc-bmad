import { PrismaClient } from "@prisma/client";

// PrismaClient is intended to be a singleton in dev to avoid connection churn.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

