import { Router } from "express";

import {
  addMyPhotoController,
  deleteMyPhotoController,
  getMyPhotosController,
  makeMyPhotoPrimaryController,
} from "../controllers/photo.controller";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getMyPhotosController);

router.post("/", addMyPhotoController);

router.put(
  "/:photoId/primary",
  makeMyPhotoPrimaryController
);

router.delete(
  "/:photoId",
  deleteMyPhotoController
);

export default router;