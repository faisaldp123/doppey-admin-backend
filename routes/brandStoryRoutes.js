import express from "express";
import upload from "../middleware/upload.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

import {
  getPublicBrandStories,
  getAllBrandStories,
  createBrandStory,
  updateBrandStory,
  deleteBrandStory,
} from "../controllers/brandStoryController.js";

const router = express.Router();

router.get(
  "/public",
  getPublicBrandStories
);

router.get(
  "/",
  protect,
  adminOnly,
  getAllBrandStories
);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  createBrandStory
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateBrandStory
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteBrandStory
);

export default router;