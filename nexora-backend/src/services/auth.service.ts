import prisma from "../config/prisma";
import { generateToken } from "../utils/jwt";
import { generateOtp, getOtpExpiryDate } from "../utils/otp";

interface UserRecord {
  id: bigint;
  phone: string | null;
  email: string | null;
  google_id: string | null;
  apple_id: string | null;
  is_phone_verified: boolean;
  is_active: boolean;
  is_banned: boolean;
  last_active_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface OtpRecord {
  id: bigint;
  phone: string;
  code: string;
  expires_at: Date;
  is_used: boolean;
  created_at: Date;
}

export const sendOtp = async (phone: string) => {
  const normalizedPhone = phone.trim();

  if (!normalizedPhone) {
    throw new Error("Phone number is required");
  }

  if (!/^[0-9+\-\s()]{7,20}$/.test(normalizedPhone)) {
    throw new Error("Please enter a valid phone number");
  }

  await prisma.$executeRaw`
    UPDATE otps
    SET is_used = TRUE
    WHERE phone = ${normalizedPhone}
      AND is_used = FALSE
  `;

  const code = generateOtp();
  const expiresAt = getOtpExpiryDate();

  await prisma.$executeRaw`
    INSERT INTO otps (
      phone,
      code,
      expires_at,
      is_used
    )
    VALUES (
      ${normalizedPhone},
      ${code},
      ${expiresAt},
      FALSE
    )
  `;

  const response: {
    phone: string;
    expiresInMinutes: number;
    otp?: string;
  } = {
    phone: normalizedPhone,
    expiresInMinutes: Number(
      process.env.OTP_EXPIRES_IN_MINUTES || 5
    ),
  };

  if (process.env.NODE_ENV !== "production") {
    response.otp = code;
  }

  return response;
};

export const verifyOtp = async (
  phone: string,
  code: string
) => {
  const normalizedPhone = phone.trim();
  const normalizedCode = code.trim();

  if (!normalizedPhone) {
    throw new Error("Phone number is required");
  }

  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new Error("OTP must be a 6-digit number");
  }

  const otpRecords = await prisma.$queryRaw<OtpRecord[]>`
    SELECT
      id,
      phone,
      code,
      expires_at,
      is_used,
      created_at
    FROM otps
    WHERE phone = ${normalizedPhone}
    ORDER BY id DESC
    LIMIT 1
  `;

  if (otpRecords.length === 0) {
    throw new Error("OTP not found. Please request a new OTP");
  }

  const otp = otpRecords[0];

  if (otp.is_used) {
    throw new Error("OTP has already been used");
  }

  if (new Date(otp.expires_at).getTime() < Date.now()) {
    throw new Error("OTP has expired. Please request a new OTP");
  }

  if (otp.code !== normalizedCode) {
    throw new Error("Invalid OTP");
  }

  await prisma.$executeRaw`
    UPDATE otps
    SET is_used = TRUE
    WHERE id = ${otp.id}
  `;

  const existingUsers = await prisma.$queryRaw<UserRecord[]>`
    SELECT
      id,
      phone,
      email,
      google_id,
      apple_id,
      is_phone_verified,
      is_active,
      is_banned,
      last_active_at,
      created_at,
      updated_at
    FROM users
    WHERE phone = ${normalizedPhone}
    LIMIT 1
  `;

  let user: UserRecord;

  if (existingUsers.length === 0) {
    await prisma.$executeRaw`
      INSERT INTO users (
        phone,
        is_phone_verified,
        is_active,
        is_banned,
        last_active_at
      )
      VALUES (
        ${normalizedPhone},
        TRUE,
        TRUE,
        FALSE,
        NOW()
      )
    `;

    const createdUsers = await prisma.$queryRaw<UserRecord[]>`
      SELECT
        id,
        phone,
        email,
        google_id,
        apple_id,
        is_phone_verified,
        is_active,
        is_banned,
        last_active_at,
        created_at,
        updated_at
      FROM users
      WHERE phone = ${normalizedPhone}
      LIMIT 1
    `;

    if (createdUsers.length === 0) {
      throw new Error("Unable to create user");
    }

    user = createdUsers[0];
  } else {
    user = existingUsers[0];

    if (user.is_banned) {
      throw new Error("Your account has been banned");
    }

    if (!user.is_active) {
      throw new Error("Your account is inactive");
    }

    await prisma.$executeRaw`
      UPDATE users
      SET
        is_phone_verified = TRUE,
        last_active_at = NOW()
      WHERE id = ${user.id}
    `;

    const updatedUsers = await prisma.$queryRaw<UserRecord[]>`
      SELECT
        id,
        phone,
        email,
        google_id,
        apple_id,
        is_phone_verified,
        is_active,
        is_banned,
        last_active_at,
        created_at,
        updated_at
      FROM users
      WHERE id = ${user.id}
      LIMIT 1
    `;

    if (updatedUsers.length === 0) {
      throw new Error("User not found");
    }

    user = updatedUsers[0];
  }

  const token = generateToken(user.id.toString());

  return {
    token,
    user: {
      id: user.id.toString(),
      phone: user.phone,
      email: user.email,
      googleId: user.google_id,
      appleId: user.apple_id,
      isPhoneVerified: user.is_phone_verified,
      isActive: user.is_active,
      isBanned: user.is_banned,
      lastActiveAt: user.last_active_at,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
  };
};

export const getCurrentUser = async (userId: string) => {
  let numericUserId: bigint;

  try {
    numericUserId = BigInt(userId);
  } catch {
    throw new Error("Invalid user ID");
  }

  const users = await prisma.$queryRaw<UserRecord[]>`
    SELECT
      id,
      phone,
      email,
      google_id,
      apple_id,
      is_phone_verified,
      is_active,
      is_banned,
      last_active_at,
      created_at,
      updated_at
    FROM users
    WHERE id = ${numericUserId}
    LIMIT 1
  `;

  if (users.length === 0) {
    throw new Error("User not found");
  }

  const user = users[0];

  if (user.is_banned) {
    throw new Error("Your account has been banned");
  }

  if (!user.is_active) {
    throw new Error("Your account is inactive");
  }

  await prisma.$executeRaw`
    UPDATE users
    SET last_active_at = NOW()
    WHERE id = ${user.id}
  `;

  return {
    id: user.id.toString(),
    phone: user.phone,
    email: user.email,
    googleId: user.google_id,
    appleId: user.apple_id,
    isPhoneVerified: user.is_phone_verified,
    isActive: user.is_active,
    isBanned: user.is_banned,
    lastActiveAt: user.last_active_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};