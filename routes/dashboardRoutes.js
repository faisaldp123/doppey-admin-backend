import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

// Define the route
router.get("/stats", getDashboardStats);

export default router;
