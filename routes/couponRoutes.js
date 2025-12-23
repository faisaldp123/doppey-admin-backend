import express from "express";
import {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} from "../controllers/couponController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ========== ADMIN ROUTES ========== */
router.post("/coupons", protect, adminOnly, createCoupon);
router.get("/coupons", protect, adminOnly, getCoupons);
router.put("/coupons/:id", protect, adminOnly, updateCoupon);
router.delete("/coupons/:id", protect, adminOnly, deleteCoupon);

/* ========== USER ROUTE ========== */
router.post("/coupons/apply", protect, applyCoupon);

export default router;
