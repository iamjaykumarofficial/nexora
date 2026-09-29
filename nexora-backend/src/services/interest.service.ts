import prisma from "../config/prisma";
import { refreshProfileCompletion } from "./profile.service";

interface InterestRecord {
  id: number;
  name: string;
}

interface UserInterestRecord {
  interest_id: number;
  name: string;
}

const parseUserId = (userId: string): bigint => {
  try {
    return BigInt(userId);
  } catch {
    throw new Error("Invalid user ID");
  }
};

export const getAllInterests = async () => {
  const interests = await prisma.$queryRaw<InterestRecord[]>`
    SELECT id, name
    FROM interests
    ORDER BY name ASC
  `;

  return interests.map((interest) => ({
    id: interest.id,
    name: interest.name,
  }));
};

export const getMyInterests = async (userId: string) => {
  const numericUserId = parseUserId(userId);

  const interests = await prisma.$queryRaw<UserInterestRecord[]>`
    SELECT
      i.id AS interest_id,
      i.name
    FROM user_interests ui
    INNER JOIN interests i
      ON i.id = ui.interest_id
    WHERE ui.user_id = ${numericUserId}
    ORDER BY i.name ASC
  `;

  return interests.map((interest) => ({
    id: interest.interest_id,
    name: interest.name,
  }));
};

export const addMyInterests = async (
  userId: string,
  interestIds: unknown
) => {
  const numericUserId = parseUserId(userId);

  if (!Array.isArray(interestIds)) {
    throw new Error("interestIds must be an array");
  }

  if (interestIds.length === 0) {
    throw new Error("Please select at least one interest");
  }

  if (interestIds.length > 10) {
    throw new Error("You can select a maximum of 10 interests");
  }

  const parsedInterestIds = interestIds.map((id) => {
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new Error("Invalid interest ID");
    }

    return numericId;
  });

  const uniqueInterestIds = [...new Set(parsedInterestIds)];

  if (uniqueInterestIds.length !== parsedInterestIds.length) {
    throw new Error("Duplicate interests are not allowed");
  }

  const placeholders = uniqueInterestIds.map(() => "?").join(", ");

  const existingInterests = await prisma.$queryRawUnsafe<
    InterestRecord[]
  >(
    `
      SELECT id, name
      FROM interests
      WHERE id IN (${placeholders})
      ORDER BY name ASC
    `,
    ...uniqueInterestIds
  );

  if (existingInterests.length !== uniqueInterestIds.length) {
    throw new Error("One or more selected interests are invalid");
  }

  await prisma.$executeRaw`
    DELETE FROM user_interests
    WHERE user_id = ${numericUserId}
  `;

  for (const interestId of uniqueInterestIds) {
    await prisma.$executeRaw`
      INSERT INTO user_interests (user_id, interest_id)
      VALUES (${numericUserId}, ${interestId})
    `;
  }

  // Recalculate profile completion automatically.
  await refreshProfileCompletion(userId);

  return getMyInterests(userId);
};

export const removeMyInterest = async (
  userId: string,
  interestId: string
) => {
  const numericUserId = parseUserId(userId);

  const numericInterestId = Number(interestId);

  if (
    !Number.isInteger(numericInterestId) ||
    numericInterestId <= 0
  ) {
    throw new Error("Invalid interest ID");
  }

  const existing = await prisma.$queryRaw<
    { interest_id: number }[]
  >`
    SELECT interest_id
    FROM user_interests
    WHERE user_id = ${numericUserId}
      AND interest_id = ${numericInterestId}
    LIMIT 1
  `;

  if (existing.length === 0) {
    throw new Error("Interest is not selected");
  }

  await prisma.$executeRaw`
    DELETE FROM user_interests
    WHERE user_id = ${numericUserId}
      AND interest_id = ${numericInterestId}
  `;

  // Recalculate after removing an interest.
  await refreshProfileCompletion(userId);

  return getMyInterests(userId);
};