import { Router } from "express";

import {
  getMyMatchesController,
} from "../controllers/match.controller";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  getMyMatchesController
);

export default router;