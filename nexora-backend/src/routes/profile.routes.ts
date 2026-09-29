import { Router } from "express";

import {
  createProfileController,
  getMyProfileController,
  updateMyProfileController,
} from "../controllers/profile.controller";

import {
  addMyInterestsController,
  getMyInterestsController,
  removeMyInterestController,
} from "../controllers/interest.controller";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

// Profile
router.post("/", createProfileController);
router.get("/me", getMyProfileController);
router.put("/me", updateMyProfileController);

// Interests
router.get("/interests", getMyInterestsController);
router.post("/interests", addMyInterestsController);
router.delete(
  "/interests/:interestId",
  removeMyInterestController
);

export default router;