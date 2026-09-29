import { Request, Response, Router } from "express";

import prisma from "../config/prisma";

const router = Router();

/**
 * GET /api/health
 *
 * Checks whether the Nexora API is running.
 */
router.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Nexora API is running",
    service: "Nexora Backend",
    version: "1.0.0",
  });
});

/**
 * GET /api/health/db
 *
 * Checks whether the API can communicate with MySQL.
 */
router.get("/db", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      message: "Nexora API and database are connected",
      database: "MySQL",
      status: "connected",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      database: "MySQL",
      status: "disconnected",
    });
  }
});

export default router;