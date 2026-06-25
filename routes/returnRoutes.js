import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getAllReturns,
  getMyReturns,
  getReturnById,
  createReturn,
  updateReturnStatus,
  deleteReturn,
} from "../controllers/returnController.js";

const router = express.Router();

// Cloudinary storage for return images
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "doppey-returns",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// USER
router.post("/",         protect, upload.array("images", 5), createReturn);
router.get("/my",        protect, getMyReturns);
router.get("/:id",       protect, getReturnById);

// ADMIN
router.get("/",          protect, adminOnly, getAllReturns);
router.put("/:id",       protect, adminOnly, updateReturnStatus);
router.delete("/:id",    protect, adminOnly, deleteReturn);

export default router;