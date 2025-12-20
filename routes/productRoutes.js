import express from "express";
import {
  createProduct,
  getProductsBySubCategory,
  getProductBySlug,
} from "../controllers/productController.js";

import {
  updateProduct,
  deleteProduct,
  getAllProducts,
} from "../controllers/productController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/* PUBLIC */
router.get("/subcategory/:slug", getProductsBySubCategory);
router.get("/product/:slug", getProductBySlug);

/* ADMIN */
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 10),
  createProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 10),
  updateProduct
);

router.delete("/:id", protect, adminOnly, deleteProduct);
router.get("/", protect, adminOnly, getAllProducts);

export default router;
