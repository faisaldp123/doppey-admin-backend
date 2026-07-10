import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

import {
  getPublicBrandStories,
  getAllBrandStories,
  createBrandStory,
  updateBrandStory,
  deleteBrandStory,
} from "../controllers/brandStoryController.js";

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "doppey-brand-stories",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

router.get("/public", getPublicBrandStories);

router.get("/", protect, adminOnly, getAllBrandStories);

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

router.delete("/:id", protect, adminOnly, deleteBrandStory);

export default router;