import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  createReportController,
  getMyReportsController,
} from "../controllers/report.controller";

const router = Router();

router.use(authMiddleware);

router.post(
  "/:userId",
  createReportController
);

router.get(
  "/",
  getMyReportsController
);

export default router;