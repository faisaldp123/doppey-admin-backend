import express from "express";
import Payment from "../models/Payment.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await Payment.find();
  res.json(data);
});

export default router;
