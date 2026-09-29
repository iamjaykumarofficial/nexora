import "dotenv/config";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client";

const getEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const adapter = new PrismaMariaDb({
  host: getEnv("DATABASE_HOST"),
  port: Number(process.env.DATABASE_PORT || 3306),
  user: getEnv("DATABASE_USER"),
  password: getEnv("DATABASE_PASSWORD"),
  database: getEnv("DATABASE_NAME"),

  connectionLimit: 2,
  connectTimeout: 5000,
  acquireTimeout: 5000,
  idleTimeout: 30000,
});

const prisma = new PrismaClient({
  adapter,
});

const testPrisma = async (): Promise<void> => {
  try {
    console.log("Testing Prisma MariaDB adapter...");

    await prisma.$connect();

    console.log("✅ Prisma $connect() successful");

    const result = await prisma.$queryRaw<
      Array<{ test: bigint | number }>
    >`SELECT 1 AS test`;

    console.log("✅ Prisma SELECT 1 successful:", result);
  } catch (error) {
    console.error("❌ Prisma adapter test failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

testPrisma();