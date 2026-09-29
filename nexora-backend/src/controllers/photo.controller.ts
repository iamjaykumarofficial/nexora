import { Request, Response } from "express";

import {
  addMyPhoto,
  deleteMyPhoto,
  getMyPhotos,
  makeMyPhotoPrimary,
} from "../services/photo.service";

export const getMyPhotosController = async (
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

    const photos = await getMyPhotos(req.userId);

    return res.status(200).json({
      success: true,
      message: "Photos fetched successfully",
      data: {
        photos,
      },
    });
  } catch (error) {
    console.error("Get photos error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to fetch photos",
    });
  }
};

export const addMyPhotoController = async (
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

    const { url, position } = body as {
      url?: unknown;
      position?: unknown;
    };

    const photo = await addMyPhoto(
      req.userId,
      url,
      position
    );

    return res.status(201).json({
      success: true,
      message: "Photo added successfully",
      data: {
        photo,
      },
    });
  } catch (error) {
    console.error("Add photo error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to add photo",
    });
  }
};

export const makeMyPhotoPrimaryController = async (
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

    const { photoId } = req.params;

    if (typeof photoId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Photo ID is required",
      });
    }

    const photos = await makeMyPhotoPrimary(
      req.userId,
      photoId
    );

    return res.status(200).json({
      success: true,
      message: "Primary photo updated successfully",
      data: {
        photos,
      },
    });
  } catch (error) {
    console.error("Make primary photo error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update primary photo",
    });
  }
};

export const deleteMyPhotoController = async (
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

    const { photoId } = req.params;

    if (typeof photoId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Photo ID is required",
      });
    }

    const photos = await deleteMyPhoto(
      req.userId,
      photoId
    );

    return res.status(200).json({
      success: true,
      message: "Photo deleted successfully",
      data: {
        photos,
      },
    });
  } catch (error) {
    console.error("Delete photo error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to delete photo",
    });
  }
};