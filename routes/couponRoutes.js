import express from "express";
import {
  createCoupon,
  getCoupons,
  getPublicCoupons,
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

/* ========== PUBLIC / STOREFRONT ROUTE ========== */
// Returns only active, non-expired, non-exhausted coupons.
// Used by the checkout page's coupon dropdown.
router.get("/coupons/public", getPublicCoupons);

/* ========== USER ROUTE ========== */
router.post("/coupons/apply", protect, applyCoupon);

export default router;