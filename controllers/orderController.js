import Order from "../models/Order.js";
import { createDelhiveryShipment } from "../services/delhiveryService.js";

/* ================= USER ================= */

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      address,
      shipping = 0,
      codCharge = 0,
      paymentMethod = "cod",
      total,
    } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({
          message: "No items in order",
        });
    }

    if (!address || !address.fullName) {
      return res
        .status(400)
        .json({
          message: "Address required",
        });
    }

    const itemsTotal = items.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    );

    const finalTotal =
      total ||
      itemsTotal +
        Number(shipping) +
        Number(codCharge);

    const order = await Order.create({
  user: req.user._id,

  items,

  address,

  shipping,

  codCharge,

  paymentMethod,

  totalAmount: finalTotal,

  waybill: "",

  trackingStatus: "Pending",

  status: "Placed",
});

    try {
  const shipment =
    await createDelhiveryShipment(order);

  console.log(
    "DELHIVERY RESPONSE:"
  );

  console.log(shipment);

  if (shipment?.packages?.[0]?.waybill) {
    order.waybill =
      shipment.packages[0].waybill;

    order.trackingStatus =
      "Created";

    await order.save();
  }
} catch (err) {
  console.log(
    "DELHIVERY SHIPMENT FAILED"
  );

  console.log(
    err.response?.data || err.message
  );
}

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// GET MY ORDERS
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product", "name price")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// GET ORDER BY ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name price images sizes");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!req.user.isAdmin && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
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
