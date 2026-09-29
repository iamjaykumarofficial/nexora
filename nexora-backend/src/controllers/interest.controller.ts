import { Request, Response } from "express";

import {
  addMyInterests,
  getAllInterests,
  getMyInterests,
  removeMyInterest,
} from "../services/interest.service";

export const getAllInterestsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const interests = await getAllInterests();

    return res.status(200).json({
      success: true,
      message: "Interests fetched successfully",
      data: {
        interests,
      },
    });
  } catch (error) {
    console.error("Get all interests error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to fetch interests",
    });
  }
};

export const getMyInterestsController = async (
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

    const interests = await getMyInterests(req.userId);

    return res.status(200).json({
      success: true,
      message: "Your interests fetched successfully",
      data: {
        interests,
      },
    });
  } catch (error) {
    console.error("Get my interests error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to fetch your interests",
    });
  }
};

export const addMyInterestsController = async (
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

    const body = req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({
        success: false,
        message: "Request body is required. Send JSON body.",
      });
    }

    const { interestIds } = body;

    if (!Array.isArray(interestIds)) {
      return res.status(400).json({
        success: false,
        message: "interestIds must be an array",
      });
    }

    const interests = await addMyInterests(
      req.userId,
      interestIds
    );

    return res.status(200).json({
      success: true,
      message: "Interests updated successfully",
      data: {
        interests,
      },
    });
  } catch (error) {
    console.error("Add interests error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update interests",
    });
  }
};

export const removeMyInterestController = async (
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

    const { interestId } = req.params;

    if (typeof interestId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Interest ID is required",
      });
    }

    const interests = await removeMyInterest(
      req.userId,
      interestId
    );

    return res.status(200).json({
      success: true,
      message: "Interest removed successfully",
      data: {
        interests,
      },
    });
  } catch (error) {
    console.error("Remove interest error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to remove interest",
    });
  }
};