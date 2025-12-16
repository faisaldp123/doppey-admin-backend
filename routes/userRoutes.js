import express from "express";
import {
  requestOTP, verifyOTP, getProfile,
  addToWishlist, removeFromWishlist,
  getCart, addToCart, updateCartItem, removeFromCart, clearCart,
  createOrder, getMyOrders
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth via phone OTP
router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTP);

// Protected user routes
router.get("/profile", protect, getProfile);

// Wishlist
router.post("/wishlist/add", protect, addToWishlist);
router.post("/wishlist/remove", protect, removeFromWishlist);

// Cart
router.get("/cart", protect, getCart);
router.post("/cart/add", protect, addToCart);
router.post("/cart/update", protect, updateCartItem);
router.post("/cart/remove", protect, removeFromCart);
router.post("/cart/clear", protect, clearCart);

// Orders
router.post("/orders", protect, createOrder);
router.get("/orders", protect, getMyOrders);

export default router;
