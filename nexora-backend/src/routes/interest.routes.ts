import { Router } from "express";

import {
  getAllInterestsController,
} from "../controllers/interest.controller";

const router = Router();

router.get("/", getAllInterestsController);

export default router;