import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductsBySubCategory,
  getProductBySlug,
  getBestSellers,
  getNewArrivals,
  getPublicProducts,
} from "../controllers/productController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/* ── PUBLIC ── */
router.get("/best-sellers",          getBestSellers);
router.get("/new-arrivals",          getNewArrivals);
router.get("/subcategory/:slug",     getProductsBySubCategory);
router.get("/product/:slug",         getProductBySlug);

/* ── ADMIN ── */
router.get(   "/",   protect, adminOnly, getAllProducts);
router.get("/public", getPublicProducts);
router.post(
  "/",
  protect,
  adminOnly,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  createProduct
);
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  updateProduct
);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
