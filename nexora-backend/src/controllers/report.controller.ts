import { Request, Response } from "express";

import {
  createReport,
  getMyReports,
} from "../services/report.service";

const getAuthenticatedUserId = (
  req: Request,
  res: Response
): string | null => {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return null;
  }

  return req.userId;
};

const getUserIdParam = (
  req: Request,
  res: Response
): string | null => {
  const { userId } = req.params;

  if (typeof userId !== "string" || !userId.trim()) {
    res.status(400).json({
      success: false,
      message: "Valid user ID is required",
    });

    return null;
  }

  return userId;
};

export const createReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return;
    }

    const targetUserId = getUserIdParam(req, res);

    if (!targetUserId) {
      return;
    }

    const report = await createReport(
      userId,
      targetUserId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "User reported successfully",
      data: report,
    });
  } catch (error) {
    console.error("Create report error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to report user";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const getMyReportsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return;
    }

    const reports = await getMyReports(userId);

    return res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      data: reports,
    });
  } catch (error) {
    console.error("Get reports error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch reports";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};