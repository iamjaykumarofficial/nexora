import prisma from "../config/prisma";

type MessageType = "text" | "image" | "voice";

interface SendMessageInput {
  type?: MessageType;
  content?: string | null;
  mediaUrl?: string | null;
}

interface ConversationRecord {
  id: bigint;
  match_id: bigint;
  last_message_at: Date | null;
  created_at: Date;
}

interface MessageRecord {
  id: bigint;
  conversation_id: bigint;
  sender_id: bigint;
  type: MessageType;
  content: string | null;
  media_url: string | null;
  is_read: number | boolean;
  created_at: Date;
}

const parseUserId = (userId: string): bigint => {
  try {
    const id = BigInt(userId);

    if (id <= 0n) {
      throw new Error();
    }

    return id;
  } catch {
    throw new Error("Invalid user ID");
  }
};

const parsePositiveBigInt = (
  value: string,
  fieldName: string
): bigint => {
  try {
    const id = BigInt(value);

    if (id <= 0n) {
      throw new Error();
    }

    return id;
  } catch {
    throw new Error(`Invalid ${fieldName}`);
  }
};

const escapeSqlString = (value: string): string => {
  return value.replace(/'/g, "''");
};

const formatConversation = (
  conversation: ConversationRecord
) => {
  return {
    id: Number(conversation.id),
    matchId: Number(conversation.match_id),
    lastMessageAt: conversation.last_message_at,
    createdAt: conversation.created_at,
  };
};

const formatMessage = (
  message: MessageRecord
) => {
  return {
    id: Number(message.id),
    conversationId: Number(message.conversation_id),
    senderId: Number(message.sender_id),
    type: message.type,
    content: message.content,
    mediaUrl: message.media_url,
    isRead: Boolean(message.is_read),
    createdAt: message.created_at,
  };
};

/**
 * Verify that:
 * - conversation exists
 * - current user belongs to the match
 * - match is active
 * - users are not blocked
 */
const getAuthorizedConversation = async (
  userId: bigint,
  conversationId: bigint
) => {
  const rows = await prisma.$queryRaw<
    Array<{
      conversation_id: bigint;
      match_id: bigint;
      user1_id: bigint;
      user2_id: bigint;
      is_active: number | boolean;
    }>
  >`
    SELECT
      c.id AS conversation_id,
      m.id AS match_id,
      m.user1_id,
      m.user2_id,
      m.is_active
    FROM conversations c
    INNER JOIN matches m
      ON m.id = c.match_id
    WHERE c.id = ${conversationId}
      AND (
        m.user1_id = ${userId}
        OR m.user2_id = ${userId}
      )
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new Error(
      "Conversation not found or access denied"
    );
  }

  const conversation = rows[0];

  if (!Boolean(conversation.is_active)) {
    throw new Error("This match is no longer active");
  }

  const otherUserId =
    conversation.user1_id === userId
      ? conversation.user2_id
      : conversation.user1_id;

  const blockedRows = await prisma.$queryRaw<
    Array<{ id: bigint }>
  >`
    SELECT id
    FROM blocks
    WHERE
      (
        blocker_id = ${userId}
        AND blocked_id = ${otherUserId}
      )
      OR
      (
        blocker_id = ${otherUserId}
        AND blocked_id = ${userId}
      )
    LIMIT 1
  `;

  if (blockedRows.length > 0) {
    throw new Error(
      "Messaging is unavailable because one of the users is blocked"
    );
  }

  return {
    conversationId: conversation.conversation_id,
    matchId: conversation.match_id,
    user1Id: conversation.user1_id,
    user2Id: conversation.user2_id,
    otherUserId,
  };
};

/**
 * Create or return the conversation for an active match.
 */
export const createConversation = async (
  userId: string,
  matchId: string
) => {
  const numericUserId = parseUserId(userId);
  const numericMatchId = parsePositiveBigInt(
    matchId,
    "match ID"
  );

  const matches = await prisma.$queryRaw<
    Array<{
      id: bigint;
      user1_id: bigint;
      user2_id: bigint;
      is_active: number | boolean;
    }>
  >`
    SELECT
      id,
      user1_id,
      user2_id,
      is_active
    FROM matches
    WHERE id = ${numericMatchId}
    LIMIT 1
  `;

  if (matches.length === 0) {
    throw new Error("Match not found");
  }

  const match = matches[0];

  if (
    match.user1_id !== numericUserId &&
    match.user2_id !== numericUserId
  ) {
    throw new Error(
      "You are not a participant of this match"
    );
  }

  if (!Boolean(match.is_active)) {
    throw new Error("This match is no longer active");
  }

  const otherUserId =
    match.user1_id === numericUserId
      ? match.user2_id
      : match.user1_id;

  const blockedRows = await prisma.$queryRaw<
    Array<{ id: bigint }>
  >`
    SELECT id
    FROM blocks
    WHERE
      (
        blocker_id = ${numericUserId}
        AND blocked_id = ${otherUserId}
      )
      OR
      (
        blocker_id = ${otherUserId}
        AND blocked_id = ${numericUserId}
      )
    LIMIT 1
  `;

  if (blockedRows.length > 0) {
    throw new Error(
      "Conversation cannot be created because one of the users is blocked"
    );
  }

  const existing = await prisma.$queryRaw<
    ConversationRecord[]
  >`
    SELECT
      id,
      match_id,
      last_message_at,
      created_at
    FROM conversations
    WHERE match_id = ${numericMatchId}
    LIMIT 1
  `;

  if (existing.length > 0) {
    return {
      created: false,
      conversation: formatConversation(existing[0]),
    };
  }

  await prisma.$executeRaw`
    INSERT INTO conversations (
      match_id
    )
    VALUES (
      ${numericMatchId}
    )
  `;

  const conversations = await prisma.$queryRaw<
    ConversationRecord[]
  >`
    SELECT
      id,
      match_id,
      last_message_at,
      created_at
    FROM conversations
    WHERE match_id = ${numericMatchId}
    LIMIT 1
  `;

  if (conversations.length === 0) {
    throw new Error(
      "Unable to create conversation"
    );
  }

  return {
    created: true,
    conversation: formatConversation(
      conversations[0]
    ),
  };
};

/**
 * Get all conversations for current user.
 */
export const getMyConversations = async (
  userId: string
) => {
  const numericUserId = parseUserId(userId);

  const rows = await prisma.$queryRaw<
    Array<{
      conversation_id: bigint;
      match_id: bigint;
      other_user_id: bigint;
      other_user_name: string | null;
      other_user_gender: string | null;
      other_user_city: string | null;
      other_user_photo: string | null;
      last_message_id: bigint | null;
      last_message_sender_id: bigint | null;
      last_message_type: MessageType | null;
      last_message_content: string | null;
      last_message_created_at: Date | null;
      unread_count: bigint | number;
      last_message_at: Date | null;
      created_at: Date;
    }>
  >`
    SELECT
      c.id AS conversation_id,
      c.match_id,

      CASE
        WHEN m.user1_id = ${numericUserId}
          THEN m.user2_id
        ELSE m.user1_id
      END AS other_user_id,

      CASE
        WHEN m.user1_id = ${numericUserId}
          THEN p2.full_name
        ELSE p1.full_name
      END AS other_user_name,

      CASE
        WHEN m.user1_id = ${numericUserId}
          THEN p2.gender
        ELSE p1.gender
      END AS other_user_gender,

      CASE
        WHEN m.user1_id = ${numericUserId}
          THEN p2.city
        ELSE p1.city
      END AS other_user_city,

      CASE
        WHEN m.user1_id = ${numericUserId}
          THEN (
            SELECT ph.url
            FROM photos ph
            WHERE ph.user_id = m.user2_id
            ORDER BY ph.position ASC, ph.id ASC
            LIMIT 1
          )
        ELSE (
            SELECT ph.url
            FROM photos ph
            WHERE ph.user_id = m.user1_id
            ORDER BY ph.position ASC, ph.id ASC
            LIMIT 1
          )
      END AS other_user_photo,

      (
        SELECT msg.id
        FROM messages msg
        WHERE msg.conversation_id = c.id
        ORDER BY msg.created_at DESC, msg.id DESC
        LIMIT 1
      ) AS last_message_id,

      (
        SELECT msg.sender_id
        FROM messages msg
        WHERE msg.conversation_id = c.id
        ORDER BY msg.created_at DESC, msg.id DESC
        LIMIT 1
      ) AS last_message_sender_id,

      (
        SELECT msg.type
        FROM messages msg
        WHERE msg.conversation_id = c.id
        ORDER BY msg.created_at DESC, msg.id DESC
        LIMIT 1
      ) AS last_message_type,

      (
        SELECT msg.content
        FROM messages msg
        WHERE msg.conversation_id = c.id
        ORDER BY msg.created_at DESC, msg.id DESC
        LIMIT 1
      ) AS last_message_content,

      (
        SELECT msg.created_at
        FROM messages msg
        WHERE msg.conversation_id = c.id
        ORDER BY msg.created_at DESC, msg.id DESC
        LIMIT 1
      ) AS last_message_created_at,

      (
        SELECT COUNT(*)
        FROM messages unread_msg
        WHERE
          unread_msg.conversation_id = c.id
          AND unread_msg.sender_id <> ${numericUserId}
          AND unread_msg.is_read = FALSE
      ) AS unread_count,

      c.last_message_at,
      c.created_at

    FROM conversations c

    INNER JOIN matches m
      ON m.id = c.match_id

    LEFT JOIN profiles p1
      ON p1.user_id = m.user1_id

    LEFT JOIN profiles p2
      ON p2.user_id = m.user2_id

    WHERE
      m.is_active = TRUE
      AND (
        m.user1_id = ${numericUserId}
        OR m.user2_id = ${numericUserId}
      )

      AND NOT EXISTS (
        SELECT 1
        FROM blocks b
        WHERE
          (
            b.blocker_id = ${numericUserId}
            AND b.blocked_id =
              CASE
                WHEN m.user1_id = ${numericUserId}
                  THEN m.user2_id
                ELSE m.user1_id
              END
          )
          OR
          (
            b.blocked_id = ${numericUserId}
            AND b.blocker_id =
              CASE
                WHEN m.user1_id = ${numericUserId}
                  THEN m.user2_id
                ELSE m.user1_id
              END
          )
      )

    ORDER BY
      COALESCE(
        c.last_message_at,
        c.created_at
      ) DESC,
      c.id DESC
  `;

  return rows.map((row) => ({
    conversationId: Number(
      row.conversation_id
    ),

    matchId: Number(row.match_id),

    otherUser: {
      userId: Number(row.other_user_id),
      fullName: row.other_user_name,
      gender: row.other_user_gender,
      city: row.other_user_city,
      photoUrl: row.other_user_photo,
    },

    lastMessage: row.last_message_id
      ? {
          id: Number(row.last_message_id),
          senderId: Number(
            row.last_message_sender_id
          ),
          type: row.last_message_type,
          content: row.last_message_content,
          createdAt:
            row.last_message_created_at,
        }
      : null,

    unreadCount: Number(row.unread_count),

    lastMessageAt: row.last_message_at,

    createdAt: row.created_at,
  }));
};

/**
 * Get one conversation with the other user's profile.
 */
export const getConversation = async (
  userId: string,
  conversationId: string
) => {
  const numericUserId = parseUserId(userId);

  const numericConversationId =
    parsePositiveBigInt(
      conversationId,
      "conversation ID"
    );

  const authorized =
    await getAuthorizedConversation(
      numericUserId,
      numericConversationId
    );

  const profileRows = await prisma.$queryRaw<
    Array<{
      user_id: bigint;
      full_name: string | null;
      gender: string | null;
      city: string | null;
      relationship_goal: string | null;
      photo_url: string | null;
    }>
  >`
    SELECT
      p.user_id,
      p.full_name,
      p.gender,
      p.city,
      p.relationship_goal,
      (
        SELECT ph.url
        FROM photos ph
        WHERE ph.user_id = p.user_id
        ORDER BY ph.position ASC, ph.id ASC
        LIMIT 1
      ) AS photo_url
    FROM profiles p
    WHERE p.user_id = ${authorized.otherUserId}
    LIMIT 1
  `;

  const conversationRows =
    await prisma.$queryRaw<ConversationRecord[]>`
      SELECT
        id,
        match_id,
        last_message_at,
        created_at
      FROM conversations
      WHERE id = ${numericConversationId}
      LIMIT 1
    `;

  if (conversationRows.length === 0) {
    throw new Error("Conversation not found");
  }

  return {
    conversation: formatConversation(
      conversationRows[0]
    ),

    otherUser:
      profileRows.length > 0
        ? {
            userId: Number(
              profileRows[0].user_id
            ),
            fullName:
              profileRows[0].full_name,
            gender: profileRows[0].gender,
            city: profileRows[0].city,
            relationshipGoal:
              profileRows[0].relationship_goal,
            photoUrl:
              profileRows[0].photo_url,
          }
        : null,
  };
};

/**
 * Send a message.
 */
export const sendMessage = async (
  userId: string,
  conversationId: string,
  input: SendMessageInput
) => {
  const numericUserId = parseUserId(userId);

  const numericConversationId =
    parsePositiveBigInt(
      conversationId,
      "conversation ID"
    );

  const authorized =
    await getAuthorizedConversation(
      numericUserId,
      numericConversationId
    );

  const type = input.type ?? "text";

  if (!["text", "image", "voice"].includes(type)) {
    throw new Error(
      "Message type must be text, image, or voice"
    );
  }

  const content =
    typeof input.content === "string"
      ? input.content.trim()
      : null;

  const mediaUrl =
    typeof input.mediaUrl === "string"
      ? input.mediaUrl.trim()
      : null;

  if (type === "text") {
    if (!content) {
      throw new Error(
        "Message content is required for text messages"
      );
    }

    if (content.length > 5000) {
      throw new Error(
        "Message cannot exceed 5000 characters"
      );
    }
  }

  if (type === "image" || type === "voice") {
    if (!mediaUrl) {
      throw new Error(
        `mediaUrl is required for ${type} messages`
      );
    }

    if (mediaUrl.length > 500) {
      throw new Error(
        "mediaUrl cannot exceed 500 characters"
      );
    }
  }

  if (mediaUrl && !/^https?:\/\/.+/i.test(mediaUrl)) {
    throw new Error(
      "mediaUrl must be a valid HTTP/HTTPS URL"
    );
  }

  const safeType = escapeSqlString(type);
  const safeContent = content
    ? `'${escapeSqlString(content)}'`
    : "NULL";
  const safeMediaUrl = mediaUrl
    ? `'${escapeSqlString(mediaUrl)}'`
    : "NULL";

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO messages (
        conversation_id,
        sender_id,
        type,
        content,
        media_url,
        is_read
      )
      VALUES (
        ${authorized.conversationId.toString()},
        ${numericUserId.toString()},
        '${safeType}',
        ${safeContent},
        ${safeMediaUrl},
        FALSE
      )
    `
  );

  await prisma.$executeRaw`
    UPDATE conversations
    SET last_message_at = CURRENT_TIMESTAMP
    WHERE id = ${authorized.conversationId}
  `;

  const messages = await prisma.$queryRaw<
    MessageRecord[]
  >`
    SELECT
      id,
      conversation_id,
      sender_id,
      type,
      content,
      media_url,
      is_read,
      created_at
    FROM messages
    WHERE
      conversation_id = ${authorized.conversationId}
      AND sender_id = ${numericUserId}
    ORDER BY id DESC
    LIMIT 1
  `;

  if (messages.length === 0) {
    throw new Error("Unable to send message");
  }

  return formatMessage(messages[0]);
};

/**
 * Get paginated messages.
 */
export const getMessages = async (
  userId: string,
  conversationId: string,
  page = 1,
  limit = 30
) => {
  const numericUserId = parseUserId(userId);

  const numericConversationId =
    parsePositiveBigInt(
      conversationId,
      "conversation ID"
    );

  const authorized =
    await getAuthorizedConversation(
      numericUserId,
      numericConversationId
    );

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
    MessageRecord[]
  >(
    `
      SELECT
        id,
        conversation_id,
        sender_id,
        type,
        content,
        media_url,
        is_read,
        created_at
      FROM messages
      WHERE conversation_id = ${authorized.conversationId.toString()}
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit + 1}
      OFFSET ${offset}
    `
  );

  const hasMore = rows.length > limit;

  const messages = rows
    .slice(0, limit)
    .reverse()
    .map(formatMessage);

  return {
    messages,
    pagination: {
      page,
      limit,
      hasMore,
    },
  };
};

/**
 * Mark incoming messages as read.
 */
export const markConversationAsRead = async (
  userId: string,
  conversationId: string
) => {
  const numericUserId = parseUserId(userId);

  const numericConversationId =
    parsePositiveBigInt(
      conversationId,
      "conversation ID"
    );

  const authorized =
    await getAuthorizedConversation(
      numericUserId,
      numericConversationId
    );

  const result = await prisma.$executeRaw`
    UPDATE messages
    SET is_read = TRUE
    WHERE
      conversation_id = ${authorized.conversationId}
      AND sender_id <> ${numericUserId}
      AND is_read = FALSE
  `;

  return {
    conversationId: Number(
      authorized.conversationId
    ),
    markedAsRead: Number(result),
  };
};