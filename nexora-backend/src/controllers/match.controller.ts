import { Request, Response } from "express";

import {
  getMyMatches,
} from "../services/match.service";

export const getMyMatchesController =
  async (
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

      const matches = await getMyMatches(
        req.userId
      );

      return res.status(200).json({
        success: true,
        message:
          "Matches fetched successfully",
        data: {
          matches,
          count: matches.length,
        },
      });
    } catch (error) {
      console.error(
        "Get matches error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch matches",
      });
    }
  };