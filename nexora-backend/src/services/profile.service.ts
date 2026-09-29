import prisma from "../config/prisma";

interface ProfileRecord {
  user_id: bigint;
  full_name: string;
  date_of_birth: Date;
  gender: "man" | "woman" | "non_binary";
  looking_for: "men" | "women" | "everyone";
  relationship_goal:
    | "long_term"
    | "short_term"
    | "figuring_out"
    | "friendship"
    | null;
  bio: string | null;
  height_cm: number | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  is_verified: number | boolean;
  is_profile_complete: number | boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProfileInput {
  fullName: string;
  dateOfBirth: string;
  gender: "man" | "woman" | "non_binary";
  lookingFor: "men" | "women" | "everyone";
  relationshipGoal?:
    | "long_term"
    | "short_term"
    | "figuring_out"
    | "friendship";
  bio?: string | null;
  heightCm?: number | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

const formatProfile = (profile: ProfileRecord) => {
  return {
    userId: profile.user_id.toString(),
    fullName: profile.full_name,
    dateOfBirth: profile.date_of_birth,
    gender: profile.gender,
    lookingFor: profile.looking_for,
    relationshipGoal: profile.relationship_goal,
    bio: profile.bio,
    heightCm: profile.height_cm,
    city: profile.city,
    latitude: profile.latitude,
    longitude: profile.longitude,
    isVerified: Boolean(profile.is_verified),
    isProfileComplete: Boolean(profile.is_profile_complete),
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
};

const parseUserId = (userId: string): bigint => {
  try {
    return BigInt(userId);
  } catch {
    throw new Error("Invalid user ID");
  }
};

const validateDateOfBirth = (dateOfBirth: string): Date => {
  const date = new Date(`${dateOfBirth}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date of birth");
  }

  if (date > new Date()) {
    throw new Error("Date of birth cannot be in the future");
  }

  return date;
};

const validateCreateInput = (input: CreateProfileInput): void => {
  if (!input.fullName?.trim()) {
    throw new Error("Full name is required");
  }

  if (input.fullName.trim().length > 100) {
    throw new Error("Full name cannot exceed 100 characters");
  }

  if (!input.dateOfBirth) {
    throw new Error("Date of birth is required");
  }

  validateDateOfBirth(input.dateOfBirth);

  const validGenders = ["man", "woman", "non_binary"];

  if (!validGenders.includes(input.gender)) {
    throw new Error("Invalid gender");
  }

  const validLookingFor = ["men", "women", "everyone"];

  if (!validLookingFor.includes(input.lookingFor)) {
    throw new Error("Invalid lookingFor value");
  }

  const validRelationshipGoals = [
    "long_term",
    "short_term",
    "figuring_out",
    "friendship",
  ];

  if (
    input.relationshipGoal &&
    !validRelationshipGoals.includes(input.relationshipGoal)
  ) {
    throw new Error("Invalid relationshipGoal value");
  }

  if (input.bio && input.bio.length > 500) {
    throw new Error("Bio cannot exceed 500 characters");
  }

  if (
    input.heightCm !== undefined &&
    input.heightCm !== null &&
    (!Number.isInteger(input.heightCm) ||
      input.heightCm <= 0 ||
      input.heightCm > 300)
  ) {
    throw new Error("Invalid height");
  }

  if (input.city && input.city.length > 100) {
    throw new Error("City cannot exceed 100 characters");
  }

  if (
    input.latitude !== undefined &&
    input.latitude !== null &&
    (input.latitude < -90 || input.latitude > 90)
  ) {
    throw new Error("Invalid latitude");
  }

  if (
    input.longitude !== undefined &&
    input.longitude !== null &&
    (input.longitude < -180 || input.longitude > 180)
  ) {
    throw new Error("Invalid longitude");
  }
};

/**
 * Recalculates profile completion.
 *
 * Completion requires:
 * 1. Profile exists
 * 2. At least one interest
 * 3. At least one photo
 *
 * The basic profile fields are already mandatory at database level:
 * full_name, date_of_birth, gender and looking_for.
 */
export const refreshProfileCompletion = async (
  userId: string
): Promise<boolean> => {
  const numericUserId = parseUserId(userId);

  const profiles = await prisma.$queryRaw<
    {
      user_id: bigint;
      full_name: string;
      date_of_birth: Date;
      gender: string;
      looking_for: string;
    }[]
  >`
    SELECT
      user_id,
      full_name,
      date_of_birth,
      gender,
      looking_for
    FROM profiles
    WHERE user_id = ${numericUserId}
    LIMIT 1
  `;

  if (profiles.length === 0) {
    throw new Error("Profile not found");
  }

  const interestCountRows = await prisma.$queryRaw<
    { total: bigint | number }[]
  >`
    SELECT COUNT(*) AS total
    FROM user_interests
    WHERE user_id = ${numericUserId}
  `;

  const photoCountRows = await prisma.$queryRaw<
    { total: bigint | number }[]
  >`
    SELECT COUNT(*) AS total
    FROM photos
    WHERE user_id = ${numericUserId}
  `;

  const interestCount = Number(interestCountRows[0]?.total ?? 0);
  const photoCount = Number(photoCountRows[0]?.total ?? 0);

  const hasBasicProfile =
    Boolean(profiles[0].full_name?.trim()) &&
    Boolean(profiles[0].date_of_birth) &&
    Boolean(profiles[0].gender) &&
    Boolean(profiles[0].looking_for);

  const isComplete =
    hasBasicProfile &&
    interestCount >= 1 &&
    photoCount >= 1;

  await prisma.$executeRaw`
    UPDATE profiles
    SET is_profile_complete = ${isComplete}
    WHERE user_id = ${numericUserId}
  `;

  return isComplete;
};

export const createProfile = async (
  userId: string,
  input: CreateProfileInput
) => {
  const numericUserId = parseUserId(userId);

  validateCreateInput(input);

  const existingProfiles = await prisma.$queryRaw<ProfileRecord[]>`
    SELECT
      user_id,
      full_name,
      date_of_birth,
      gender,
      looking_for,
      relationship_goal,
      bio,
      height_cm,
      city,
      latitude,
      longitude,
      is_verified,
      is_profile_complete,
      created_at,
      updated_at
    FROM profiles
    WHERE user_id = ${numericUserId}
    LIMIT 1
  `;

  if (existingProfiles.length > 0) {
    throw new Error("Profile already exists");
  }

  const dateOfBirth = validateDateOfBirth(input.dateOfBirth);

  await prisma.$executeRaw`
    INSERT INTO profiles (
      user_id,
      full_name,
      date_of_birth,
      gender,
      looking_for,
      relationship_goal,
      bio,
      height_cm,
      city,
      latitude,
      longitude,
      is_verified,
      is_profile_complete
    )
    VALUES (
      ${numericUserId},
      ${input.fullName.trim()},
      ${dateOfBirth},
      ${input.gender},
      ${input.lookingFor},
      ${input.relationshipGoal ?? null},
      ${input.bio?.trim() || null},
      ${input.heightCm ?? null},
      ${input.city?.trim() || null},
      ${input.latitude ?? null},
      ${input.longitude ?? null},
      FALSE,
      FALSE
    )
  `;

  // Recalculate immediately.
  // It will normally remain false here because interests/photos
  // are added through separate APIs.
  await refreshProfileCompletion(userId);

  const profiles = await prisma.$queryRaw<ProfileRecord[]>`
    SELECT
      user_id,
      full_name,
      date_of_birth,
      gender,
      looking_for,
      relationship_goal,
      bio,
      height_cm,
      city,
      latitude,
      longitude,
      is_verified,
      is_profile_complete,
      created_at,
      updated_at
    FROM profiles
    WHERE user_id = ${numericUserId}
    LIMIT 1
  `;

  if (profiles.length === 0) {
    throw new Error("Unable to create profile");
  }

  return formatProfile(profiles[0]);
};

export const getMyProfile = async (userId: string) => {
  const numericUserId = parseUserId(userId);

  // Always recalculate before returning the profile.
  // This also fixes existing users whose completion flag is stale.
  await refreshProfileCompletion(userId);

  const profiles = await prisma.$queryRaw<ProfileRecord[]>`
    SELECT
      user_id,
      full_name,
      date_of_birth,
      gender,
      looking_for,
      relationship_goal,
      bio,
      height_cm,
      city,
      latitude,
      longitude,
      is_verified,
      is_profile_complete,
      created_at,
      updated_at
    FROM profiles
    WHERE user_id = ${numericUserId}
    LIMIT 1
  `;

  if (profiles.length === 0) {
    throw new Error("Profile not found");
  }

  return formatProfile(profiles[0]);
};

export const updateMyProfile = async (
  userId: string,
  input: Partial<CreateProfileInput>
) => {
  const numericUserId = parseUserId(userId);

  if (input.fullName !== undefined) {
    if (!input.fullName.trim()) {
      throw new Error("Full name cannot be empty");
    }

    if (input.fullName.trim().length > 100) {
      throw new Error("Full name cannot exceed 100 characters");
    }
  }

  if (input.dateOfBirth !== undefined) {
    validateDateOfBirth(input.dateOfBirth);
  }

  if (input.gender !== undefined) {
    if (!["man", "woman", "non_binary"].includes(input.gender)) {
      throw new Error("Invalid gender");
    }
  }

  if (input.lookingFor !== undefined) {
    if (!["men", "women", "everyone"].includes(input.lookingFor)) {
      throw new Error("Invalid lookingFor value");
    }
  }

  if (input.relationshipGoal !== undefined) {
    if (
      ![
        "long_term",
        "short_term",
        "figuring_out",
        "friendship",
      ].includes(input.relationshipGoal)
    ) {
      throw new Error("Invalid relationshipGoal value");
    }
  }

  if (input.bio !== undefined && input.bio !== null) {
    if (input.bio.length > 500) {
      throw new Error("Bio cannot exceed 500 characters");
    }
  }

  if (input.heightCm !== undefined && input.heightCm !== null) {
    if (
      !Number.isInteger(input.heightCm) ||
      input.heightCm <= 0 ||
      input.heightCm > 300
    ) {
      throw new Error("Invalid height");
    }
  }

  if (input.city !== undefined && input.city !== null) {
    if (input.city.length > 100) {
      throw new Error("City cannot exceed 100 characters");
    }
  }

  if (input.latitude !== undefined && input.latitude !== null) {
    if (input.latitude < -90 || input.latitude > 90) {
      throw new Error("Invalid latitude");
    }
  }

  if (input.longitude !== undefined && input.longitude !== null) {
    if (input.longitude < -180 || input.longitude > 180) {
      throw new Error("Invalid longitude");
    }
  }

  const existingProfiles = await prisma.$queryRaw<ProfileRecord[]>`
    SELECT
      user_id,
      full_name,
      date_of_birth,
      gender,
      looking_for,
      relationship_goal,
      bio,
      height_cm,
      city,
      latitude,
      longitude,
      is_verified,
      is_profile_complete,
      created_at,
      updated_at
    FROM profiles
    WHERE user_id = ${numericUserId}
    LIMIT 1
  `;

  if (existingProfiles.length === 0) {
    throw new Error("Profile not found");
  }

  const current = existingProfiles[0];

  const fullName =
    input.fullName !== undefined
      ? input.fullName.trim()
      : current.full_name;

  const dateOfBirth =
    input.dateOfBirth !== undefined
      ? validateDateOfBirth(input.dateOfBirth)
      : current.date_of_birth;

  const gender =
    input.gender !== undefined
      ? input.gender
      : current.gender;

  const lookingFor =
    input.lookingFor !== undefined
      ? input.lookingFor
      : current.looking_for;

  const relationshipGoal =
    input.relationshipGoal !== undefined
      ? input.relationshipGoal
      : current.relationship_goal;

  const bio =
    input.bio !== undefined
      ? input.bio?.trim() || null
      : current.bio;

  const heightCm =
    input.heightCm !== undefined
      ? input.heightCm
      : current.height_cm;

  const city =
    input.city !== undefined
      ? input.city?.trim() || null
      : current.city;

  const latitude =
    input.latitude !== undefined
      ? input.latitude
      : current.latitude;

  const longitude =
    input.longitude !== undefined
      ? input.longitude
      : current.longitude;

  await prisma.$executeRaw`
    UPDATE profiles
    SET
      full_name = ${fullName},
      date_of_birth = ${dateOfBirth},
      gender = ${gender},
      looking_for = ${lookingFor},
      relationship_goal = ${relationshipGoal},
      bio = ${bio},
      height_cm = ${heightCm},
      city = ${city},
      latitude = ${latitude},
      longitude = ${longitude}
    WHERE user_id = ${numericUserId}
  `;

  // Recalculate completion after profile changes.
  await refreshProfileCompletion(userId);

  const updatedProfiles = await prisma.$queryRaw<ProfileRecord[]>`
    SELECT
      user_id,
      full_name,
      date_of_birth,
      gender,
      looking_for,
      relationship_goal,
      bio,
      height_cm,
      city,
      latitude,
      longitude,
      is_verified,
      is_profile_complete,
      created_at,
      updated_at
    FROM profiles
    WHERE user_id = ${numericUserId}
    LIMIT 1
  `;

  if (updatedProfiles.length === 0) {
    throw new Error("Unable to update profile");
  }

  return formatProfile(updatedProfiles[0]);
};