import { Request, Response } from "express";

import {
  createProfile,
  getMyProfile,
  updateMyProfile,
} from "../services/profile.service";

export const createProfileController = async (
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

    const {
      fullName,
      dateOfBirth,
      gender,
      lookingFor,
      relationshipGoal,
      bio,
      heightCm,
      city,
      latitude,
      longitude,
    } = req.body;

    if (typeof fullName !== "string") {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    if (typeof dateOfBirth !== "string") {
      return res.status(400).json({
        success: false,
        message: "Date of birth is required",
      });
    }

    if (typeof gender !== "string") {
      return res.status(400).json({
        success: false,
        message: "Gender is required",
      });
    }

    if (typeof lookingFor !== "string") {
      return res.status(400).json({
        success: false,
        message: "Looking for is required",
      });
    }

    const profile = await createProfile(req.userId, {
      fullName,
      dateOfBirth,
      gender: gender as
        | "man"
        | "woman"
        | "non_binary",
      lookingFor: lookingFor as
        | "men"
        | "women"
        | "everyone",
      relationshipGoal,
      bio,
      heightCm,
      city,
      latitude,
      longitude,
    });

    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: {
        profile,
      },
    });
  } catch (error) {
    console.error("Create profile error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create profile",
    });
  }
};

export const getMyProfileController = async (
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

    const profile = await getMyProfile(req.userId);

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        profile,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to fetch profile",
    });
  }
};

export const updateMyProfileController = async (
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

    const profile = await updateMyProfile(
      req.userId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        profile,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update profile",
    });
  }
};