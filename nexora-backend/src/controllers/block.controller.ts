import { Request, Response } from "express";

import {
  blockUser,
  getMyBlockedUsers,
  unblockUser,
} from "../services/block.service";

const getAuthenticatedUserId = (
  req: Request,
  res: Response
): string | null => {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return null;
  }

  return req.userId;
};

const getUserIdParam = (
  req: Request,
  res: Response
): string | null => {
  const { userId } = req.params;

  if (typeof userId !== "string" || !userId.trim()) {
    res.status(400).json({
      success: false,
      message: "Valid user ID is required",
    });

    return null;
  }

  return userId;
};

export const blockUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return;
    }

    const targetUserId = getUserIdParam(req, res);

    if (!targetUserId) {
      return;
    }

    const block = await blockUser(
      userId,
      targetUserId
    );

    return res.status(201).json({
      success: true,
      message: "User blocked successfully",
      data: block,
    });
  } catch (error) {
    console.error("Block user error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to block user";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const unblockUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return;
    }

    const targetUserId = getUserIdParam(req, res);

    if (!targetUserId) {
      return;
    }

    const result = await unblockUser(
      userId,
      targetUserId
    );

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      data: result,
    });
  } catch (error) {
    console.error("Unblock user error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to unblock user";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const getMyBlockedUsersController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return;
    }

    const blocks = await getMyBlockedUsers(userId);

    return res.status(200).json({
      success: true,
      message: "Blocked users fetched successfully",
      data: blocks,
    });
  } catch (error) {
    console.error(
      "Get blocked users error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch blocked users";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};