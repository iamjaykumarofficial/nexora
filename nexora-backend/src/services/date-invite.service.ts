import prisma from "../config/prisma";
import { createNotification } from "./notification.service";

export type DateInviteType =
  | "coffee"
  | "dinner"
  | "movie"
  | "walk"
  | "other";

export type DateInviteStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled";

interface DateInviteRow {
  id: number | bigint;
  match_id: number | bigint;
  from_user_id: number | bigint;
  to_user_id: number | bigint;
  date_type: DateInviteType;
  proposed_time: Date | null;
  place_name: string | null;
  note: string | null;
  status: DateInviteStatus;
  created_at: Date;
}

interface MatchRow {
  id: number | bigint;
  user1_id: number | bigint;
  user2_id: number | bigint;
  is_active: number | boolean;
}

const parsePositiveId = (
  value: string | number | bigint,
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

const normalizeDateType = (
  value: unknown
): DateInviteType => {
  if (
    value !== "coffee" &&
    value !== "dinner" &&
    value !== "movie" &&
    value !== "walk" &&
    value !== "other"
  ) {
    throw new Error(
      "dateType must be coffee, dinner, movie, walk, or other"
    );
  }

  return value;
};

const normalizeOptionalText = (
  value: unknown,
  maxLength: number,
  fieldName: string
): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > maxLength) {
    throw new Error(
      `${fieldName} must be at most ${maxLength} characters`
    );
  }

  return trimmed;
};

const parseProposedTime = (
  value: unknown
): Date | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(
      "proposedTime must be a valid date-time string"
    );
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(
      "proposedTime must be a valid date-time"
    );
  }

  if (parsed.getTime() <= Date.now()) {
    throw new Error(
      "proposedTime must be in the future"
    );
  }

  return parsed;
};

const formatInvite = (row: DateInviteRow) => ({
  id: Number(row.id),
  matchId: Number(row.match_id),
  fromUserId: Number(row.from_user_id),
  toUserId: Number(row.to_user_id),
  dateType: row.date_type,
  proposedTime: row.proposed_time,
  placeName: row.place_name,
  note: row.note,
  status: row.status,
  createdAt: row.created_at,
});

const getInviteById = async (
  inviteId: bigint
): Promise<DateInviteRow | null> => {
  const rows = await prisma.$queryRaw<DateInviteRow[]>`
    SELECT
      id,
      match_id,
      from_user_id,
      to_user_id,
      date_type,
      proposed_time,
      place_name,
      note,
      status,
      created_at
    FROM date_invites
    WHERE id = ${inviteId}
    LIMIT 1
  `;

  return rows.length > 0 ? rows[0] : null;
};

const getActiveMatch = async (
  userId: bigint,
  otherUserId: bigint,
  matchId: bigint
): Promise<MatchRow> => {
  const rows = await prisma.$queryRaw<MatchRow[]>`
    SELECT
      id,
      user1_id,
      user2_id,
      is_active
    FROM matches
    WHERE
      id = ${matchId}
      AND is_active = 1
      AND (
        (
          user1_id = ${userId}
          AND user2_id = ${otherUserId}
        )
        OR
        (
          user1_id = ${otherUserId}
          AND user2_id = ${userId}
        )
      )
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new Error(
      "Active match not found between these users"
    );
  }

  return rows[0];
};

const isBlocked = async (
  userId: bigint,
  otherUserId: bigint
): Promise<boolean> => {
  const rows = await prisma.$queryRaw<
    Array<{ blocked: number }>
  >`
    SELECT 1 AS blocked
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

  return rows.length > 0;
};

const notifyUser = async (
  userId: bigint,
  title: string,
  message: string,
  referenceId: bigint
): Promise<void> => {
  try {
    await createNotification({
      userId: String(userId),
      type: "system",
      title,
      message,
      referenceId: String(referenceId),
    });
  } catch (error) {
    console.error(
      "❌ Date invite notification error:",
      error
    );
  }
};

export const createDateInvite = async (
  userId: string,
  input: {
    matchId: unknown;
    toUserId: unknown;
    dateType: unknown;
    proposedTime?: unknown;
    placeName?: unknown;
    note?: unknown;
  }
) => {
  const fromUserId = parsePositiveId(
    userId,
    "user ID"
  );

  const matchId = parsePositiveId(
    String(input.matchId),
    "match ID"
  );

  const toUserId = parsePositiveId(
    String(input.toUserId),
    "target user ID"
  );

  if (fromUserId === toUserId) {
    throw new Error(
      "You cannot send a date invite to yourself"
    );
  }

  const dateType = normalizeDateType(
    input.dateType
  );

  const proposedTime = parseProposedTime(
    input.proposedTime
  );

  const placeName = normalizeOptionalText(
    input.placeName,
    255,
    "placeName"
  );

  const note = normalizeOptionalText(
    input.note,
    2000,
    "note"
  );

  await getActiveMatch(
    fromUserId,
    toUserId,
    matchId
  );

  if (
    await isBlocked(
      fromUserId,
      toUserId
    )
  ) {
    throw new Error(
      "You cannot send a date invite because one of the users is blocked"
    );
  }

  const existingPending =
    await prisma.$queryRaw<Array<{ id: number | bigint }>>`
      SELECT id
      FROM date_invites
      WHERE
        match_id = ${matchId}
        AND from_user_id = ${fromUserId}
        AND to_user_id = ${toUserId}
        AND status = 'pending'
      ORDER BY id DESC
      LIMIT 1
    `;

  if (existingPending.length > 0) {
    throw new Error(
      "You already have a pending date invite for this user"
    );
  }

  await prisma.$executeRaw`
    INSERT INTO date_invites (
      match_id,
      from_user_id,
      to_user_id,
      date_type,
      proposed_time,
      place_name,
      note,
      status
    )
    VALUES (
      ${matchId},
      ${fromUserId},
      ${toUserId},
      ${dateType},
      ${proposedTime},
      ${placeName},
      ${note},
      'pending'
    )
  `;

  const createdRows =
    await prisma.$queryRaw<DateInviteRow[]>`
      SELECT
        id,
        match_id,
        from_user_id,
        to_user_id,
        date_type,
        proposed_time,
        place_name,
        note,
        status,
        created_at
      FROM date_invites
      WHERE
        match_id = ${matchId}
        AND from_user_id = ${fromUserId}
        AND to_user_id = ${toUserId}
      ORDER BY id DESC
      LIMIT 1
    `;

  if (createdRows.length === 0) {
    throw new Error(
      "Unable to create date invite"
    );
  }

  const invite = formatInvite(
    createdRows[0]
  );

  await notifyUser(
    toUserId,
    "New date invite",
    "You received a new date invite on Nexora.",
    BigInt(invite.id)
  );

  return invite;
};

export const getMyDateInvites = async (
  userId: string,
  statusInput?: unknown
) => {
  const currentUserId = parsePositiveId(
    userId,
    "user ID"
  );

  let status: DateInviteStatus | null = null;

  if (statusInput !== undefined) {
    if (
      statusInput !== "pending" &&
      statusInput !== "accepted" &&
      statusInput !== "declined" &&
      statusInput !== "cancelled"
    ) {
      throw new Error(
        "Invalid date invite status"
      );
    }

    status = statusInput;
  }

  const rows = status
    ? await prisma.$queryRaw<DateInviteRow[]>`
        SELECT
          id,
          match_id,
          from_user_id,
          to_user_id,
          date_type,
          proposed_time,
          place_name,
          note,
          status,
          created_at
        FROM date_invites
        WHERE
          (
            from_user_id = ${currentUserId}
            OR to_user_id = ${currentUserId}
          )
          AND status = ${status}
        ORDER BY created_at DESC, id DESC
      `
    : await prisma.$queryRaw<DateInviteRow[]>`
        SELECT
          id,
          match_id,
          from_user_id,
          to_user_id,
          date_type,
          proposed_time,
          place_name,
          note,
          status,
          created_at
        FROM date_invites
        WHERE
          from_user_id = ${currentUserId}
          OR to_user_id = ${currentUserId}
        ORDER BY created_at DESC, id DESC
      `;

  return rows.map(formatInvite);
};

export const getDateInviteByIdForUser = async (
  userId: string,
  inviteId: string
) => {
  const currentUserId = parsePositiveId(
    userId,
    "user ID"
  );

  const numericInviteId = parsePositiveId(
    inviteId,
    "date invite ID"
  );

  const invite = await getInviteById(
    numericInviteId
  );

  if (!invite) {
    throw new Error(
      "Date invite not found"
    );
  }

  const fromUserId = BigInt(
    invite.from_user_id
  );

  const toUserId = BigInt(
    invite.to_user_id
  );

  if (
    currentUserId !== fromUserId &&
    currentUserId !== toUserId
  ) {
    throw new Error(
      "You are not authorized to view this date invite"
    );
  }

  return formatInvite(invite);
};

export const acceptDateInvite = async (
  userId: string,
  inviteId: string
) => {
  const currentUserId = parsePositiveId(
    userId,
    "user ID"
  );

  const numericInviteId = parsePositiveId(
    inviteId,
    "date invite ID"
  );

  const invite =
    await getInviteById(
      numericInviteId
    );

  if (!invite) {
    throw new Error(
      "Date invite not found"
    );
  }

  const senderId = BigInt(
    invite.from_user_id
  );

  const receiverId = BigInt(
    invite.to_user_id
  );

  if (currentUserId !== receiverId) {
    throw new Error(
      "Only the recipient can accept this date invite"
    );
  }

  if (invite.status !== "pending") {
    throw new Error(
      `Cannot accept a ${invite.status} date invite`
    );
  }

  await getActiveMatch(
    currentUserId,
    senderId,
    BigInt(invite.match_id)
  );

  if (
    await isBlocked(
      currentUserId,
      senderId
    )
  ) {
    throw new Error(
      "You cannot accept this date invite because one of the users is blocked"
    );
  }

  await prisma.$executeRaw`
    UPDATE date_invites
    SET status = 'accepted'
    WHERE id = ${numericInviteId}
  `;

  const updated =
    await getInviteById(
      numericInviteId
    );

  if (!updated) {
    throw new Error(
      "Unable to read updated date invite"
    );
  }

  const result = formatInvite(updated);

  await notifyUser(
    senderId,
    "Date invite accepted",
    "Your date invite was accepted.",
    numericInviteId
  );

  return result;
};

export const declineDateInvite = async (
  userId: string,
  inviteId: string
) => {
  const currentUserId = parsePositiveId(
    userId,
    "user ID"
  );

  const numericInviteId = parsePositiveId(
    inviteId,
    "date invite ID"
  );

  const invite =
    await getInviteById(
      numericInviteId
    );

  if (!invite) {
    throw new Error(
      "Date invite not found"
    );
  }

  const senderId = BigInt(
    invite.from_user_id
  );

  const receiverId = BigInt(
    invite.to_user_id
  );

  if (currentUserId !== receiverId) {
    throw new Error(
      "Only the recipient can decline this date invite"
    );
  }

  if (invite.status !== "pending") {
    throw new Error(
      `Cannot decline a ${invite.status} date invite`
    );
  }

  await prisma.$executeRaw`
    UPDATE date_invites
    SET status = 'declined'
    WHERE id = ${numericInviteId}
  `;

  const updated =
    await getInviteById(
      numericInviteId
    );

  if (!updated) {
    throw new Error(
      "Unable to read updated date invite"
    );
  }

  const result = formatInvite(updated);

  await notifyUser(
    senderId,
    "Date invite declined",
    "Your date invite was declined.",
    numericInviteId
  );

  return result;
};

export const cancelDateInvite = async (
  userId: string,
  inviteId: string
) => {
  const currentUserId = parsePositiveId(
    userId,
    "user ID"
  );

  const numericInviteId = parsePositiveId(
    inviteId,
    "date invite ID"
  );

  const invite =
    await getInviteById(
      numericInviteId
    );

  if (!invite) {
    throw new Error(
      "Date invite not found"
    );
  }

  const senderId = BigInt(
    invite.from_user_id
  );

  const receiverId = BigInt(
    invite.to_user_id
  );

  if (currentUserId !== senderId) {
    throw new Error(
      "Only the sender can cancel this date invite"
    );
  }

  if (invite.status !== "pending") {
    throw new Error(
      `Cannot cancel a ${invite.status} date invite`
    );
  }

  await prisma.$executeRaw`
    UPDATE date_invites
    SET status = 'cancelled'
    WHERE id = ${numericInviteId}
  `;

  const updated =
    await getInviteById(
      numericInviteId
    );

  if (!updated) {
    throw new Error(
      "Unable to read updated date invite"
    );
  }

  const result = formatInvite(updated);

  await notifyUser(
    receiverId,
    "Date invite cancelled",
    "A date invite was cancelled.",
    numericInviteId
  );

  return result;
};