import { Router } from "express";

import {
  getMeController,
  logoutController,
  sendOtpController,
  verifyOtpController,
} from "../controllers/auth.controller";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

/*
 * Public authentication routes
 */

router.post("/send-otp", sendOtpController);

router.post("/verify-otp", verifyOtpController);

/*
 * Protected authentication routes
 */

router.get("/me", authMiddleware, getMeController);

router.post("/logout", authMiddleware, logoutController);

export default router;