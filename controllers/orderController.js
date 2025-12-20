import Order from "../models/Order.js";

/* ================= USER ================= */

// CREATE ORDER
export const createOrder = async (req, res) => {
  const { items, address } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No items in order" });
  }

  if (!address || !address.fullName) {
    return res.status(400).json({ message: "Address required" });
  }

  const totalAmount = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const order = await Order.create({
    user: req.user._id,
    items,
    totalAmount,
    address,
    status: "Placed",
  });

  res.status(201).json(order);
};

// GET MY ORDERS
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product", "name price")
    .sort({ createdAt: -1 });

  res.json(orders);
};

/* ================= ADMIN ================= */

// GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "phone")
    .populate("items.product", "name price")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  await order.save();

  res.json(order);
};
