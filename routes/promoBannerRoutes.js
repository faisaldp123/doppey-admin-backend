import express from "express";
import upload from "../middleware/upload.js";

import {
  protect,
  adminOnly,
} from "../middleware/auth.js";

import {
  getPublicPromoBanners,
  getAllPromoBanners,
  createPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
} from "../controllers/promoBannerController.js";

const router = express.Router();

router.get("/public", getPublicPromoBanners);

router.get(
  "/",
  protect,
  adminOnly,
  getAllPromoBanners
);

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

router.delete(
  "/:id",
  protect,
  adminOnly,
  deletePromoBanner
);

export default router;