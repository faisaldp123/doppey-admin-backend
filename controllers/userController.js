import User from "../models/User.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const genOTP = (digits = 6) => {
  const max = 10 ** digits;
  const num = Math.floor(Math.random() * (max - 10 ** (digits - 1))) + 10 ** (digits - 1);
  return String(num);
};

const signToken = (user) => {
  return jwt.sign({ id: user._id, phone: user.phone }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

export const requestOTP = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone is required" });

  const otp = genOTP(6);
  const otpExpiresMin = parseInt(process.env.OTP_EXPIRES_MIN || "10", 10);
  const otpExpiresAt = new Date(Date.now() + otpExpiresMin * 60 * 1000);

  // Upsert user record (creates user if not exists)
  const user = await User.findOneAndUpdate(
    { phone },
    { phone, otp, otpExpiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // TODO: Replace console.log with SMS provider (Twilio, MSG91 etc.)
  console.log(`OTP for ${phone}: ${otp} (expires in ${otpExpiresMin} minutes)`);

  return res.json({ message: "OTP sent (check server console in dev)" });
};

export const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP required" });

  const user = await User.findOne({ phone });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.otp || !user.otpExpiresAt) return res.status(400).json({ message: "OTP not requested" });

  if (new Date() > user.otpExpiresAt) {
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    return res.status(400).json({ message: "OTP expired" });
  }

  if (otp !== user.otp) return res.status(400).json({ message: "Invalid OTP" });

  // success — clear otp and return JWT
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const token = signToken(user);
  res.json({
    token,
    user: {
      id: user._id,
      phone: user.phone,
      name: user.name,
      wishlist: user.wishlist,
      cart: user.cart
    }
  });
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "cart.product wishlist orders",
    populate: { path: "product", model: "Product" }
  });
  res.json(user);
};

// Wishlist
export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.wishlist.includes(productId)) {
    return res.status(400).json({ message: "Already in wishlist" });
  }

  user.wishlist.push(productId);
  await user.save();
  res.json({ message: "Added to wishlist", wishlist: user.wishlist });
};

export const removeFromWishlist = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  await user.save();
  res.json({ message: "Removed from wishlist", wishlist: user.wishlist });
};

// Cart
export const getCart = async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart.product");
  res.json(user.cart);
};

export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const user = await User.findById(req.user._id);

  const existingIndex = user.cart.findIndex(ci => ci.product.toString() === productId);
  if (existingIndex > -1) {
    user.cart[existingIndex].quantity += quantity;
  } else {
    user.cart.push({ product: productId, quantity });
  }
  await user.save();
  res.json({ message: "Cart updated", cart: user.cart });
};

export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const user = await User.findById(req.user._id);
  const idx = user.cart.findIndex(ci => ci.product.toString() === productId);
  if (idx === -1) return res.status(404).json({ message: "Product not in cart" });
  if (quantity <= 0) {
    // remove
    user.cart.splice(idx, 1);
  } else {
    user.cart[idx].quantity = quantity;
  }
  await user.save();
  res.json({ message: "Cart updated", cart: user.cart });
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter(ci => ci.product.toString() !== productId);
  await user.save();
  res.json({ message: "Removed from cart", cart: user.cart });
};

export const clearCart = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();
  res.json({ message: "Cart cleared" });
};

// Orders
export const createOrder = async (req, res) => {
  const { items, address, phone: phoneFromReq } = req.body;
  /*
    Expect items: [{ product: productId, quantity, price }]
    For a simpler flow you may compute prices here from product DB for security.
  */
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order must have items" });
  }

  // compute total
  const totalAmount = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);

  const order = await Order.create({
    user: req.user._id,
    items,
    totalAmount,
    status: "Placed",
    address: address || "",
    phone: phoneFromReq || req.user.phone
  });

  // link to user
  const user = await User.findById(req.user._id);
  user.orders.push(order._id);
  // Optionally clear cart
  user.cart = [];
  await user.save();

  res.status(201).json({ message: "Order placed", order });
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate("items.product");
  res.json(orders);
};
