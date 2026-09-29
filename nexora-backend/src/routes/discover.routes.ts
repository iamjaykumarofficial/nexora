import { Router } from "express";

import {
  getDiscoverProfilesController,
} from "../controllers/discover.controller";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  getDiscoverProfilesController
);

export default router;