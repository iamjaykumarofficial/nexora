import { Request, Response } from "express";

import {
  createConversation,
  getMyConversations,
  getConversation,
  sendMessage,
  getMessages,
  markConversationAsRead,
} from "../services/chat.service";

const requireUserId = (
  req: Request
): string => {
  if (!req.userId) {
    throw new Error(
      "Authenticated user ID is missing"
    );
  }

  return req.userId;
};

export const createConversationController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = requireUserId(req);

      const { matchId } = req.body;

      if (
        matchId === undefined ||
        matchId === null ||
        String(matchId).trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "matchId is required",
        });
      }

      const result =
        await createConversation(
          userId,
          String(matchId)
        );

      return res.status(
        result.created ? 201 : 200
      ).json({
        success: true,
        message: result.created
          ? "Conversation created successfully"
          : "Conversation already exists",
        data: result.conversation,
      });
    } catch (error) {
      console.error(
        "Create conversation error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create conversation",
      });
    }
  };

export const getMyConversationsController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = requireUserId(req);

      const conversations =
        await getMyConversations(userId);

      return res.status(200).json({
        success: true,
        message:
          "Conversations fetched successfully",
        data: {
          conversations,
          count: conversations.length,
        },
      });
    } catch (error) {
      console.error(
        "Get conversations error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch conversations",
      });
    }
  };

export const getConversationController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = requireUserId(req);

      const conversationId =
        req.params.conversationId;

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          message:
            "conversationId is required",
        });
      }

      const conversation =
        await getConversation(
          userId,
          String(conversationId)
        );

      return res.status(200).json({
        success: true,
        message:
          "Conversation fetched successfully",
        data: conversation,
      });
    } catch (error) {
      console.error(
        "Get conversation error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch conversation",
      });
    }
  };

export const sendMessageController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = requireUserId(req);

      const conversationId =
        req.params.conversationId;

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          message:
            "conversationId is required",
        });
      }

      const {
        type,
        content,
        mediaUrl,
      } = req.body;

      const message =
        await sendMessage(
          userId,
          String(conversationId),
          {
            type,
            content,
            mediaUrl,
          }
        );

      return res.status(201).json({
        success: true,
        message:
          "Message sent successfully",
        data: message,
      });
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to send message",
      });
    }
  };

export const getMessagesController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = requireUserId(req);

      const conversationId =
        req.params.conversationId;

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          message:
            "conversationId is required",
        });
      }

      const page = req.query.page
        ? Number(req.query.page)
        : 1;

      const limit = req.query.limit
        ? Number(req.query.limit)
        : 30;

      const result =
        await getMessages(
          userId,
          String(conversationId),
          page,
          limit
        );

      return res.status(200).json({
        success: true,
        message:
          "Messages fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error(
        "Get messages error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch messages",
      });
    }
  };

export const markConversationAsReadController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = requireUserId(req);

      const conversationId =
        req.params.conversationId;

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          message:
            "conversationId is required",
        });
      }

      const result =
        await markConversationAsRead(
          userId,
          String(conversationId)
        );

      return res.status(200).json({
        success: true,
        message:
          "Messages marked as read",
        data: result,
      });
    } catch (error) {
      console.error(
        "Mark messages read error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to mark messages as read",
      });
    }
  };