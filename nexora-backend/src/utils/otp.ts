import crypto from "crypto";

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const getOtpExpiryDate = (): Date => {
  const minutes = Number(process.env.OTP_EXPIRES_IN_MINUTES || 5);

  const expiry = new Date();

  expiry.setMinutes(expiry.getMinutes() + minutes);

  return expiry;
};