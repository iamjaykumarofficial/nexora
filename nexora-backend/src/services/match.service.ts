import prisma from "../config/prisma";

interface MatchRow {
  id: number | bigint;
  user1_id: number | bigint;
  user2_id: number | bigint;
  matched_at: Date;
  is_active: number | boolean;

  other_user_id: number | bigint;
  full_name: string;
  gender: string;
  city: string | null;
  relationship_goal: string | null;
  photo_url: string | null;
}

const parseUserId = (
  userId: string
): bigint => {
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

export const getMyMatches = async (
  userId: string
) => {
  const numericUserId =
    parseUserId(userId);

  const matches =
    await prisma.$queryRaw<MatchRow[]>`
      SELECT
        m.id,
        m.user1_id,
        m.user2_id,
        m.matched_at,
        m.is_active,

        CASE
          WHEN m.user1_id = ${numericUserId}
            THEN m.user2_id
          ELSE m.user1_id
        END AS other_user_id,

        p.full_name,
        p.gender,
        p.city,
        p.relationship_goal,

        (
          SELECT ph.url
          FROM photos ph
          WHERE ph.user_id =
            CASE
              WHEN m.user1_id = ${numericUserId}
                THEN m.user2_id
              ELSE m.user1_id
            END
          ORDER BY
            ph.position ASC,
            ph.id ASC
          LIMIT 1
        ) AS photo_url

      FROM matches m

      INNER JOIN profiles p
        ON p.user_id =
          CASE
            WHEN m.user1_id = ${numericUserId}
              THEN m.user2_id
            ELSE m.user1_id
          END

      WHERE
        (
          m.user1_id = ${numericUserId}
          OR m.user2_id = ${numericUserId}
        )
        AND m.is_active = TRUE

      ORDER BY
        m.matched_at DESC
    `;

  return matches.map(
    (match) => ({
      id: Number(match.id),

      userId: Number(
        match.other_user_id
      ),

      fullName:
        match.full_name,

      gender:
        match.gender,

      city:
        match.city,

      relationshipGoal:
        match.relationship_goal,

      photoUrl:
        match.photo_url,

      matchedAt:
        match.matched_at,

      isActive:
        Boolean(match.is_active),
    })
  );
};