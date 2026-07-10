import express from "express";
import upload from "../middleware/upload.js";
import {
  protect,
  adminOnly,
} from "../middleware/auth.js";

import {
  getPublicCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/shopCategoryController.js";

const router = express.Router();

router.get("/public", getPublicCategories);

router.get(
  "/",
  protect,
  adminOnly,
  getAllCategories
);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  createCategory
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateCategory
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCategory
);

export default router;