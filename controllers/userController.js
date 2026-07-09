import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import axios from "axios";
import admin from "firebase-admin";

/* ================= OTP HELPERS ================= */

const genOTP = (digits = 6) => {
  const max = 10 ** digits;
  const num =
    Math.floor(Math.random() * (max - 10 ** (digits - 1))) +
    10 ** (digits - 1);
  return String(num);
};

const normalizeIndianPhone = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return "";
};

const formatMsg91Mobile = (phone = "") => `91${phone}`;

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, phone: user.phone, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const getFirebaseAdmin = () => {
  if (admin.apps.length) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) return null;

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
};

/* ================= AUTH ================= */

export const requestOTP = async (req, res) => {
  const phone = normalizeIndianPhone(req.body.phone);
  if (!phone) {
    return res.status(400).json({ message: "Valid 10-digit phone is required" });
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (authKey && templateId) {
    try {
      const formattedPhone = formatMsg91Mobile(phone);
      await axios.post(`https://control.msg91.com/api/v5/otp`, {}, {
        params: {
          template_id: templateId,
          mobile: formattedPhone,
          authkey: authKey,
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(`MSG91 OTP sent to ${formattedPhone}`);
      
      // Upsert the user so they exist in database
      await User.findOneAndUpdate(
        { phone },
        { phone },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      
      return res.json({ message: "OTP sent via MSG91" });
    } catch (err) {
      console.error("MSG91 OTP send failed:", err.response?.data || err.message);
      return res.status(500).json({ message: "Failed to send OTP via MSG91" });
    }
  }

  // Development Fallback flow
  const otp = genOTP(6);
  const otpExpiresMin = parseInt(process.env.OTP_EXPIRES_MIN || "10", 10);
  const otpExpiresAt = new Date(Date.now() + otpExpiresMin * 60 * 1000);

  await User.findOneAndUpdate(
    { phone },
    { phone, otp, otpExpiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`[DEVELOPMENT FALLBACK] OTP for ${phone}: ${otp}`);

  res.json({ message: "OTP sent" });
};

export const verifyOTP = async (req, res) => {
  const phone = normalizeIndianPhone(req.body.phone);
  const { otp } = req.body;
  if (!phone || !otp)
    return res.status(400).json({ message: "Valid phone and OTP required" });

  const authKey = process.env.MSG91_AUTH_KEY;

  if (authKey) {
    try {
      const formattedPhone = formatMsg91Mobile(phone);
      const response = await axios.get(`https://control.msg91.com/api/v5/otp/verify`, {
        params: {
          otp,
          mobile: formattedPhone,
        },
        headers: {
          authkey: authKey,
        }
      });

      if (response.data?.type !== "success") {
        return res.status(400).json({ message: response.data?.message || "Invalid OTP" });
      }
    } catch (err) {
      console.error("MSG91 OTP verification failed:", err.response?.data || err.message);
      return res.status(400).json({ message: "OTP verification failed or expired" });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
      },
    });
  }

  // Development Fallback verification
  const user = await User.findOne({ phone });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!user.otp || !user.otpExpiresAt)
    return res.status(400).json({ message: "OTP not requested" });

  if (new Date() > user.otpExpiresAt) {
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    return res.status(400).json({ message: "OTP expired" });
  }

  if (otp !== user.otp)
    return res.status(400).json({ message: "Invalid OTP" });

  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const token = signToken(user);

  res.json({
    token,
    user: {
      id: user._id,
      phone: user.phone,
      role: user.role,
    },
  });
};

export const verifyFirebaseOTP = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Firebase ID token is required" });
    }

    const firebaseApp = getFirebaseAdmin();
    if (!firebaseApp) {
      return res.status(500).json({
        message: "Firebase Admin is not configured on backend",
      });
    }

    const decoded = await firebaseApp.auth().verifyIdToken(idToken);
    const phone = normalizeIndianPhone(decoded.phone_number || "");

    if (!phone) {
      return res.status(400).json({ message: "Firebase token does not include a valid phone number" });
    }

    const user = await User.findOneAndUpdate(
      { phone },
      { phone },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("FIREBASE OTP VERIFY FAILED:", err.message);
    res.status(401).json({ message: "Firebase OTP verification failed" });
  }
};

/* ================= PROFILE ================= */

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("cart.product")
    .populate("wishlist")
    .populate({
      path: "orders",
      populate: { path: "items.product", model: "Product" },
    });

  res.json(user);
};


export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // check duplicate email
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    await user.save();

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

/* ================= WISHLIST ================= */

export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user?.wishlist || []);
};

export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ message: "Product is required" });
  }

  const user = await User.findById(req.user._id);

  if (!user.wishlist.some((id) => id.toString() === productId)) {
    user.wishlist.push(productId);
    await user.save();
  }

  const updatedUser = await User.findById(req.user._id).populate("wishlist");

  res.json({ message: "Added to wishlist", wishlist: updatedUser.wishlist });
};

export const removeFromWishlist = async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ message: "Product is required" });
  }

  const user = await User.findById(req.user._id);

  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId
  );
  await user.save();

  const updatedUser = await User.findById(req.user._id).populate("wishlist");

  res.json({ message: "Removed from wishlist", wishlist: updatedUser.wishlist });
};

/* ================= CART ================= */

export const getCart = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.user._id).populate("cart.product");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json(user.cart || []);
  } catch (err) {
    console.error("Get Cart Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const user = await User.findById(req.user._id);

  const index = user.cart.findIndex(
    (ci) => ci.product.toString() === productId
  );

  if (index > -1) {
    user.cart[index].quantity += quantity;
  } else {
    user.cart.push({ product: productId, quantity });
  }

  await user.save();
  res.json({ message: "Cart updated", cart: user.cart });
};

export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const user = await User.findById(req.user._id);

  const idx = user.cart.findIndex(
    (ci) => ci.product.toString() === productId
  );

  if (idx === -1)
    return res.status(404).json({ message: "Product not in cart" });

  if (quantity <= 0) user.cart.splice(idx, 1);
  else user.cart[idx].quantity = quantity;

  await user.save();
  res.json({ message: "Cart updated", cart: user.cart });
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);

  user.cart = user.cart.filter(
    (ci) => ci.product.toString() !== productId
  );

  await user.save();
  res.json({ message: "Removed from cart", cart: user.cart });
};

export const clearCart = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();

  res.json({ message: "Cart cleared" });
};

/* ================= ORDERS ================= */

export const createOrder = async (req, res) => {
  const { items, address } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ message: "Order must have items" });
  }

  const totalAmount = items.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );

  const order = await Order.create({
    user: req.user._id,
    items,
    totalAmount,
    status: "Placed",
    address,
    phone: req.user.phone,
  });

  const user = await User.findById(req.user._id)
  .populate("wishlist");
  user.orders.push(order._id);
  user.cart = [];
  await user.save();

  res.status(201).json({ message: "Order placed", order });
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate(
    "items.product"
  );
  res.json(orders);
};

/* ================= ADMIN ================= */

/**
 * GET ALL USERS (ADMIN)
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
  const users = await User.find({ role: { $ne: "admin" } })
    .select("-otp -otpExpiresAt")
    .sort({ createdAt: -1 });

  res.json(users);
};

export const googleLogin = async (req, res) => {
  const { email, name = "", googleId = "", photo = "" } = req.body;
  if (!email) return res.status(400).json({ message: "Google email is required" });

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { email: email.toLowerCase(), name, googleId, photo },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const token = signToken(user);

  res.json({
    token,
    user: {
      id: user._id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
};
