import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  createConversationController,
  getMyConversationsController,
  getConversationController,
  sendMessageController,
  getMessagesController,
  markConversationAsReadController,
} from "../controllers/chat.controller";

const router = Router();

router.use(authMiddleware);

/**
 * Conversations
 */
router.post(
  "/",
  createConversationController
);

router.get(
  "/",
  getMyConversationsController
);

router.get(
  "/:conversationId",
  getConversationController
);

/**
 * Messages
 */
router.post(
  "/:conversationId/messages",
  sendMessageController
);

router.get(
  "/:conversationId/messages",
  getMessagesController
);

router.patch(
  "/:conversationId/read",
  markConversationAsReadController
);

export default router;