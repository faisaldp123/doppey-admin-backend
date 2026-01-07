import express from "express";
import Return from "../models/Return.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await Return.find().populate("product");
  res.json(data);
});

router.post("/", async (req, res) => {
  const created = await Return.create(req.body);
  res.json(created);
});

export default router;
