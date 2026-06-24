import express from "express";
import {
  requestOTP,
  verifyOTP,
  googleLogin,
  getProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getAllUsers
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth via phone OTP
router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTP);
router.post("/google-login", googleLogin);

// Protected user routes
router.get("/profile", protect, getProfile);

// Wishlist
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist", protect, addToWishlist);
router.post("/wishlist/add", protect, addToWishlist);
router.post("/wishlist/remove", protect, removeFromWishlist);

// Cart
router.get("/cart", protect, getCart);
router.post("/cart/add", protect, addToCart);
router.post("/cart/update", protect, updateCartItem);
router.post("/cart/remove", protect, removeFromCart);
router.post("/cart/clear", protect, clearCart);

// Orders

// ✅ SIMPLE GET ALL USERS API
router.get("/users", protect, getAllUsers);

export default router;
