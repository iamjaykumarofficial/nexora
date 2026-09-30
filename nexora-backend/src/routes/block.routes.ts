import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  blockUserController,
  getMyBlockedUsersController,
  unblockUserController,
} from "../controllers/block.controller";

const router = Router();

router.use(authMiddleware);

router.post(
  "/:userId",
  blockUserController
);

router.get(
  "/",
  getMyBlockedUsersController
);

router.delete(
  "/:userId",
  unblockUserController
);

export default router;