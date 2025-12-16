import express from "express";
import {
  createProduct,
  getProductsBySubCategory,
  getProductById,
} from "../controllers/productController.js";

import {
  updateProduct,
  deleteProduct,
  getAllProducts,
} from "../controllers/adminProductController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Public Routes
router.get("/subcategory/:slug", getProductsBySubCategory);
router.get("/:id", getProductById);

// Admin Routes
router.post("/", protect, adminOnly, upload.single("image"), createProduct);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.get("/", protect, adminOnly, getAllProducts);

export default router;
