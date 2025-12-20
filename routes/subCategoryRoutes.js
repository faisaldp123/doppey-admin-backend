import express from "express";
import { createSubCategory, getSubCategories } from "../controllers/subCategoryController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js"; // ✅ Import middlewares

const router = express.Router();

// Admin-protected route to create subcategory
router.post("/", protect, adminOnly, createSubCategory);

// Public route to get all subcategories
router.get("/", getSubCategories);

export default router;
