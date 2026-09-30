import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";

import {
  getNotificationsController,
  getUnreadNotificationCountController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from "../controllers/notification.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getNotificationsController);

router.get(
  "/unread-count",
  getUnreadNotificationCountController
);

router.patch(
  "/:notificationId/read",
  markNotificationAsReadController
);

router.patch(
  "/read-all",
  markAllNotificationsAsReadController
);

export default router;