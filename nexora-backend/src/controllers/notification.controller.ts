import { Request, Response } from "express";

import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.service";

// =========================
// Helpers
// =========================

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

const parseQueryInteger = (
  value: unknown,
  defaultValue: number,
  min: number,
  max: number,
  fieldName: string
): number => {
  if (value === undefined) {
    return defaultValue;
  }

  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new Error(
      `${fieldName} must be an integer between ${min} and ${max}`
    );
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < min ||
    parsed > max
  ) {
    throw new Error(
      `${fieldName} must be an integer between ${min} and ${max}`
    );
  }

  return parsed;
};

const getNotificationId = (
  req: Request,
  res: Response
): string | null => {
  const { notificationId } = req.params;

  if (
    typeof notificationId !== "string" ||
    !notificationId.trim()
  ) {
    res.status(400).json({
      success: false,
      message: "Valid notification ID is required",
    });

    return null;
  }

  return notificationId;
};

// =========================
// Get Notifications
// =========================

export const getNotificationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(
      req,
      res
    );

    if (!userId) {
      return;
    }

    const page = parseQueryInteger(
      req.query.page,
      1,
      1,
      10000,
      "page"
    );

    const limit = parseQueryInteger(
      req.query.limit,
      20,
      1,
      100,
      "limit"
    );

    const notifications =
      await getUserNotifications(
        userId,
        page,
        limit
      );

    return res.status(200).json({
      success: true,
      message:
        "Notifications fetched successfully",
      data: notifications,
      pagination: {
        page,
        limit,
        count: notifications.length,
        hasMore: notifications.length === limit,
      },
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch notifications";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

// =========================
// Get Unread Notification Count
// =========================

export const getUnreadNotificationCountController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(
          req,
          res
        );

      if (!userId) {
        return;
      }

      const unreadCount =
        await getUnreadNotificationCount(
          userId
        );

      return res.status(200).json({
        success: true,
        message:
          "Unread notification count fetched successfully",
        data: {
          unreadCount,
        },
      });
    } catch (error) {
      console.error(
        "Get unread notification count error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch unread notification count";

      return res.status(400).json({
        success: false,
        message,
      });
    }
  };

// =========================
// Mark Notification As Read
// =========================

export const markNotificationAsReadController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(
          req,
          res
        );

      if (!userId) {
        return;
      }

      const notificationId =
        getNotificationId(
          req,
          res
        );

      if (!notificationId) {
        return;
      }

      const notification =
        await markNotificationAsRead(
          userId,
          notificationId
        );

      return res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read";

      return res.status(400).json({
        success: false,
        message,
      });
    }
  };

// =========================
// Mark All Notifications As Read
// =========================

export const markAllNotificationsAsReadController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(
          req,
          res
        );

      if (!userId) {
        return;
      }

      const result =
        await markAllNotificationsAsRead(
          userId
        );

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read",
        data: result,
      });
    } catch (error) {
      console.error(
        "Mark all notifications as read error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as read";

      return res.status(400).json({
        success: false,
        message,
      });
    }
  };
