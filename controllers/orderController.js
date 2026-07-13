import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createBlueDartShipment } from "../services/bluedartService.js"; // ← ADD THIS IMPORT

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
      return res.status(400).json({ message: "No items in order" });
    }

    if (!address || !address.fullName) {
      return res.status(400).json({ message: "Address required" });
    }

    const requestedStock = new Map();
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!item.product || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Each order item needs a valid product and quantity" });
      }
      const productId = String(item.product);
      requestedStock.set(productId, (requestedStock.get(productId) || 0) + quantity);
    }

    // Atomic conditional updates prevent concurrent orders from overselling.
    const reservedStock = [];
    try {
      for (const [productId, quantity] of requestedStock) {
        const product = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true }
        );
        if (!product) throw new Error("One or more products are out of stock or have insufficient quantity");
        reservedStock.push({ productId, quantity });
      }
    } catch (stockError) {
      await Promise.all(reservedStock.map(({ productId, quantity }) =>
        Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } })
      ));
      return res.status(409).json({ message: stockError.message });
    }

    const itemsTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const finalTotal =
  itemsTotal +
  Number(shipping || 0) +
  Number(codCharge || 0);

  console.log("ORDER ITEMS:", items);
console.log("ITEMS TOTAL:", itemsTotal);
console.log("SHIPPING:", shipping);
console.log("COD:", codCharge);
console.log("FRONTEND TOTAL:", total);
console.log("FINAL TOTAL:", finalTotal);

    let order;
    try {
      order = await Order.create({
      user:           req.user._id,
      items,
      address,
      shipping,
      codCharge,
      paymentMethod,
      totalAmount:    finalTotal,
      waybill:        "",
      trackingStatus: "Pending",
      status:         "Placed",
      });
    } catch (orderError) {
      await Promise.all(reservedStock.map(({ productId, quantity }) =>
        Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } })
      ));
      throw orderError;
    }

    // ← BLUEDART INTEGRATION ADDED HERE
    try {
      const shipment = await createBlueDartShipment(order);

      console.log(
  "BLUEDART RESPONSE:",
  JSON.stringify(shipment, null, 2)
);

      const waybill =
        shipment?.waybill        ||
        shipment?.ShipmentNumber ||
        shipment?.AWBNo          ||
        shipment?.waybillNo      ||
        "";

      console.log("EXTRACTED WAYBILL IN CONTROLLER:", waybill);

if (waybill) {
  console.log("SETTING AWB ON ORDER:", order._id);

  order.waybill = String(waybill);
  order.trackingStatus = "Created";

  console.log("BEFORE SAVE:", {
    waybill: order.waybill,
    trackingStatus: order.trackingStatus,
  });

  await order.save();

  const updatedOrder = await Order.findById(order._id);

  console.log("AFTER SAVE:", {
    waybill: updatedOrder?.waybill,
    trackingStatus: updatedOrder?.trackingStatus,
  });
} else {
  console.log("NO WAYBILL FOUND");
}
    } catch (err) {
      // BlueDart failure does NOT block the order
      // Order is already saved to MongoDB above
      console.error("BLUEDART FAILED:", err.response?.data || err.message);
    }

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET MY ORDERS
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ORDER BY ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name price images sizes");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      !req.user.isAdmin &&
      order.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= ADMIN ================= */

// GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "phone")
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const wasCancelled = order.status === "Cancelled";
    order.status = status;

    if (status === "Cancelled" && !wasCancelled && !order.stockRestored) {
      await Promise.all(order.items.map((item) =>
        Product.findByIdAndUpdate(item.product, { $inc: { stock: Number(item.quantity) || 0 } })
      ));
      order.stockRestored = true;
    }
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
