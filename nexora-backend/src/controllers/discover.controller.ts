import { Request, Response } from "express";

import {
  getDiscoverProfiles,
} from "../services/discover.service";

export const getDiscoverProfilesController = async (
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

    const profiles = await getDiscoverProfiles(
      req.userId,
      {
        gender:
          typeof req.query.gender === "string"
            ? req.query.gender
            : undefined,

        city:
          typeof req.query.city === "string"
            ? req.query.city
            : undefined,

        relationshipGoal:
          typeof req.query.relationshipGoal === "string"
            ? req.query.relationshipGoal
            : undefined,

        minAge:
          typeof req.query.minAge === "string"
            ? Number(req.query.minAge)
            : undefined,

        maxAge:
          typeof req.query.maxAge === "string"
            ? Number(req.query.maxAge)
            : undefined,

        maxDistanceKm:
          typeof req.query.maxDistanceKm === "string"
            ? Number(req.query.maxDistanceKm)
            : undefined,

        limit:
          typeof req.query.limit === "string"
            ? Number(req.query.limit)
            : undefined,

        offset:
          typeof req.query.offset === "string"
            ? Number(req.query.offset)
            : undefined,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Discover profiles fetched successfully",
      data: {
        profiles,
        count: profiles.length,
      },
    });
  } catch (error) {
    console.error(
      "Discover profiles error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to fetch discover profiles",
    });
  }
};