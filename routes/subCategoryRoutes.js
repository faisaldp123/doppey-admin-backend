import express from "express";
import { createSubCategory, getSubCategories } from "../controllers/subCategoryController.js";
const router = express.Router();

router.post("/", createSubCategory);
router.get("/", getSubCategories);

export default router;
