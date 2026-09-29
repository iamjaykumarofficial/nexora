import jwt from "jsonwebtoken";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
};

export interface JwtPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(
    {
      userId,
    },
    getJwtSecret(),
    {
      expiresIn,
    } as jwt.SignOptions
  );
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, getJwtSecret());

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !("userId" in decoded)
  ) {
    throw new Error("Invalid authentication token");
  }

  const payload = decoded as jwt.JwtPayload & {
    userId?: unknown;
  };

  if (typeof payload.userId !== "string") {
    throw new Error("Invalid authentication token");
  }

  return {
    userId: payload.userId,
  };
};