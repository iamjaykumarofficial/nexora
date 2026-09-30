import prisma from "../config/prisma";
import { createNotification } from "./notification.service";

type SwipeAction = "like" | "pass" | "superlike";

interface SelectLimitRow {
  user_id: number | bigint;
  used_count: number;
  reset_at: Date | null;
}

interface UserStatusRow {
  id: number | bigint;
  is_active: number | boolean;
  is_banned: number | boolean;
}

interface ProfileRow {
  user_id: number | bigint;
  is_profile_complete: number | boolean;
}

interface ExistingSwipeRow {
  id: number | bigint;
  action: string;
}

interface MutualSwipeRow {
  id: number | bigint;
  action: string;
}

interface SubscriptionRow {
  id: number | bigint;
  status: string;
  ends_at: Date;
}

interface MatchRow {
  id: number | bigint;
  user1_id: number | bigint;
  user2_id: number | bigint;
  matched_at: Date;
  is_active: number | boolean;
}

const FREE_DAILY_SELECT_LIMIT = 10;

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

const parseTargetUserId = (targetUserId: string): bigint => {
  try {
    const id = BigInt(targetUserId);

    if (id <= 0n) {
      throw new Error();
    }

    return id;
  } catch {
    throw new Error("Invalid target user ID");
  }
};

const normalizeAction = (action: unknown): SwipeAction => {
  if (
    action !== "like" &&
    action !== "pass" &&
    action !== "superlike"
  ) {
    throw new Error(
      "Action must be like, pass, or superlike"
    );
  }

  return action;
};

const getStartOfTomorrow = (): Date => {
  const tomorrow = new Date();

  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow;
};

const hasActiveSubscription = async (
  userId: bigint
): Promise<boolean> => {
  const subscriptions = await prisma.$queryRaw<
    SubscriptionRow[]
  >`
    SELECT
      id,
      status,
      ends_at
    FROM subscriptions
    WHERE
      user_id = ${userId}
      AND status = 'active'
      AND ends_at > NOW()
    ORDER BY id DESC
    LIMIT 1
  `;

  return subscriptions.length > 0;
};

export const getMySelectLimit = async (userId: string) => {
  const numericUserId = parseUserId(userId);

  const premium = await hasActiveSubscription(
    numericUserId
  );

  if (premium) {
    return {
      isPremium: true,
      usedCount: 0,
      remaining: null,
      dailyLimit: null,
      resetAt: null,
    };
  }

  const existingRows = await prisma.$queryRaw<
    SelectLimitRow[]
  >`
    SELECT
      user_id,
      used_count,
      reset_at
    FROM select_limits
    WHERE user_id = ${numericUserId}
    LIMIT 1
  `;

  if (existingRows.length === 0) {
    const resetAt = getStartOfTomorrow();

    await prisma.$executeRaw`
      INSERT INTO select_limits (
        user_id,
        used_count,
        reset_at
      )
      VALUES (
        ${numericUserId},
        0,
        ${resetAt}
      )
    `;

    return {
      isPremium: false,
      usedCount: 0,
      remaining: FREE_DAILY_SELECT_LIMIT,
      dailyLimit: FREE_DAILY_SELECT_LIMIT,
      resetAt,
    };
  }

  const limit = existingRows[0];

  const now = new Date();

  if (
    limit.reset_at === null ||
    limit.reset_at <= now
  ) {
    const resetAt = getStartOfTomorrow();

    await prisma.$executeRaw`
      UPDATE select_limits
      SET
        used_count = 0,
        reset_at = ${resetAt}
      WHERE user_id = ${numericUserId}
    `;

    return {
      isPremium: false,
      usedCount: 0,
      remaining: FREE_DAILY_SELECT_LIMIT,
      dailyLimit: FREE_DAILY_SELECT_LIMIT,
      resetAt,
    };
  }

  const usedCount = Number(limit.used_count);

  return {
    isPremium: false,
    usedCount,
    remaining: Math.max(
      FREE_DAILY_SELECT_LIMIT - usedCount,
      0
    ),
    dailyLimit: FREE_DAILY_SELECT_LIMIT,
    resetAt: limit.reset_at,
  };
};

const consumeSelect = async (
  userId: bigint
): Promise<{
  isPremium: boolean;
  usedCount: number;
  remaining: number | null;
  dailyLimit: number | null;
  resetAt: Date | null;
}> => {
  const premium = await hasActiveSubscription(userId);

  if (premium) {
    return {
      isPremium: true,
      usedCount: 0,
      remaining: null,
      dailyLimit: null,
      resetAt: null,
    };
  }

  const existingRows = await prisma.$queryRaw<
    SelectLimitRow[]
  >`
    SELECT
      user_id,
      used_count,
      reset_at
    FROM select_limits
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  const now = new Date();

  if (existingRows.length === 0) {
    const resetAt = getStartOfTomorrow();

    await prisma.$executeRaw`
      INSERT INTO select_limits (
        user_id,
        used_count,
        reset_at
      )
      VALUES (
        ${userId},
        1,
        ${resetAt}
      )
    `;

    return {
      isPremium: false,
      usedCount: 1,
      remaining: FREE_DAILY_SELECT_LIMIT - 1,
      dailyLimit: FREE_DAILY_SELECT_LIMIT,
      resetAt,
    };
  }

  const limit = existingRows[0];

  if (
    limit.reset_at === null ||
    limit.reset_at <= now
  ) {
    const resetAt = getStartOfTomorrow();

    await prisma.$executeRaw`
      UPDATE select_limits
      SET
        used_count = 1,
        reset_at = ${resetAt}
      WHERE user_id = ${userId}
    `;

    return {
      isPremium: false,
      usedCount: 1,
      remaining: FREE_DAILY_SELECT_LIMIT - 1,
      dailyLimit: FREE_DAILY_SELECT_LIMIT,
      resetAt,
    };
  }

  const usedCount = Number(limit.used_count);

  if (usedCount >= FREE_DAILY_SELECT_LIMIT) {
    throw new Error(
      "Daily select limit reached. Please upgrade your plan or try again tomorrow."
    );
  }

  const newUsedCount = usedCount + 1;

  await prisma.$executeRaw`
    UPDATE select_limits
    SET used_count = ${newUsedCount}
    WHERE user_id = ${userId}
  `;

  return {
    isPremium: false,
    usedCount: newUsedCount,
    remaining:
      FREE_DAILY_SELECT_LIMIT - newUsedCount,
    dailyLimit: FREE_DAILY_SELECT_LIMIT,
    resetAt: limit.reset_at,
  };
};

const checkTargetUser = async (
  targetUserId: bigint
): Promise<void> => {
  const users = await prisma.$queryRaw<
    UserStatusRow[]
  >`
    SELECT
      id,
      is_active,
      is_banned
    FROM users
    WHERE id = ${targetUserId}
    LIMIT 1
  `;

  if (users.length === 0) {
    throw new Error("User not found");
  }

  const user = users[0];

  if (!Boolean(user.is_active)) {
    throw new Error("This user is no longer active");
  }

  if (Boolean(user.is_banned)) {
    throw new Error("This user is unavailable");
  }

  const profiles = await prisma.$queryRaw<
    ProfileRow[]
  >`
    SELECT
      user_id,
      is_profile_complete
    FROM profiles
    WHERE user_id = ${targetUserId}
    LIMIT 1
  `;

  if (
    profiles.length === 0 ||
    !Boolean(profiles[0].is_profile_complete)
  ) {
    throw new Error(
      "This user's profile is not complete"
    );
  }
};

const checkBlockStatus = async (
  userId: bigint,
  targetUserId: bigint
): Promise<void> => {
  const blockedRows = await prisma.$queryRaw<
    { blocker_id: number | bigint }[]
  >`
    SELECT blocker_id
    FROM blocks
    WHERE
      (
        blocker_id = ${userId}
        AND blocked_id = ${targetUserId}
      )
      OR
      (
        blocker_id = ${targetUserId}
        AND blocked_id = ${userId}
      )
    LIMIT 1
  `;

  if (blockedRows.length > 0) {
    throw new Error(
      "You cannot interact with this user"
    );
  }
};

const getOrCreateMatch = async (
  userId: bigint,
  targetUserId: bigint
) => {
  const user1Id =
    userId < targetUserId
      ? userId
      : targetUserId;

  const user2Id =
    userId < targetUserId
      ? targetUserId
      : userId;

  const existingMatches =
    await prisma.$queryRaw<MatchRow[]>`
      SELECT
        id,
        user1_id,
        user2_id,
        matched_at,
        is_active
      FROM matches
      WHERE
        user1_id = ${user1Id}
        AND user2_id = ${user2Id}
      LIMIT 1
    `;

  if (existingMatches.length > 0) {
    const existingMatch = existingMatches[0];

    return {
      isMatch: true,
      isNewMatch: false,
      match: {
        id: Number(existingMatch.id),
        user1Id: Number(existingMatch.user1_id),
        user2Id: Number(existingMatch.user2_id),
        matchedAt: existingMatch.matched_at,
        isActive: Boolean(
          existingMatch.is_active
        ),
      },
    };
  }

  await prisma.$executeRaw`
    INSERT INTO matches (
      user1_id,
      user2_id,
      matched_at,
      is_active
    )
    VALUES (
      ${user1Id},
      ${user2Id},
      NOW(),
      TRUE
    )
  `;

  const createdMatches =
    await prisma.$queryRaw<MatchRow[]>`
      SELECT
        id,
        user1_id,
        user2_id,
        matched_at,
        is_active
      FROM matches
      WHERE
        user1_id = ${user1Id}
        AND user2_id = ${user2Id}
      ORDER BY id DESC
      LIMIT 1
    `;

  if (createdMatches.length === 0) {
    throw new Error("Unable to create match");
  }

  const createdMatch = createdMatches[0];

  const match = {
    id: Number(createdMatch.id),
    user1Id: Number(createdMatch.user1_id),
    user2Id: Number(createdMatch.user2_id),
    matchedAt: createdMatch.matched_at,
    isActive: Boolean(
      createdMatch.is_active
    ),
  };

  await Promise.all([
    createNotification({
      userId: Number(user1Id),
      type: "new_match",
      title: "It's a match! 🎉",
      message: "You have a new match on Nexora.",
      referenceId: match.id,
    }),
    createNotification({
      userId: Number(user2Id),
      type: "new_match",
      title: "It's a match! 🎉",
      message: "You have a new match on Nexora.",
      referenceId: match.id,
    }),
  ]);

  return {
    isMatch: true,
    isNewMatch: true,
    match,
  };
};

export const swipeOnUser = async (
  userId: string,
  targetUserId: string,
  actionInput: unknown
) => {
  const numericUserId = parseUserId(userId);

  const numericTargetUserId =
    parseTargetUserId(targetUserId);

  if (
    numericUserId === numericTargetUserId
  ) {
    throw new Error(
      "You cannot swipe on yourself"
    );
  }

  const action =
    normalizeAction(actionInput);

  await checkTargetUser(
    numericTargetUserId
  );

  await checkBlockStatus(
    numericUserId,
    numericTargetUserId
  );

  const existingSwipes =
    await prisma.$queryRaw<
      ExistingSwipeRow[]
    >`
      SELECT
        id,
        action
      FROM swipes
      WHERE
        from_user_id = ${numericUserId}
        AND to_user_id = ${numericTargetUserId}
      LIMIT 1
    `;

  if (existingSwipes.length > 0) {
    throw new Error(
      "You have already swiped on this user"
    );
  }

  const selectLimit =
    await consumeSelect(
      numericUserId
    );

  await prisma.$executeRaw`
    INSERT INTO swipes (
      from_user_id,
      to_user_id,
      action
    )
    VALUES (
      ${numericUserId},
      ${numericTargetUserId},
      ${action}
    )
  `;

  let isMatch = false;
  let match = null;

  if (
    action === "like" ||
    action === "superlike"
  ) {
    const mutualSwipes =
      await prisma.$queryRaw<
        MutualSwipeRow[]
      >`
        SELECT
          id,
          action
        FROM swipes
        WHERE
          from_user_id = ${numericTargetUserId}
          AND to_user_id = ${numericUserId}
          AND action IN ('like', 'superlike')
        LIMIT 1
      `;

    if (mutualSwipes.length > 0) {
      const matchResult =
        await getOrCreateMatch(
          numericUserId,
          numericTargetUserId
        );

      isMatch = matchResult.isMatch;
      match = matchResult.match;
    }
  }

  return {
    action,
    targetUserId:
      Number(numericTargetUserId),
    isMatch,
    match,
    selectLimit,
  };
};