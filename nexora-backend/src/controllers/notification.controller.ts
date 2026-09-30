import { Request, Response } from "express";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.service";

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.userId) {
    throw new Error("Authentication required");
  }

  return req.userId;
};

/**
 * GET /api/notifications
 */
export const getNotificationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const limit = Number(req.query.limit ?? 20);
    const offset = Number(req.query.offset ?? 0);

    const notifications = await getUserNotifications(
      userId,
      limit,
      offset
    );

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    if (
      error instanceof Error &&
      error.message === "Authentication required"
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

/**
 * GET /api/notifications/unread-count
 */
export const getUnreadNotificationCountController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const count = await getUnreadNotificationCount(userId);

    return res.status(200).json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    console.error(
      "Get unread notification count error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "Authentication required"
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notification count",
    });
  }
};

/**
 * PATCH /api/notifications/:notificationId/read
 */
export const markNotificationAsReadController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const notificationId = String(req.params.notificationId);

    const notification = await markNotificationAsRead(
      userId,
      notificationId
    );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "Authentication required"
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to mark notification as read";

    if (message === "Notification not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 */
export const markAllNotificationsAsReadController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const updatedCount =
      await markAllNotificationsAsRead(userId);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: {
        updatedCount,
      },
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "Authentication required"
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};