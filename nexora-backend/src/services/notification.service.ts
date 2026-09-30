import prisma from "../config/prisma";

export type NotificationType =
  | "new_match"
  | "new_message"
  | "new_like"
  | "system";

export interface CreateNotificationInput {
  userId: number | string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: number | string | null;
}

export interface NotificationRecord {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceId: number | null;
  isRead: boolean;
  createdAt: Date;
}

type NotificationEmitter = (
  userId: string,
  notification: NotificationRecord
) => void;

let notificationEmitter: NotificationEmitter | null = null;

/**
 * Socket.IO registers this callback during server startup.
 *
 * Keeping the emitter here avoids importing Socket.IO directly
 * into business services such as swipe.service.ts.
 */
export const setNotificationEmitter = (
  emitter: NotificationEmitter
): void => {
  notificationEmitter = emitter;
};

const normalizeUserId = (
  userId: number | string
): number => {
  const numericUserId = Number(userId);

  if (
    !Number.isInteger(numericUserId) ||
    numericUserId <= 0
  ) {
    throw new Error("Invalid user ID");
  }

  return numericUserId;
};

const normalizeReferenceId = (
  referenceId: number | string | null | undefined
): number | null => {
  if (
    referenceId === undefined ||
    referenceId === null ||
    referenceId === ""
  ) {
    return null;
  }

  const numericReferenceId = Number(referenceId);

  if (
    !Number.isInteger(numericReferenceId) ||
    numericReferenceId <= 0
  ) {
    throw new Error("Invalid notification reference ID");
  }

  return numericReferenceId;
};

const formatNotification = (
  row: {
    id: number | bigint;
    user_id: number | bigint;
    type: NotificationType;
    title: string;
    message: string;
    reference_id: number | bigint | null;
    is_read: number | boolean;
    created_at: Date;
  }
): NotificationRecord => ({
  id: Number(row.id),
  userId: Number(row.user_id),
  type: row.type,
  title: row.title,
  message: row.message,
  referenceId:
    row.reference_id === null
      ? null
      : Number(row.reference_id),
  isRead: Boolean(row.is_read),
  createdAt: row.created_at,
});

const emitRealtimeNotification = (
  notification: NotificationRecord
): void => {
  if (!notificationEmitter) {
    return;
  }

  try {
    notificationEmitter(
      String(notification.userId),
      notification
    );
  } catch (error) {
    /**
     * Realtime delivery must never make a successfully
     * persisted notification fail.
     */
    console.error(
      "❌ Realtime notification emit error:",
      error
    );
  }
};

/**
 * Create and persist a notification.
 *
 * After the database row is confirmed, the exact saved
 * notification is emitted through Socket.IO when available.
 */
export const createNotification = async (
  input: CreateNotificationInput
): Promise<NotificationRecord> => {
  const userId = normalizeUserId(input.userId);

  const type = input.type;

  if (
    type !== "new_match" &&
    type !== "new_message" &&
    type !== "new_like" &&
    type !== "system"
  ) {
    throw new Error("Invalid notification type");
  }

  const title = input.title.trim();
  const message = input.message.trim();

  if (!title) {
    throw new Error("Notification title is required");
  }

  if (!message) {
    throw new Error("Notification message is required");
  }

  if (title.length > 255) {
    throw new Error(
      "Notification title cannot exceed 255 characters"
    );
  }

  if (message.length > 500) {
    throw new Error(
      "Notification message cannot exceed 500 characters"
    );
  }

  const referenceId = normalizeReferenceId(
    input.referenceId
  );

  await prisma.$executeRaw`
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      reference_id,
      is_read
    )
    VALUES (
      ${userId},
      ${type},
      ${title},
      ${message},
      ${referenceId},
      FALSE
    )
  `;

  const rows = await prisma.$queryRaw<
    Array<{
      id: bigint;
      user_id: bigint;
      type: NotificationType;
      title: string;
      message: string;
      reference_id: bigint | null;
      is_read: number | boolean;
      created_at: Date;
    }>
  >`
    SELECT
      id,
      user_id,
      type,
      title,
      message,
      reference_id,
      is_read,
      created_at
    FROM notifications
    WHERE
      user_id = ${userId}
      AND type = ${type}
      AND title = ${title}
      AND message = ${message}
      AND (
        (${referenceId} IS NULL AND reference_id IS NULL)
        OR
        reference_id = ${referenceId}
      )
    ORDER BY id DESC
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new Error(
      "Unable to create notification"
    );
  }

  const notification = formatNotification(rows[0]);

  emitRealtimeNotification(notification);

  return notification;
};

/**
 * Get current user's notifications.
 */
export const getUserNotifications = async (
  userId: string,
  page = 1,
  limit = 20
) => {
  const numericUserId = normalizeUserId(userId);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    page > 10000
  ) {
    throw new Error(
      "page must be an integer between 1 and 10000"
    );
  }

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new Error(
      "limit must be an integer between 1 and 100"
    );
  }

  const offset = (page - 1) * limit;

  const rows = await prisma.$queryRawUnsafe<
    Array<{
      id: bigint;
      user_id: bigint;
      type: NotificationType;
      title: string;
      message: string;
      reference_id: bigint | null;
      is_read: number | boolean;
      created_at: Date;
    }>
  >(
    `
      SELECT
        id,
        user_id,
        type,
        title,
        message,
        reference_id,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `,
    numericUserId,
    limit,
    offset
  );

  return rows.map(formatNotification);
};

/**
 * Get unread notification count.
 */
export const getUnreadNotificationCount = async (
  userId: string
): Promise<number> => {
  const numericUserId = normalizeUserId(userId);

  const rows = await prisma.$queryRaw<
    Array<{ unread_count: bigint | number }>
  >`
    SELECT COUNT(*) AS unread_count
    FROM notifications
    WHERE
      user_id = ${numericUserId}
      AND is_read = FALSE
  `;

  return Number(rows[0]?.unread_count ?? 0);
};

/**
 * Mark one notification as read.
 */
export const markNotificationAsRead = async (
  userId: string,
  notificationId: string
): Promise<NotificationRecord> => {
  const numericUserId = normalizeUserId(userId);
  const numericNotificationId = Number(notificationId);

  if (
    !Number.isInteger(numericNotificationId) ||
    numericNotificationId <= 0
  ) {
    throw new Error("Invalid notification ID");
  }

  const existingRows = await prisma.$queryRaw<
    Array<{
      id: bigint;
      user_id: bigint;
      type: NotificationType;
      title: string;
      message: string;
      reference_id: bigint | null;
      is_read: number | boolean;
      created_at: Date;
    }>
  >`
    SELECT
      id,
      user_id,
      type,
      title,
      message,
      reference_id,
      is_read,
      created_at
    FROM notifications
    WHERE
      id = ${numericNotificationId}
      AND user_id = ${numericUserId}
    LIMIT 1
  `;

  if (existingRows.length === 0) {
    throw new Error("Notification not found");
  }

  await prisma.$executeRaw`
    UPDATE notifications
    SET is_read = TRUE
    WHERE
      id = ${numericNotificationId}
      AND user_id = ${numericUserId}
  `;

  const updatedRows = await prisma.$queryRaw<
    Array<{
      id: bigint;
      user_id: bigint;
      type: NotificationType;
      title: string;
      message: string;
      reference_id: bigint | null;
      is_read: number | boolean;
      created_at: Date;
    }>
  >`
    SELECT
      id,
      user_id,
      type,
      title,
      message,
      reference_id,
      is_read,
      created_at
    FROM notifications
    WHERE
      id = ${numericNotificationId}
      AND user_id = ${numericUserId}
    LIMIT 1
  `;

  return formatNotification(updatedRows[0]);
};

/**
 * Mark all current user's notifications as read.
 */
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<number> => {
  const numericUserId = normalizeUserId(userId);

  const result = await prisma.$executeRaw`
    UPDATE notifications
    SET is_read = TRUE
    WHERE
      user_id = ${numericUserId}
      AND is_read = FALSE
  `;

  return Number(result);
};
