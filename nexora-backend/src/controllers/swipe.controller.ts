import { Request, Response } from "express";

import {
  getMySelectLimit,
  swipeOnUser,
} from "../services/swipe.service";

export const swipeOnUserController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { targetUserId } = req.params;

    if (typeof targetUserId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Target user ID is required",
      });
    }

    const body = req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({
        success: false,
        message:
          "Request body is required. Send JSON body.",
      });
    }

    const { action } = body as {
      action?: unknown;
    };

    const result = await swipeOnUser(
      req.userId,
      targetUserId,
      action
    );

    return res.status(200).json({
      success: true,
      message:
        result.match !== null
          ? "It's a match! 🎉"
          : "Swipe recorded successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Swipe user error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to record swipe",
    });
  }
};

export const getMySelectLimitController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const limit = await getMySelectLimit(
        req.userId
      );

      return res.status(200).json({
        success: true,
        message:
          "Select limit fetched successfully",
        data: {
          selectLimit: limit,
        },
      });
    } catch (error) {
      console.error(
        "Get select limit error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch select limit",
      });
    }
  };