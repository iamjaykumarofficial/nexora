import prisma from "../config/prisma";

interface DiscoverRow {
  user_id: number | bigint;
  full_name: string;
  date_of_birth: string | Date;
  gender: string;
  looking_for: string;
  relationship_goal: string | null;
  bio: string | null;
  height_cm: number | null;
  city: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  is_verified: number | boolean;
  photo_url: string | null;
  interests: string | null;
}

interface DiscoverFilters {
  gender?: string;
  city?: string;
  relationshipGoal?: string;
  minAge?: number;
  maxAge?: number;
  maxDistanceKm?: number;
  limit?: number;
  offset?: number;
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

const calculateAge = (dateOfBirth: string | Date): number => {
  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const monthDifference = today.getMonth() - dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
};

const parseOptionalInteger = (
  value: unknown,
  fieldName: string,
  min: number,
  max: number
): number | undefined => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < min ||
    parsed > max
  ) {
    throw new Error(
      `${fieldName} must be an integer between ${min} and ${max}`
    );
  }

  return parsed;
};

const parseOptionalNumber = (
  value: unknown,
  fieldName: string,
  min: number,
  max: number
): number | undefined => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const parsed = Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < min ||
    parsed > max
  ) {
    throw new Error(
      `${fieldName} must be between ${min} and ${max}`
    );
  }

  return parsed;
};

const escapeSqlString = (value: string): string => {
  return value.replace(/'/g, "''");
};

export const getDiscoverProfiles = async (
  userId: string,
  filters: DiscoverFilters = {}
) => {
  const numericUserId = parseUserId(userId);

  /*
   * -------------------------------------------------------
   * 1. Get current user's profile
   * -------------------------------------------------------
   */

  const currentUser = await prisma.$queryRaw<
    {
      user_id: number | bigint;
      gender: string;
      looking_for: string;
      latitude: number | string | null;
      longitude: number | string | null;
    }[]
  >`
    SELECT
      p.user_id,
      p.gender,
      p.looking_for,
      p.latitude,
      p.longitude
    FROM profiles p
    INNER JOIN users u
      ON u.id = p.user_id
    WHERE
      p.user_id = ${numericUserId}
      AND u.is_active = TRUE
      AND u.is_banned = FALSE
    LIMIT 1
  `;

  if (currentUser.length === 0) {
    throw new Error(
      "Please complete your profile before discovering people"
    );
  }

  const current = currentUser[0];

  /*
   * -------------------------------------------------------
   * 2. Parse filters
   * -------------------------------------------------------
   */

  const requestedGender =
    typeof filters.gender === "string"
      ? filters.gender.trim().toLowerCase()
      : undefined;

  const requestedCity =
    typeof filters.city === "string"
      ? filters.city.trim()
      : undefined;

  const requestedGoal =
    typeof filters.relationshipGoal === "string"
      ? filters.relationshipGoal.trim().toLowerCase()
      : undefined;

  const minAge = parseOptionalInteger(
    filters.minAge,
    "minAge",
    18,
    100
  );

  const maxAge = parseOptionalInteger(
    filters.maxAge,
    "maxAge",
    18,
    100
  );

  if (
    minAge !== undefined &&
    maxAge !== undefined &&
    minAge > maxAge
  ) {
    throw new Error("minAge cannot be greater than maxAge");
  }

  const maxDistanceKm = parseOptionalNumber(
    filters.maxDistanceKm,
    "maxDistanceKm",
    1,
    500
  );

  const limit =
    parseOptionalInteger(
      filters.limit,
      "limit",
      1,
      50
    ) ?? 10;

  const offset =
    parseOptionalInteger(
      filters.offset,
      "offset",
      0,
      10000
    ) ?? 0;

  /*
   * -------------------------------------------------------
   * 3. Candidate gender
   * -------------------------------------------------------
   */

  const genderCondition =
    requestedGender ||
    (current.looking_for === "men"
      ? "man"
      : current.looking_for === "women"
        ? "woman"
        : null);

  /*
   * -------------------------------------------------------
   * 4. Build dynamic SQL conditions
   * -------------------------------------------------------
   */

  const candidateGenderSql = genderCondition
    ? `
        AND p.gender = '${escapeSqlString(genderCondition)}'
      `
    : "";

  /*
   * Mutual preference:
   *
   * Current user = man
   * Candidate must be looking for men/everyone
   *
   * Current user = woman
   * Candidate must be looking for women/everyone
   */

  const candidateLookingForSql =
    current.gender === "man"
      ? `
          AND p.looking_for IN ('men', 'everyone')
        `
      : current.gender === "woman"
        ? `
            AND p.looking_for IN ('women', 'everyone')
          `
        : `
            AND p.looking_for = 'everyone'
          `;

  const citySql = requestedCity
    ? `
        AND LOWER(p.city) = LOWER('${escapeSqlString(
          requestedCity
        )}')
      `
    : "";

  const goalSql = requestedGoal
    ? `
        AND p.relationship_goal = '${escapeSqlString(
          requestedGoal
        )}'
      `
    : "";

  const ageSql =
    minAge !== undefined || maxAge !== undefined
      ? `
          AND TIMESTAMPDIFF(
            YEAR,
            p.date_of_birth,
            CURDATE()
          ) BETWEEN
            ${minAge ?? 18}
            AND
            ${maxAge ?? 100}
        `
      : "";

  /*
   * -------------------------------------------------------
   * 5. Distance filter
   * -------------------------------------------------------
   */

  let distanceSql = "";

  const hasCurrentLocation =
    current.latitude !== null &&
    current.longitude !== null;

  if (maxDistanceKm !== undefined) {
    if (!hasCurrentLocation) {
      throw new Error(
        "Location is required to use the distance filter"
      );
    }

    const latitude = Number(current.latitude);
    const longitude = Number(current.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new Error(
        "Current location coordinates are invalid"
      );
    }

    distanceSql = `
      AND p.latitude IS NOT NULL
      AND p.longitude IS NOT NULL
      AND (
        6371 * ACOS(
          LEAST(
            1,
            GREATEST(
              -1,
              COS(RADIANS(${latitude}))
              * COS(RADIANS(p.latitude))
              * COS(
                  RADIANS(p.longitude) -
                  RADIANS(${longitude})
                )
              + SIN(RADIANS(${latitude}))
              * SIN(RADIANS(p.latitude))
            )
          )
        )
      ) <= ${maxDistanceKm}
    `;
  }

  /*
   * -------------------------------------------------------
   * 6. Discover query
   * -------------------------------------------------------
   *
   * Important:
   * We intentionally use validated numeric values directly
   * instead of ? placeholders for userId / LIMIT / OFFSET.
   *
   * This avoids the runtime issue we were seeing with the
   * MariaDB Prisma adapter and the previous unsafe query.
   */

  const rows = await prisma.$queryRawUnsafe<DiscoverRow[]>(
    `
      SELECT
        p.user_id,
        p.full_name,
        p.date_of_birth,
        p.gender,
        p.looking_for,
        p.relationship_goal,
        p.bio,
        p.height_cm,
        p.city,
        p.latitude,
        p.longitude,
        p.is_verified,

        (
          SELECT ph.url
          FROM photos ph
          WHERE ph.user_id = p.user_id
          ORDER BY
            ph.position ASC,
            ph.id ASC
          LIMIT 1
        ) AS photo_url,

        (
          SELECT GROUP_CONCAT(
            DISTINCT i.name
            ORDER BY i.name ASC
            SEPARATOR ','
          )
          FROM user_interests ui
          INNER JOIN interests i
            ON i.id = ui.interest_id
          WHERE ui.user_id = p.user_id
        ) AS interests

      FROM profiles p

      INNER JOIN users u
        ON u.id = p.user_id

      WHERE
        p.user_id <> ${numericUserId.toString()}

        AND u.is_active = TRUE

        AND u.is_banned = FALSE

        AND p.is_profile_complete = TRUE

        ${candidateGenderSql}

        ${candidateLookingForSql}

        ${citySql}

        ${goalSql}

        ${ageSql}

        ${distanceSql}

        /*
         * Do not show users already swiped by current user.
         */
        AND NOT EXISTS (
          SELECT 1
          FROM swipes s
          WHERE
            s.from_user_id = ${numericUserId.toString()}
            AND s.to_user_id = p.user_id
        )

        /*
         * Do not show blocked users in either direction.
         */
        AND NOT EXISTS (
          SELECT 1
          FROM blocks b
          WHERE
            (
              b.blocker_id = ${numericUserId.toString()}
              AND b.blocked_id = p.user_id
            )
            OR
            (
              b.blocker_id = p.user_id
              AND b.blocked_id = ${numericUserId.toString()}
            )
        )

      ORDER BY
        CASE
          WHEN p.is_verified = TRUE THEN 0
          ELSE 1
        END,

        p.updated_at DESC,

        p.user_id DESC

      LIMIT ${limit}
      OFFSET ${offset}
    `
  );

  /*
   * -------------------------------------------------------
   * 7. Format response
   * -------------------------------------------------------
   */

  return rows.map((profile) => ({
    userId: Number(profile.user_id),

    fullName: profile.full_name,

    age: calculateAge(profile.date_of_birth),

    gender: profile.gender,

    lookingFor: profile.looking_for,

    relationshipGoal: profile.relationship_goal,

    bio: profile.bio,

    heightCm: profile.height_cm,

    city: profile.city,

    isVerified: Boolean(profile.is_verified),

    photoUrl: profile.photo_url,

    interests: profile.interests
      ? profile.interests.split(",")
      : [],

    distanceKm:
      maxDistanceKm !== undefined &&
      hasCurrentLocation &&
      profile.latitude !== null &&
      profile.longitude !== null
        ? Number(
            (
              6371 *
              Math.acos(
                Math.min(
                  1,
                  Math.max(
                    -1,
                    Math.cos(
                      (Number(current.latitude) *
                        Math.PI) /
                        180
                    ) *
                      Math.cos(
                        (Number(profile.latitude) *
                          Math.PI) /
                          180
                      ) *
                      Math.cos(
                        ((Number(profile.longitude) -
                          Number(current.longitude)) *
                          Math.PI) /
                          180
                      ) +
                      Math.sin(
                        (Number(current.latitude) *
                          Math.PI) /
                          180
                      ) *
                        Math.sin(
                          (Number(profile.latitude) *
                            Math.PI) /
                            180
                        )
                  )
                )
              )
            ).toFixed(1)
          )
        : null,
  }));
};