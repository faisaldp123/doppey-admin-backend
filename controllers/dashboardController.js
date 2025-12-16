import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.find()
      .populate("user")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ totalUsers, totalProducts, totalOrders, recentOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
