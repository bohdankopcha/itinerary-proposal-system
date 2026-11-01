import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const resolveDatabaseUrl = () => {
  if (!process.env["AWS_LAMBDA_FUNCTION_NAME"])
    return process.env["DATABASE_URL"] ?? "file:./dev.db";
  const writablePath = "/tmp/dev.db";
  if (!existsSync(writablePath))
    copyFileSync(path.join(process.cwd(), "dev.db"), writablePath);
  return `file:${writablePath}`;
};

const createClient = () => {
  const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseUrl() });
  return new PrismaClient({ adapter });
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
