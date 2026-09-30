import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  acceptDateInviteController,
  cancelDateInviteController,
  createDateInviteController,
  declineDateInviteController,
  getDateInviteByIdController,
  getMyDateInvitesController,
} from "../controllers/date-invite.controller";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  createDateInviteController
);

router.get(
  "/",
  getMyDateInvitesController
);

router.get(
  "/:inviteId",
  getDateInviteByIdController
);

router.patch(
  "/:inviteId/accept",
  acceptDateInviteController
);

router.patch(
  "/:inviteId/decline",
  declineDateInviteController
);

router.patch(
  "/:inviteId/cancel",
  cancelDateInviteController
);

export default router;