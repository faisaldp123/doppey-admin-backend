import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* USER */
router.post("/orders", protect, createOrder);
router.get("/orders", protect, getMyOrders);

/* ADMIN */
router.get("/admin/orders", protect, getAllOrders);
router.put("/admin/orders/:id", protect, updateOrderStatus);

export default router;
