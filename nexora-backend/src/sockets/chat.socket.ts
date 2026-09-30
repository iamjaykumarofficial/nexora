import { Server, Socket } from "socket.io";

import prisma from "../config/prisma";
import { verifyToken } from "../utils/jwt";
import {
  markConversationAsRead,
  sendMessage,
} from "../services/chat.service";
import { setNotificationEmitter } from "../services/notification.service";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

interface MessageSendPayload {
  conversationId: number | string;
  type?: "text" | "image" | "voice";
  content?: string | null;
  mediaUrl?: string | null;
}

interface MessageReadPayload {
  conversationId: number | string;
}

interface ConversationPayload {
  conversationId: number | string;
}

interface TypingPayload {
  conversationId: number | string;
}

interface PresencePayload {
  userId: number | string;
}

interface PresenceRecord {
  user_id: bigint;
  is_online: number | boolean;
  last_seen_at: Date | null;
}

const normalizeId = (value: number | string): number => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Invalid conversation ID");
  }

  return parsed;
};

const getConversationRoom = (
  conversationId: number
): string => {
  return `conversation:${conversationId}`;
};

const getUserRoom = (userId: string): string => {
  return `user:${userId}`;
};

const normalizeUserId = (value: number | string): string => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Invalid user ID");
  }

  return String(parsed);
};

const formatPresence = (record: PresenceRecord) => ({
  userId: Number(record.user_id),
  isOnline: Boolean(record.is_online),
  lastSeenAt: record.last_seen_at,
});

const ensurePresenceRow = async (userId: string): Promise<void> => {
  const numericUserId = Number(userId);

  await prisma.$executeRaw`
    INSERT INTO user_presence (
      user_id,
      is_online,
      last_seen_at
    )
    VALUES (
      ${numericUserId},
      FALSE,
      NULL
    )
    ON DUPLICATE KEY UPDATE
      user_id = user_presence.user_id
  `;
};

const setUserOnline = async (userId: string): Promise<void> => {
  const numericUserId = Number(userId);

  await prisma.$executeRaw`
    INSERT INTO user_presence (
      user_id,
      is_online,
      last_seen_at
    )
    VALUES (
      ${numericUserId},
      TRUE,
      NULL
    )
    ON DUPLICATE KEY UPDATE
      is_online = TRUE,
      last_seen_at = NULL
  `;
};

const setUserOffline = async (userId: string): Promise<PresenceRecord> => {
  const numericUserId = Number(userId);

  await prisma.$executeRaw`
    INSERT INTO user_presence (
      user_id,
      is_online,
      last_seen_at
    )
    VALUES (
      ${numericUserId},
      FALSE,
      NOW()
    )
    ON DUPLICATE KEY UPDATE
      is_online = FALSE,
      last_seen_at = NOW()
  `;

  const rows = await prisma.$queryRaw<PresenceRecord[]>`
    SELECT
      user_id,
      is_online,
      last_seen_at
    FROM user_presence
    WHERE user_id = ${numericUserId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new Error("Unable to read user presence");
  }

  return rows[0];
};

const getUserPresence = async (userId: string): Promise<PresenceRecord> => {
  const numericUserId = Number(userId);

  await ensurePresenceRow(userId);

  const rows = await prisma.$queryRaw<PresenceRecord[]>`
    SELECT
      user_id,
      is_online,
      last_seen_at
    FROM user_presence
    WHERE user_id = ${numericUserId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new Error("User presence not found");
  }

  return rows[0];
};

const getMatchedUserIds = async (userId: string): Promise<string[]> => {
  const numericUserId = Number(userId);

  const rows = await prisma.$queryRaw<Array<{ other_user_id: bigint }>>`
    SELECT
      CASE
        WHEN user1_id = ${numericUserId} THEN user2_id
        ELSE user1_id
      END AS other_user_id
    FROM matches
    WHERE
      is_active = 1
      AND (
        user1_id = ${numericUserId}
        OR user2_id = ${numericUserId}
      )
  `;

  return rows.map((row) => String(row.other_user_id));
};

const areActiveMatches = async (
  userId: string,
  otherUserId: string
): Promise<boolean> => {
  const currentId = Number(userId);
  const otherId = Number(otherUserId);

  const rows = await prisma.$queryRaw<Array<{ matched: number }>>`
    SELECT 1 AS matched
    FROM matches
    WHERE
      is_active = 1
      AND (
        (user1_id = ${currentId} AND user2_id = ${otherId})
        OR
        (user1_id = ${otherId} AND user2_id = ${currentId})
      )
    LIMIT 1
  `;

  return rows.length > 0;
};

const broadcastPresence = async (
  io: Server,
  userId: string,
  presence: PresenceRecord
): Promise<void> => {
  const matchedUserIds = await getMatchedUserIds(userId);
  const payload = formatPresence(presence);

  for (const matchedUserId of matchedUserIds) {
    io.to(getUserRoom(matchedUserId)).emit(
      "presence:update",
      payload
    );
  }
};

const getOtherUserId = async (
  conversationId: number,
  currentUserId: string
): Promise<string> => {
  const currentUserIdNumber = Number(currentUserId);

  if (
    !Number.isInteger(currentUserIdNumber) ||
    currentUserIdNumber <= 0
  ) {
    throw new Error("Invalid authenticated user");
  }

  const rows = await prisma.$queryRaw<
    Array<{
      user1_id: bigint;
      user2_id: bigint;
    }>
  >`
    SELECT
      m.user1_id,
      m.user2_id
    FROM conversations c
    INNER JOIN matches m
      ON m.id = c.match_id
    WHERE
      c.id = ${conversationId}
      AND m.is_active = 1
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new Error(
      "Conversation or active match not found"
    );
  }

  const user1Id = Number(rows[0].user1_id);
  const user2Id = Number(rows[0].user2_id);

  if (user1Id === currentUserIdNumber) {
    return String(user2Id);
  }

  if (user2Id === currentUserIdNumber) {
    return String(user1Id);
  }

  throw new Error(
    "You are not a participant of this conversation"
  );
};

const isBlocked = async (
  currentUserId: string,
  otherUserId: string
): Promise<boolean> => {
  const currentId = Number(currentUserId);
  const otherId = Number(otherUserId);

  const rows = await prisma.$queryRaw<
    Array<{ blocked: number }>
  >`
    SELECT 1 AS blocked
    FROM blocks
    WHERE
      (
        blocker_id = ${currentId}
        AND blocked_id = ${otherId}
      )
      OR
      (
        blocker_id = ${otherId}
        AND blocked_id = ${currentId}
      )
    LIMIT 1
  `;

  return rows.length > 0;
};

const authenticateSocket = (
  socket: AuthenticatedSocket
): void => {
  const authToken =
    typeof socket.handshake.auth?.token === "string"
      ? socket.handshake.auth.token
      : "";

  const authorizationHeader =
    typeof socket.handshake.headers?.authorization ===
    "string"
      ? socket.handshake.headers.authorization
      : "";

  let token = authToken;

  if (
    !token &&
    authorizationHeader.startsWith("Bearer ")
  ) {
    token = authorizationHeader
      .substring(7)
      .trim();
  }

  if (!token) {
    throw new Error(
      "Authentication token is required"
    );
  }

  const payload = verifyToken(token);

  socket.userId = payload.userId;
};

const emitTypingToConversation = (
  socket: AuthenticatedSocket,
  conversationId: number,
  eventName: "typing:start" | "typing:stop"
): void => {
  const room =
    getConversationRoom(conversationId);

  socket.to(room).emit(eventName, {
    conversationId,
    userId: socket.userId,
  });
};

/**
 * Register Nexora Chat Socket.IO events.
 */
export const registerChatSocket = (
  io: Server
): void => {
  /**
   * REALTIME NOTIFICATION EMITTER
   *
   * notification.service.ts owns persistence.
   * This emitter only delivers the already-saved
   * notification to the user's personal room.
   */
  setNotificationEmitter((userId, notification) => {
    io.to(getUserRoom(userId)).emit(
      "notification:new",
      notification
    );
  });

  /**
   * SOCKET AUTHENTICATION
   */
  io.use((socket, next) => {
    try {
      const authenticatedSocket =
        socket as AuthenticatedSocket;

      authenticateSocket(authenticatedSocket);

      next();
    } catch (error) {
      console.error(
        "❌ Socket authentication error:",
        error
      );

      next(
        new Error(
          "Invalid or expired authentication token"
        )
      );
    }
  });

  /**
   * SOCKET CONNECTION
   */
  io.on(
    "connection",
    (rawSocket) => {
      const socket =
        rawSocket as AuthenticatedSocket;

      if (!socket.userId) {
        socket.disconnect(true);
        return;
      }

      const userId = socket.userId;

      console.log(
        `🔌 Socket connected | userId=${userId} | socketId=${socket.id}`
      );

      /**
       * Personal room.
       *
       * This room can be used later for:
       * - notifications
       * - new matches
       * - online status
       * - date invites
       *
       * IMPORTANT:
       * We do NOT send message:new here.
       * Otherwise a user inside the conversation
       * room can receive the same message twice.
       */
      socket.join(getUserRoom(userId));

      void (async () => {
        try {
          await setUserOnline(userId);
          const presence = await getUserPresence(userId);

          socket.emit("presence:update", formatPresence(presence));
          await broadcastPresence(io, userId, presence);

          console.log(`🟢 User ${userId} is online`);
        } catch (error) {
          console.error("❌ Presence online error:", error);
        }
      })();

      socket.emit(
        "socket:connected",
        {
          success: true,
          userId,
          socketId: socket.id,
          message:
            "Real-time connection established",
        }
      );

      /**
       * GET USER PRESENCE
       */
      socket.on(
        "presence:get",
        async (
          payload: PresencePayload,
          callback?: (response: unknown) => void
        ) => {
          try {
            const targetUserId = normalizeUserId(payload?.userId);

            if (targetUserId !== userId) {
              const matched = await areActiveMatches(
                userId,
                targetUserId
              );

              if (!matched) {
                throw new Error(
                  "Presence is available only for active matches"
                );
              }
            }

            const presence = await getUserPresence(targetUserId);
            const response = {
              success: true,
              presence: formatPresence(presence),
            };

            socket.emit("presence:status", response.presence);

            if (callback) {
              callback(response);
            }
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to get user presence";

            console.error("❌ presence:get error:", error);

            if (callback) {
              callback({
                success: false,
                message,
              });
            }
          }
        }
      );

      /**
       * JOIN CONVERSATION
       */
      socket.on(
        "conversation:join",
        async (
          payload: ConversationPayload,
          callback?: (
            response: unknown
          ) => void
        ) => {
          try {
            const conversationId =
              normalizeId(
                payload?.conversationId
              );

            const otherUserId =
              await getOtherUserId(
                conversationId,
                userId
              );

            const blocked =
              await isBlocked(
                userId,
                otherUserId
              );

            if (blocked) {
              throw new Error(
                "Messaging is unavailable because one of the users is blocked"
              );
            }

            const room =
              getConversationRoom(
                conversationId
              );

            await socket.join(room);

            const otherPresence = await getUserPresence(otherUserId);

            socket.emit(
              "presence:status",
              formatPresence(otherPresence)
            );

            const response = {
              success: true,
              conversationId,
            };

            socket.emit(
              "conversation:joined",
              response
            );

            if (callback) {
              callback(response);
            }

            console.log(
              `💬 User ${userId} joined conversation ${conversationId}`
            );
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to join conversation";

            console.error(
              "❌ conversation:join error:",
              error
            );

            if (callback) {
              callback({
                success: false,
                message,
              });
            }
          }
        }
      );

      /**
       * LEAVE CONVERSATION
       */
      socket.on(
        "conversation:leave",
        async (
          payload: ConversationPayload,
          callback?: (
            response: unknown
          ) => void
        ) => {
          try {
            const conversationId =
              normalizeId(
                payload?.conversationId
              );

            const room =
              getConversationRoom(
                conversationId
              );

            await socket.leave(room);

            const response = {
              success: true,
              conversationId,
            };

            socket.emit(
              "conversation:left",
              response
            );

            if (callback) {
              callback(response);
            }

            console.log(
              `🚪 User ${userId} left conversation ${conversationId}`
            );
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to leave conversation";

            console.error(
              "❌ conversation:leave error:",
              error
            );

            if (callback) {
              callback({
                success: false,
                message,
              });
            }
          }
        }
      );

      /**
       * SEND MESSAGE
       */
      socket.on(
        "message:send",
        async (
          payload: MessageSendPayload,
          callback?: (
            response: unknown
          ) => void
        ) => {
          try {
            const conversationId =
              normalizeId(
                payload?.conversationId
              );

            const otherUserId =
              await getOtherUserId(
                conversationId,
                userId
              );

            const blocked =
              await isBlocked(
                userId,
                otherUserId
              );

            if (blocked) {
              throw new Error(
                "Messaging is unavailable because one of the users is blocked"
              );
            }

            const messageType =
              payload?.type || "text";

            if (
              ![
                "text",
                "image",
                "voice",
              ].includes(messageType)
            ) {
              throw new Error(
                "Invalid message type"
              );
            }

            if (
              messageType === "text" &&
              !payload?.content?.trim()
            ) {
              throw new Error(
                "Message content is required"
              );
            }

            const result =
              await sendMessage(
                userId,
                String(conversationId),
                {
                  type: messageType,
                  content:
                    payload?.content ??
                    null,
                  mediaUrl:
                    payload?.mediaUrl ??
                    null,
                }
              );

            const eventPayload = {
              success: true,
              message: result,
            };

            const room =
              getConversationRoom(
                conversationId
              );

            /**
             * IMPORTANT:
             *
             * message:new is emitted ONLY
             * to the conversation room.
             *
             * Previously the event was also
             * emitted to user:${otherUserId},
             * which caused duplicate messages.
             */
            io.to(room).emit(
              "message:new",
              eventPayload
            );

            /**
             * Sender acknowledgement.
             *
             * This is separate from message:new.
             */
            if (callback) {
              callback(eventPayload);
            }

            console.log(
              `📨 Message ${result.id} sent by user ${userId} in conversation ${conversationId}`
            );
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to send message";

            console.error(
              "❌ message:send error:",
              error
            );

            const errorPayload = {
              success: false,
              message,
            };

            socket.emit(
              "message:error",
              errorPayload
            );

            if (callback) {
              callback(errorPayload);
            }
          }
        }
      );

      /**
       * MARK MESSAGES AS READ
       */
      socket.on(
        "message:read",
        async (
          payload: MessageReadPayload,
          callback?: (
            response: unknown
          ) => void
        ) => {
          try {
            const conversationId =
              normalizeId(
                payload?.conversationId
              );

            const otherUserId =
              await getOtherUserId(
                conversationId,
                userId
              );

            const blocked =
              await isBlocked(
                userId,
                otherUserId
              );

            if (blocked) {
              throw new Error(
                "Messaging is unavailable because one of the users is blocked"
              );
            }

            const result =
              await markConversationAsRead(
                userId,
                String(conversationId)
              );

            const response = {
              success: true,
              conversationId,
              markedAsRead:
                result.markedAsRead,
            };

            const room =
              getConversationRoom(
                conversationId
              );

            socket
              .to(room)
              .emit(
                "message:read",
                {
                  conversationId,
                  userId,
                  markedAsRead:
                    result.markedAsRead,
                }
              );

            socket.emit(
              "message:read:success",
              response
            );

            if (callback) {
              callback(response);
            }

            console.log(
              `✓ User ${userId} marked ${result.markedAsRead} messages as read in conversation ${conversationId}`
            );
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to mark messages as read";

            console.error(
              "❌ message:read error:",
              error
            );

            const errorPayload = {
              success: false,
              message,
            };

            socket.emit(
              "message:error",
              errorPayload
            );

            if (callback) {
              callback(errorPayload);
            }
          }
        }
      );

      /**
       * TYPING START
       */
      socket.on(
        "typing:start",
        async (
          payload: TypingPayload
        ) => {
          try {
            const conversationId =
              normalizeId(
                payload?.conversationId
              );

            const otherUserId =
              await getOtherUserId(
                conversationId,
                userId
              );

            const blocked =
              await isBlocked(
                userId,
                otherUserId
              );

            if (blocked) {
              return;
            }

            emitTypingToConversation(
              socket,
              conversationId,
              "typing:start"
            );
          } catch (error) {
            console.error(
              "❌ typing:start error:",
              error
            );
          }
        }
      );

      /**
       * TYPING STOP
       */
      socket.on(
        "typing:stop",
        async (
          payload: TypingPayload
        ) => {
          try {
            const conversationId =
              normalizeId(
                payload?.conversationId
              );

            const otherUserId =
              await getOtherUserId(
                conversationId,
                userId
              );

            const blocked =
              await isBlocked(
                userId,
                otherUserId
              );

            if (blocked) {
              return;
            }

            emitTypingToConversation(
              socket,
              conversationId,
              "typing:stop"
            );
          } catch (error) {
            console.error(
              "❌ typing:stop error:",
              error
            );
          }
        }
      );

      /**
       * DISCONNECT
       */
      socket.on(
        "disconnect",
        (reason) => {
          void (async () => {
            try {
              const userRoom = getUserRoom(userId);
              const remainingSockets = await io
                .in(userRoom)
                .fetchSockets();

              if (remainingSockets.length > 0) {
                console.log(
                  `🔌 Socket disconnected | userId=${userId} | socketId=${socket.id} | reason=${reason} | other sockets still active=${remainingSockets.length}`
                );
                return;
              }

              const presence = await setUserOffline(userId);
              await broadcastPresence(io, userId, presence);

              console.log(
                `🔴 User ${userId} is offline | lastSeen=${presence.last_seen_at?.toISOString() ?? "null"}`
              );
            } catch (error) {
              console.error("❌ Presence offline error:", error);
            }

            console.log(
              `🔌 Socket disconnected | userId=${userId} | socketId=${socket.id} | reason=${reason}`
            );
          })();
        }
      );
    }
  );
};