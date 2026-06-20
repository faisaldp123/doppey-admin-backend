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

// Cloudinary storage — separate folders for desktop/mobile
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: file.fieldname === "desktopImage"
      ? "doppey-banners/desktop"
      : "doppey-banners/mobile",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  }),
});

const upload = multer({ storage });

// PUBLIC
router.get("/public", getPublicBanners);

// ADMIN
router.get(   "/",     protect, adminOnly, getAllBanners);
router.post(  "/",     protect, adminOnly, upload.fields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage",  maxCount: 1 },
]), createBanner);
router.put(   "/:id",  protect, adminOnly, upload.fields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage",  maxCount: 1 },
]), updateBanner);
router.delete("/:id",  protect, adminOnly, deleteBanner);

export default router;