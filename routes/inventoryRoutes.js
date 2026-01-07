import express from "express";
import Inventory from "../models/Inventory.js";

const router = express.Router();

// Get all inventory
router.get("/", async (req, res) => {
  const data = await Inventory.find().populate("product warehouse");
  res.json(data);
});

// Update stock
router.put("/:id", async (req, res) => {
  const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

export default router;
