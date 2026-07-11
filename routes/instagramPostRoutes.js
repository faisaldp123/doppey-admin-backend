import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

import {
  getPublicInstagramPosts,
  getAllInstagramPosts,
  createInstagramPost,
  updateInstagramPost,
  deleteInstagramPost,
} from "../controllers/instagramPostController.js";

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "doppey-instagram-posts",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

router.get("/public", getPublicInstagramPosts);

router.get("/", protect, adminOnly, getAllInstagramPosts);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  createInstagramPost
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateInstagramPost
);

router.delete("/:id", protect, adminOnly, deleteInstagramPost);

export default router;