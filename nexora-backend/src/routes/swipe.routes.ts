import { Router } from "express";

import {
  getMySelectLimitController,
  swipeOnUserController,
} from "../controllers/swipe.controller";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get(
  "/limit",
  getMySelectLimitController
);

router.post(
  "/:targetUserId",
  swipeOnUserController
);

export default router;