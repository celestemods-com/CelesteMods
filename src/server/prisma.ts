/**
 * Instantiates a single instance PrismaClient and save it on the global object.
 * @link https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */

import { Prisma as P, PrismaClient } from "@prisma/client";

import { env } from "~/env.mjs";
import { getNonEmptyArray } from "~/utils/typeHelpers";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type MyPrismaClient = typeof prisma;


export const sortOrders = getNonEmptyArray(P.SortOrder);