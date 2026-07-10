import express from "express";
import upload from "../middleware/upload.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

import {
  getPublicLifestyleSections,
  getAllLifestyleSections,
  createLifestyleSection,
  updateLifestyleSection,
  deleteLifestyleSection,
} from "../controllers/lifestyleSectionController.js";

const router = express.Router();

router.get(
  "/public",
  getPublicLifestyleSections
);

router.get(
  "/",
  protect,
  adminOnly,
  getAllLifestyleSections
);

router.post(
  "/",
  protect,
  adminOnly,
  upload.fields([
    {
      name: "leftImage",
      maxCount: 1,
    },
    {
      name: "rightTopImage",
      maxCount: 1,
    },
    {
      name: "rightBottomImage",
      maxCount: 1,
    },
  ]),
  createLifestyleSection
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.fields([
    {
      name: "leftImage",
      maxCount: 1,
    },
    {
      name: "rightTopImage",
      maxCount: 1,
    },
    {
      name: "rightBottomImage",
      maxCount: 1,
    },
  ]),
  updateLifestyleSection
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteLifestyleSection
);

export default router;