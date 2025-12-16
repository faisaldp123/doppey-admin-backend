import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, default: 1 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  phone: { type: String, required: true, unique: true },
  isAdmin: { type: Boolean, default: false },

  // OTP flow fields
  otp: { type: String }, // hashed OTP or plain (here plain for demo) — change when productionizing
  otpExpiresAt: { type: Date },

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  cart: [cartItemSchema],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);
