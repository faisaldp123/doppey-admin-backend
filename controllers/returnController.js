import Return from "../models/Return.js";
import Order from "../models/Order.js";
import { v2 as cloudinary } from "cloudinary";

// GET all returns (admin)
export const getAllReturns = async (req, res) => {
  try {
    const returns = await Return.find()
  .populate("product")
  .populate("orderId")
  .populate("user", "name phone email")
  .sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET returns by user
export const getMyReturns = async (req, res) => {
  try {
    const returns = await Return.find({ user: req.user._id })
      .populate("product")
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single return
export const getReturnById = async (req, res) => {
  try {
    const ret = await Return.findById(req.params.id)
      .populate({
        path: "product",
        select: "name price images",
      })
      .populate({
        path: "orderId",
      })
      .populate({
        path: "user",
        select: "name phone email",
      });

    if (!ret) {
      return res.status(404).json({
        message: "Return not found",
      });
    }

    res.json(ret);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

// POST create return request
export const createReturn = async (req, res) => {
  try {
    const { orderId, productId, reason, comment } = req.body;

    if (!orderId || !productId || !reason) {
      return res.status(400).json({
        message: "Order ID, product and reason are required",
      });
    }

    // Upload images to cloudinary if provided
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        imageUrls.push(file.path); // multer-cloudinary sets path to cloudinary URL
      }
    }

    const returnRequest = await Return.create({
      orderId,
      product:  productId,
      user:     req.user._id,
      reason,
      comment,
      images:   imageUrls,
      status:   "Pending",
    });

    res.status(201).json(returnRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT update return status (admin)
export const updateReturnStatus = async (req, res) => {
  try {
    const {
  status,
  adminRemark,
  refundAmount,
  refundMethod,
  refundTransactionId,
  refundDate,
} = req.body;

const ret = await Return.findByIdAndUpdate(
  req.params.id,
  {
    status,
    adminRemark,
    refundAmount,
    refundMethod,
    refundTransactionId,
    refundDate,
  },
  { new: true }
);
    if (!ret) return res.status(404).json({ message: "Return not found" });
    res.json(ret);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE return (admin)
export const deleteReturn = async (req, res) => {
  try {
    await Return.findByIdAndDelete(req.params.id);
    res.json({ message: "Return deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};