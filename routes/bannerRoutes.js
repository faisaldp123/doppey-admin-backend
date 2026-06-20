import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getPublicBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (file.fieldname === "desktopImages") {
      return { folder: "doppey-banners/desktop", allowed_formats: ["jpg", "jpeg", "png", "webp"] };
    }
    if (file.fieldname === "mobileImages") {
      return { folder: "doppey-banners/mobile", allowed_formats: ["jpg", "jpeg", "png", "webp"] };
    }
    if (file.fieldname === "video") {
      return { folder: "doppey-banners/videos", resource_type: "video", allowed_formats: ["mp4", "webm", "mov"] };
    }
  },
});

const upload = multer({ storage });

// PUBLIC
router.get("/public", getPublicBanners);

// ADMIN
router.get("/",      protect, adminOnly, getAllBanners);
router.post("/",     protect, adminOnly, upload.fields([
  { name: "desktopImages", maxCount: 4 },
  { name: "mobileImages",  maxCount: 4 },
  { name: "video",         maxCount: 1 },
]), createBanner);
router.put("/:id",   protect, adminOnly, upload.fields([
  { name: "desktopImages", maxCount: 4 },
  { name: "mobileImages",  maxCount: 4 },
  { name: "video",         maxCount: 1 },
]), updateBanner);
router.delete("/:id", protect, adminOnly, deleteBanner);

export default router;