import { Request, Response } from "express";

import {
  getCurrentUser,
  sendOtp,
  verifyOtp,
} from "../services/auth.service";

export const sendOtpController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone } = req.body;

    if (typeof phone !== "string" || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const result = await sendOtp(phone.trim());

    return res.status(200).json({
      success: true,
      message: "OTP generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to send OTP",
    });
  }
};

export const verifyOtpController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone, otp } = req.body;

    if (typeof phone !== "string" || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (typeof otp !== "string" || !otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const result = await verifyOtp(
      phone.trim(),
      otp.trim()
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: result,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to verify OTP",
    });
  }
};

export const getMeController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await getCurrentUser(req.userId);

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to fetch user",
    });
  }
};

export const logoutController = async (
  _req: Request,
  res: Response
) => {
  return res.status(200).json({
    success: true,
    message:
      "Logged out successfully. Please remove the token from the client.",
  });
};