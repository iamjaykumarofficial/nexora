import { Request, Response } from "express";

import {
  acceptDateInvite,
  cancelDateInvite,
  createDateInvite,
  declineDateInvite,
  getDateInviteByIdForUser,
  getMyDateInvites,
} from "../services/date-invite.service";

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

const getInviteId = (
  req: Request,
  res: Response
): string | null => {
  const { inviteId } = req.params;

  if (typeof inviteId !== "string" || !inviteId.trim()) {
    res.status(400).json({
      success: false,
      message: "Valid invite ID is required",
    });

    return null;
  }

  return inviteId;
};

export const createDateInviteController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return;
    }

    const invite = await createDateInvite(
      userId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Date invite sent successfully",
      data: invite,
    });
  } catch (error) {
    console.error(
      "Create date invite error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create date invite";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const getMyDateInvitesController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return;
    }

    const invites = await getMyDateInvites(
      userId,
      req.query.status
    );

    return res.status(200).json({
      success: true,
      message: "Date invites fetched successfully",
      data: invites,
    });
  } catch (error) {
    console.error(
      "Get date invites error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch date invites";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const getDateInviteByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return;
    }

    const inviteId = getInviteId(req, res);

    if (!inviteId) {
      return;
    }

    const invite = await getDateInviteByIdForUser(
      userId,
      inviteId
    );

    return res.status(200).json({
      success: true,
      message: "Date invite fetched successfully",
      data: invite,
    });
  } catch (error) {
    console.error(
      "Get date invite error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch date invite";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const acceptDateInviteController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return;
    }

    const inviteId = getInviteId(req, res);

    if (!inviteId) {
      return;
    }

    const invite = await acceptDateInvite(
      userId,
      inviteId
    );

    return res.status(200).json({
      success: true,
      message: "Date invite accepted successfully",
      data: invite,
    });
  } catch (error) {
    console.error(
      "Accept date invite error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to accept date invite";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const declineDateInviteController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return;
    }

    const inviteId = getInviteId(req, res);

    if (!inviteId) {
      return;
    }

    const invite = await declineDateInvite(
      userId,
      inviteId
    );

    return res.status(200).json({
      success: true,
      message: "Date invite declined successfully",
      data: invite,
    });
  } catch (error) {
    console.error(
      "Decline date invite error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to decline date invite";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const cancelDateInviteController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return;
    }

    const inviteId = getInviteId(req, res);

    if (!inviteId) {
      return;
    }

    const invite = await cancelDateInvite(
      userId,
      inviteId
    );

    return res.status(200).json({
      success: true,
      message: "Date invite cancelled successfully",
      data: invite,
    });
  } catch (error) {
    console.error(
      "Cancel date invite error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to cancel date invite";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};