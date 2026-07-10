import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

import {
  getPublicPromoBanners,
  getAllPromoBanners,
  createPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
} from "../controllers/promoBannerController.js";

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "doppey-promo-banners",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

router.get("/public", getPublicPromoBanners);

router.get("/", protect, adminOnly, getAllPromoBanners);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("backgroundImage"),
  createPromoBanner
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("backgroundImage"),
  updatePromoBanner
);

router.delete("/:id", protect, adminOnly, deletePromoBanner);

export default router;