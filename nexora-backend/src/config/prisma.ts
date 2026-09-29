import "dotenv/config";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";

const getEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const prismaAdapter = new PrismaMariaDb({
  host: getEnv("DATABASE_HOST"),
  port: Number(process.env.DATABASE_PORT || 3306),
  user: getEnv("DATABASE_USER"),
  password: getEnv("DATABASE_PASSWORD"),
  database: getEnv("DATABASE_NAME"),

  connectionLimit: 10,

  connectTimeout: 10_000,
  acquireTimeout: 10_000,
  idleTimeout: 30_000,
});

const prisma = new PrismaClient({
  adapter: prismaAdapter,
});

export default prisma;