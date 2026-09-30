import prisma from "../config/prisma";

const parsePositiveId = (value: unknown): number => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid user ID");
  }

  return id;
};

const formatBlock = (block: {
  blocker_id: bigint | number;
  blocked_id: bigint | number;
  created_at: Date;
}) => ({
  blockerId: String(block.blocker_id),
  blockedId: String(block.blocked_id),
  createdAt: block.created_at,
});

export const blockUser = async (
  blockerIdInput: string,
  blockedIdInput: string
) => {
  const blockerId = parsePositiveId(blockerIdInput);
  const blockedId = parsePositiveId(blockedIdInput);

  if (blockerId === blockedId) {
    throw new Error("You cannot block yourself");
  }

  const users = await prisma.$queryRaw<
    Array<{ id: bigint }>
  >`
    SELECT id
    FROM users
    WHERE id IN (${blockerId}, ${blockedId})
  `;

  if (users.length !== 2) {
    throw new Error("User not found");
  }

  const existingBlock = await prisma.$queryRaw<
    Array<{
      blocker_id: bigint;
      blocked_id: bigint;
      created_at: Date;
    }>
  >`
    SELECT
      blocker_id,
      blocked_id,
      created_at
    FROM blocks
    WHERE blocker_id = ${blockerId}
      AND blocked_id = ${blockedId}
    LIMIT 1
  `;

  if (existingBlock.length > 0) {
    return formatBlock(existingBlock[0]);
  }

  await prisma.$executeRaw`
    INSERT INTO blocks (
      blocker_id,
      blocked_id
    )
    VALUES (
      ${blockerId},
      ${blockedId}
    )
  `;

  const block = await prisma.$queryRaw<
    Array<{
      blocker_id: bigint;
      blocked_id: bigint;
      created_at: Date;
    }>
  >`
    SELECT
      blocker_id,
      blocked_id,
      created_at
    FROM blocks
    WHERE blocker_id = ${blockerId}
      AND blocked_id = ${blockedId}
    LIMIT 1
  `;

  if (block.length === 0) {
    throw new Error("Failed to create block");
  }

  return formatBlock(block[0]);
};

export const unblockUser = async (
  blockerIdInput: string,
  blockedIdInput: string
) => {
  const blockerId = parsePositiveId(blockerIdInput);
  const blockedId = parsePositiveId(blockedIdInput);

  const result = await prisma.$executeRaw`
    DELETE FROM blocks
    WHERE blocker_id = ${blockerId}
      AND blocked_id = ${blockedId}
  `;

  if (result === 0) {
    throw new Error("User is not blocked");
  }

  return {
    blockerId: String(blockerId),
    blockedId: String(blockedId),
  };
};

export const getMyBlockedUsers = async (
  blockerIdInput: string
) => {
  const blockerId = parsePositiveId(blockerIdInput);

  const blocks = await prisma.$queryRaw<
    Array<{
      blocker_id: bigint;
      blocked_id: bigint;
      created_at: Date;
    }>
  >`
    SELECT
      blocker_id,
      blocked_id,
      created_at
    FROM blocks
    WHERE blocker_id = ${blockerId}
    ORDER BY created_at DESC
  `;

  return blocks.map(formatBlock);
};

export const isUserBlocked = async (
  userIdInput: string,
  targetUserIdInput: string
) => {
  const userId = parsePositiveId(userIdInput);
  const targetUserId = parsePositiveId(targetUserIdInput);

  const result = await prisma.$queryRaw<
    Array<{ blocked: number }>
  >`
    SELECT 1 AS blocked
    FROM blocks
    WHERE (
      blocker_id = ${userId}
      AND blocked_id = ${targetUserId}
    )
    OR (
      blocker_id = ${targetUserId}
      AND blocked_id = ${userId}
    )
    LIMIT 1
  `;

  return result.length > 0;
};