import { Server, Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";
import prisma from "../config/prisma";
import {
  sendMessage,
  markConversationAsRead,
} from "../services/chat.service";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

interface JoinConversationPayload {
  conversationId: string | number;
}

interface SendMessagePayload {
  conversationId: string | number;
  type?: "text" | "image" | "voice";
  content?: string | null;
  mediaUrl?: string | null;
}

interface ReadMessagePayload {
  conversationId: string | number;
}

interface TypingPayload {
  conversationId: string | number;
}

const normalizeId = (value: string | number): string => {
  const id = String(value).trim();

  if (!/^\d+$/.test(id) || BigInt(id) <= 0n) {
    throw new Error("Invalid conversation ID");
  }

  return id;
};

const getOtherUserId = async (
  userId: string,
  conversationId: string
): Promise<string> => {
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
    WHERE c.id = ${BigInt(conversationId)}
      AND (
        m.user1_id = ${BigInt(userId)}
        OR m.user2_id = ${BigInt(userId)}
      )
      AND m.is_active = TRUE
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new Error(
      "Conversation not found or access denied"
    );
  }

  const match = rows[0];

  return (
    match.user1_id === BigInt(userId)
      ? match.user2_id.toString()
      : match.user1_id.toString()
  );
};

const isBlocked = async (
  userId: string,
  otherUserId: string
): Promise<boolean> => {
  const rows = await prisma.$queryRaw<
    Array<{ blocked: number }>
  >`
    SELECT 1 AS blocked
    FROM blocks
    WHERE
      (
        blocker_id = ${BigInt(userId)}
        AND blocked_id = ${BigInt(otherUserId)}
      )
      OR
      (
        blocker_id = ${BigInt(otherUserId)}
        AND blocked_id = ${BigInt(userId)}
      )
    LIMIT 1
  `;

  return rows.length > 0;
};

const authenticateSocket = (
  socket: AuthenticatedSocket
): string => {
  const authToken =
    typeof socket.handshake.auth?.token === "string"
      ? socket.handshake.auth.token
      : "";

  const authorizationHeader =
    typeof socket.handshake.headers.authorization === "string"
      ? socket.handshake.headers.authorization
      : "";

  let token = authToken;

  if (!token && authorizationHeader.startsWith("Bearer ")) {
    token = authorizationHeader.substring(7).trim();
  }

  if (!token) {
    throw new Error("Authentication token is required");
  }

  const payload = verifyToken(token);

  if (!payload.userId) {
    throw new Error("Invalid authentication token");
  }

  return payload.userId;
};

export const registerChatSocket = (
  io: Server
) => {
  io.use((socket, next) => {
    try {
      const authenticatedSocket =
        socket as AuthenticatedSocket;

      const userId =
        authenticateSocket(authenticatedSocket);

      authenticatedSocket.userId = userId;

      next();
    } catch (error) {
      console.error(
        "Socket authentication error:",
        error
      );

      next(
        new Error(
          "Invalid or expired authentication token"
        )
      );
    }
  });

  io.on(
    "connection",
    (socket) => {
      const authenticatedSocket =
        socket as AuthenticatedSocket;

      const userId =
        authenticatedSocket.userId;

      if (!userId) {
        socket.disconnect(true);
        return;
      }

      console.log(
        `🔌 Socket connected: User ${userId} (${socket.id})`
      );

      // Personal room.
      socket.join(`user:${userId}`);

      socket.emit("socket:connected", {
        success: true,
        userId: Number(userId),
        socketId: socket.id,
        message:
          "Real-time connection established",
      });

      /**
       * JOIN CONVERSATION
       */
      socket.on(
        "conversation:join",
        async (
          payload: JoinConversationPayload,
          callback?: (response: unknown) => void
        ) => {
          try {
            const conversationId =
              normalizeId(
                payload?.conversationId
              );

            const otherUserId =
              await getOtherUserId(
                userId,
                conversationId
              );

            if (
              await isBlocked(
                userId,
                otherUserId
              )
            ) {
              throw new Error(
                "Conversation is unavailable because one of the users is blocked"
              );
            }

            const room =
              `conversation:${conversationId}`;

            socket.join(room);

            socket.emit(
              "conversation:joined",
              {
                success: true,
                conversationId:
                  Number(conversationId),
              }
            );

            callback?.({
              success: true,
              conversationId:
                Number(conversationId),
            });
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Unable to join conversation";

            socket.emit(
              "conversation:error",
              {
                success: false,
                event:
                  "conversation:join",
                message,
              }
            );

            callback?.({
              success: false,
              message,
            });
          }
        }
      );

      /**
       * LEAVE CONVERSATION
       */
      socket.on(
        "conversation:leave",
        (
          payload: JoinConversationPayload,
          callback?: (response: unknown) => void
        ) => {
          try {
            const conversationId =
              normalizeId(
                payload?.conversationId
              );

            const room =
              `conversation:${conversationId}`;

            socket.leave(room);

            socket.emit(
              "conversation:left",
              {
                success: true,
                conversationId:
                  Number(conversationId),
              }
            );

            callback?.({
              success: true,
              conversationId:
                Number(conversationId),
            });
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Unable to leave conversation";

            callback?.({
              success: false,
              message,
            });
          }
        }
      );

      /**
       * SEND MESSAGE
       *
       * REST API ke same service ko use karta hai,
       * isliye validation/business logic duplicate nahi hota.
       */
      socket.on(
        "message:send",
        async (
          payload: SendMessagePayload,
          callback?: (response: unknown) => void
        ) => {
          try {
            const conversationId =
              normalizeId(
                payload?.conversationId
              );

            const otherUserId =
              await getOtherUserId(
                userId,
                conversationId
              );

            if (
              await isBlocked(
                userId,
                otherUserId
              )
            ) {
              throw new Error(
                "Message cannot be sent because one of the users is blocked"
              );
            }

            const message =
              await sendMessage(
                userId,
                conversationId,
                {
                  type:
                    payload?.type ?? "text",
                  content:
                    payload?.content ?? null,
                  mediaUrl:
                    payload?.mediaUrl ?? null,
                }
              );

            const room =
              `conversation:${conversationId}`;

            // Current sender ke conversation room mein.
            io.to(room).emit(
              "message:new",
              {
                success: true,
                message,
              }
            );

            // Receiver ke personal room mein bhi emit.
            io.to(`user:${otherUserId}`).emit(
              "message:new",
              {
                success: true,
                message,
              }
            );

            callback?.({
              success: true,
              message,
            });
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Unable to send message";

            socket.emit(
              "message:error",
              {
                success: false,
                message,
              }
            );

            callback?.({
              success: false,
              message,
            });
          }
        }
      );

      /**
       * MARK MESSAGES AS READ
       */
      socket.on(
        "message:read",
        async (
          payload: ReadMessagePayload,
          callback?: (response: unknown) => void
        ) => {
          try {
            const conversationId =
              normalizeId(
                payload?.conversationId
              );

            const otherUserId =
              await getOtherUserId(
                userId,
                conversationId
              );

            const result =
              await markConversationAsRead(
                userId,
                conversationId
              );

            const eventData = {
              success: true,
              conversationId:
                Number(conversationId),
              markedAsRead:
                result.markedAsRead,
              readerId: Number(userId),
            };

            io.to(
              `user:${otherUserId}`
            ).emit(
              "message:read",
              eventData
            );

            socket.emit(
              "message:read:success",
              eventData
            );

            callback?.(eventData);
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Unable to mark messages as read";

            socket.emit(
              "message:error",
              {
                success: false,
                event:
                  "message:read",
                message,
              }
            );

            callback?.({
              success: false,
              message,
            });
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
                userId,
                conversationId
              );

            if (
              await isBlocked(
                userId,
                otherUserId
              )
            ) {
              return;
            }

            io.to(
              `user:${otherUserId}`
            ).emit(
              "typing:start",
              {
                conversationId:
                  Number(conversationId),
                userId: Number(userId),
              }
            );
          } catch {
            // Typing events are non-critical.
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
                userId,
                conversationId
              );

            if (
              await isBlocked(
                userId,
                otherUserId
              )
            ) {
              return;
            }

            io.to(
              `user:${otherUserId}`
            ).emit(
              "typing:stop",
              {
                conversationId:
                  Number(conversationId),
                userId: Number(userId),
              }
            );
          } catch {
            // Typing events are non-critical.
          }
        }
      );

      /**
       * DISCONNECT
       */
      socket.on(
        "disconnect",
        (reason) => {
          console.log(
            `🔌 Socket disconnected: User ${userId} (${socket.id}) — ${reason}`
          );
        }
      );
    }
  );
};