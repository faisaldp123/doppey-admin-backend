import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Allow admin-secret-token
  if (authHeader === "Bearer admin-secret-token") {
    req.user = { isAdmin: true };
    return next();
  }

  // JWT check for user logins
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-otp -otpExpiresAt");

    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.headers.authorization === "Bearer admin-secret-token") {
    return next();
  }

  if (req.user && req.user.isAdmin) return next();

  return res.status(403).json({ message: "Admin access only" });
};
