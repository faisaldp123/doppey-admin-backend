import express from "express";
import { trackOrder } from "../controllers/trackingController.js";

const router = express.Router();

router.get("/track/:id", trackOrder);

export default router;