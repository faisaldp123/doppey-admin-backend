import express from "express";
import Warehouse from "../models/Warehouse.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await Warehouse.find();
  res.json(data);
});

router.post("/", async (req, res) => {
  const created = await Warehouse.create(req.body);
  res.json(created);
});

export default router;
