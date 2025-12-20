import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

import categoryRoutes from "./routes/categoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();
connectDB();

// create express app BEFORE using it
const app = express();

// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// ================================
// ADMIN LOGIN ROUTE (PASSWORD ONLY)
// ================================
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;

  console.log("Received password:", password);
  console.log("Admin Password:", process.env.ADMIN_PASSWORD);

  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ token: "admin-secret-token" });
  }

  return res.status(401).json({ message: "Invalid password" });
});

// ROUTES
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api", userRoutes);;
app.use("/api/dashboard", dashboardRoutes);

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
